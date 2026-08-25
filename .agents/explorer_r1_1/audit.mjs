import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const PROJECT_ROOT = "/Users/madecolombia/Developer/TailorCV";
const SRC_ROOT = path.join(PROJECT_ROOT, "src");

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = getAllFiles(SRC_ROOT);
const tsFiles = allFiles.filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));

// Resolve import specifier to file path
function resolveImport(importingFile, specifier) {
  let target = null;
  if (specifier.startsWith("@/")) {
    target = path.join(SRC_ROOT, specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    target = path.resolve(path.dirname(importingFile), specifier);
  } else {
    return null;
  }

  const extensions = ["", ".ts", ".tsx", ".d.ts", "/index.ts", "/index.tsx"];
  for (const ext of extensions) {
    const candidate = target + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return path.normalize(candidate);
    }
  }
  return null;
}

// Data structures
// File path -> AST SourceFile
const sourceFiles = new Map();
// File path -> { namedImports: [{ name, propertyName, file }], defaultImport: string, namespaceImport: string, rawSpecifiers: [] }
const fileImportDecls = new Map();
// File path -> [{ name, kind, line, col, isDefault, isTypeOnly }]
const fileExports = new Map();
// File path -> Set of all identifier tokens in the file
const fileIdentifierTokens = new Map();

for (const filePath of tsFiles) {
  const content = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  sourceFiles.set(filePath, sourceFile);

  const importList = [];
  const exportList = [];
  const identifiers = new Set();

  function visit(node) {
    if (ts.isIdentifier(node)) {
      identifiers.add(node.text);
    }

    // Import declarations
    if (ts.isImportDeclaration(node)) {
      const specifier = node.moduleSpecifier.text;
      const isTypeOnly = !!node.importClause?.isTypeOnly;
      const namedImports = [];
      let defaultImport = null;
      let namespaceImport = null;

      if (node.importClause) {
        if (node.importClause.name) {
          defaultImport = node.importClause.name.text;
        }
        if (node.importClause.namedBindings) {
          if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            namespaceImport = node.importClause.namedBindings.name.text;
          } else if (ts.isNamedImports(node.importClause.namedBindings)) {
            for (const el of node.importClause.namedBindings.elements) {
              namedImports.push({
                importedName: el.propertyName ? el.propertyName.text : el.name.text,
                localName: el.name.text,
                isTypeOnly: isTypeOnly || el.isTypeOnly,
              });
            }
          }
        }
      }

      importList.push({
        specifier,
        resolvedPath: resolveImport(filePath, specifier),
        defaultImport,
        namespaceImport,
        namedImports,
        isTypeOnly,
      });
    }

    // Dynamic import
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) {
        importList.push({
          specifier: arg.text,
          resolvedPath: resolveImport(filePath, arg.text),
          defaultImport: null,
          namespaceImport: null,
          namedImports: [],
          isDynamic: true,
        });
      }
    }

    // Re-exports: export { a, b } from './c'
    if (ts.isExportDeclaration(node)) {
      const specifier = node.moduleSpecifier ? node.moduleSpecifier.text : null;
      const isTypeOnly = !!node.isTypeOnly;
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const el of node.exportClause.elements) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(el.getStart());
          exportList.push({
            name: el.name.text,
            originalName: el.propertyName ? el.propertyName.text : el.name.text,
            line: line + 1,
            col: character + 1,
            kind: "ExportClause",
            isDefault: el.name.text === "default",
            isTypeOnly: isTypeOnly || el.isTypeOnly,
            reExportFrom: specifier ? resolveImport(filePath, specifier) : null,
          });
        }
      }
    }

    // export default expression
    if (ts.isExportAssignment(node)) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      exportList.push({
        name: "default",
        originalName: "default",
        line: line + 1,
        col: character + 1,
        kind: "ExportDefault",
        isDefault: true,
        isTypeOnly: false,
      });
    }

    // Declarations with export
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isVariableStatement(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isEnumDeclaration(node)
    ) {
      const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      const isDefault = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);

      if (isExported) {
        if (ts.isVariableStatement(node)) {
          for (const decl of node.declarationList.declarations) {
            if (ts.isIdentifier(decl.name)) {
              const { line, character } = sourceFile.getLineAndCharacterOfPosition(decl.getStart());
              exportList.push({
                name: decl.name.text,
                originalName: decl.name.text,
                line: line + 1,
                col: character + 1,
                kind: "VariableStatement",
                isDefault: !!isDefault,
                isTypeOnly: false,
              });
            }
          }
        } else if (node.name && ts.isIdentifier(node.name)) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.name.getStart());
          exportList.push({
            name: node.name.text,
            originalName: node.name.text,
            line: line + 1,
            col: character + 1,
            kind: ts.isFunctionDeclaration(node)
              ? "FunctionDeclaration"
              : ts.isInterfaceDeclaration(node)
              ? "InterfaceDeclaration"
              : ts.isTypeAliasDeclaration(node)
              ? "TypeAliasDeclaration"
              : "Declaration",
            isDefault: !!isDefault,
            isTypeOnly: ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node),
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  fileImportDecls.set(filePath, importList);
  fileExports.set(filePath, exportList);
  fileIdentifierTokens.set(filePath, identifiers);
}

// Analysis 1: Incoming file references (all vs non-test)
const appIncomingRefs = new Map(); // incoming from non-test files
const allIncomingRefs = new Map(); // incoming from any file (including tests)

for (const file of allFiles) {
  appIncomingRefs.set(file, new Set());
  allIncomingRefs.set(file, new Set());
}

for (const [importingFile, imports] of fileImportDecls.entries()) {
  const isTest = importingFile.endsWith(".test.ts") || importingFile.endsWith(".test.tsx");
  for (const imp of imports) {
    if (imp.resolvedPath) {
      if (!allIncomingRefs.has(imp.resolvedPath)) {
        allIncomingRefs.set(imp.resolvedPath, new Set());
      }
      allIncomingRefs.get(imp.resolvedPath).add(importingFile);

      if (!isTest) {
        if (!appIncomingRefs.has(imp.resolvedPath)) {
          appIncomingRefs.set(imp.resolvedPath, new Set());
        }
        appIncomingRefs.get(imp.resolvedPath).add(importingFile);
      }
    }
  }
}

// Known Entry Points (excluded from unused files)
const knownEntryPatterns = [
  /\/src\/routes\//,
  /\/src\/routeTree\.gen\.ts$/,
  /\/src\/router\.tsx$/,
  /\/src\/server\.ts$/,
  /\/src\/start\.ts$/,
  /\/src\/styles\.css$/,
  /\.test\.(ts|tsx)$/,
  /\.md$/,
];

function isEntry(filePath) {
  return knownEntryPatterns.some((p) => p.test(filePath));
}

// 1. Completely unreferenced files (0 imports from anywhere)
const zeroRefsOverall = [];
// 2. Test-only referenced files (0 imports from app/routes/server, only imported by .test.ts)
const testOnlyRefs = [];

for (const file of allFiles) {
  if (isEntry(file)) continue;
  const allRefs = allIncomingRefs.get(file) || new Set();
  const appRefs = appIncomingRefs.get(file) || new Set();

  if (allRefs.size === 0) {
    zeroRefsOverall.push(file);
  } else if (appRefs.size === 0) {
    testOnlyRefs.push({ file, testRefs: Array.from(allRefs) });
  }
}

console.log("=== 1. COMPLETELY UNREFERENCED FILES (0 imports anywhere) ===");
console.log(`Count: ${zeroRefsOverall.length}`);
zeroRefsOverall.forEach((f) => console.log(`  - ${f}`));

console.log("\n=== 2. TEST-ONLY REFERENCED FILES (0 app imports, only imported in tests) ===");
console.log(`Count: ${testOnlyRefs.length}`);
testOnlyRefs.forEach(({ file, testRefs }) => {
  console.log(`  - ${file}`);
  testRefs.forEach((r) => console.log(`      imported by test: ${r}`));
});

// Analysis 2: Unused Named Exports in Active (imported) Files
// For each file that IS imported, check which of its exports are imported by other files
const unusedExportsByFile = new Map();

for (const [filePath, exports] of fileExports.entries()) {
  if (isEntry(filePath)) {
    // For route files, TanStack Router uses `Route` export. Let's check what's exported.
    continue;
  }
  // If file is completely unreferenced or test-only, all its exports are unreferenced from app
  const appRefs = appIncomingRefs.get(filePath) || new Set();
  const allRefs = allIncomingRefs.get(filePath) || new Set();

  const unusedInApp = [];
  const unusedEverywhere = [];

  for (const exp of exports) {
    let importedInApp = false;
    let importedEverywhere = false;

    for (const [importingFile, imports] of fileImportDecls.entries()) {
      const isTest = importingFile.endsWith(".test.ts") || importingFile.endsWith(".test.tsx");
      for (const imp of imports) {
        if (imp.resolvedPath === filePath) {
          // Check if this specific export was imported
          if (exp.isDefault && (imp.defaultImport || imp.isDynamic)) {
            importedEverywhere = true;
            if (!isTest) importedInApp = true;
          }
          if (imp.namespaceImport) {
            importedEverywhere = true;
            if (!isTest) importedInApp = true;
          }
          for (const named of imp.namedImports) {
            if (named.importedName === exp.name) {
              importedEverywhere = true;
              if (!isTest) importedInApp = true;
            }
          }
        }
      }
    }

    if (!importedInApp) {
      unusedInApp.push(exp);
    }
    if (!importedEverywhere) {
      unusedEverywhere.push(exp);
    }
  }

  if (allRefs.size > 0 && unusedEverywhere.length > 0) {
    unusedExportsByFile.set(filePath, {
      allRefs: Array.from(allRefs),
      appRefs: Array.from(appRefs),
      unusedEverywhere,
      unusedInAppOnly: unusedInApp.filter((e) => !unusedEverywhere.includes(e)),
    });
  }
}

console.log("\n=== 3. UNUSED EXPORTS IN REFERENCED FILES ===");
for (const [filePath, data] of unusedExportsByFile.entries()) {
  console.log(`\nFile: ${filePath}`);
  console.log(`  Imported by: ${data.allRefs.map((r) => path.basename(r)).join(", ")}`);
  if (data.unusedEverywhere.length > 0) {
    console.log(`  Unused exports (never imported anywhere):`);
    data.unusedEverywhere.forEach((e) => {
      console.log(`    - [line ${e.line}:${e.col}] (${e.kind}) ${e.name}`);
    });
  }
  if (data.unusedInAppOnly.length > 0) {
    console.log(`  Exports used ONLY in tests (unused in app code):`);
    data.unusedInAppOnly.forEach((e) => {
      console.log(`    - [line ${e.line}:${e.col}] (${e.kind}) ${e.name}`);
    });
  }
}

fs.writeFileSync(
  "/Users/madecolombia/Developer/TailorCV/.agents/explorer_r1_1/detailed_audit.json",
  JSON.stringify(
    {
      zeroRefsOverall,
      testOnlyRefs,
      unusedExportsByFile: Object.fromEntries(unusedExportsByFile),
    },
    null,
    2
  )
);
