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

const fileImports = new Map();
const fileExports = new Map();
const internalDecls = new Map(); // file -> [ { name, line, col, kind, isExported, referencesInFile } ]

for (const filePath of tsFiles) {
  const content = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const imports = [];
  const exports = [];
  const decls = [];

  function countOccurrences(identName) {
    let count = 0;
    function walk(node) {
      if (ts.isIdentifier(node) && node.text === identName) {
        count++;
      }
      ts.forEachChild(node, walk);
    }
    walk(sourceFile);
    return count;
  }

  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const specifier = node.moduleSpecifier.text;
      const named = [];
      let defaultImport = null;
      let namespaceImport = null;
      if (node.importClause) {
        if (node.importClause.name) defaultImport = node.importClause.name.text;
        if (node.importClause.namedBindings) {
          if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            namespaceImport = node.importClause.namedBindings.name.text;
          } else if (ts.isNamedImports(node.importClause.namedBindings)) {
            for (const el of node.importClause.namedBindings.elements) {
              named.push({
                importedName: el.propertyName ? el.propertyName.text : el.name.text,
                localName: el.name.text,
              });
            }
          }
        }
      }
      imports.push({
        specifier,
        resolved: resolveImport(filePath, specifier),
        named,
        defaultImport,
        namespaceImport,
      });
    }

    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) {
        imports.push({
          specifier: arg.text,
          resolved: resolveImport(filePath, arg.text),
          isDynamic: true,
          named: [],
        });
      }
    }

    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const el of node.exportClause.elements) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(el.getStart());
          exports.push({
            name: el.name.text,
            line: line + 1,
            col: character + 1,
            kind: "ExportSpecifier",
            isDefault: el.name.text === "default",
          });
        }
      }
    }
    if (ts.isExportAssignment(node)) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      exports.push({
        name: "default",
        line: line + 1,
        col: character + 1,
        kind: "ExportDefault",
        isDefault: true,
      });
    }

    if (
      ts.isFunctionDeclaration(node) ||
      ts.isVariableStatement(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node)
    ) {
      const isExported = !!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      const isDefault = !!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);

      if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(decl.getStart());
            const name = decl.name.text;
            if (isExported) {
              exports.push({
                name,
                line: line + 1,
                col: character + 1,
                kind: "VariableStatement",
                isDefault,
              });
            }
            decls.push({
              name,
              line: line + 1,
              col: character + 1,
              kind: "VariableStatement",
              isExported,
              occurrencesInFile: countOccurrences(name),
            });
          }
        }
      } else if (node.name && ts.isIdentifier(node.name)) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.name.getStart());
        const name = node.name.text;
        const kind = ts.isFunctionDeclaration(node)
          ? "FunctionDeclaration"
          : ts.isInterfaceDeclaration(node)
          ? "InterfaceDeclaration"
          : ts.isTypeAliasDeclaration(node)
          ? "TypeAliasDeclaration"
          : "Declaration";

        if (isExported) {
          exports.push({
            name,
            line: line + 1,
            col: character + 1,
            kind,
            isDefault,
          });
        }
        decls.push({
          name,
          line: line + 1,
          col: character + 1,
          kind,
          isExported,
          occurrencesInFile: countOccurrences(name),
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  fileImports.set(filePath, imports);
  fileExports.set(filePath, exports);
  internalDecls.set(filePath, decls);
}

// 1. Find internal unexported declarations that have occurrencesInFile == 1 (only declaration itself)
console.log("=== UNUSED INTERNAL (UNEXPORTED) DECLARATIONS ===");
const unusedInternalDecls = [];
for (const [filePath, decls] of internalDecls.entries()) {
  for (const d of decls) {
    if (!d.isExported && d.occurrencesInFile === 1) {
      unusedInternalDecls.push({ file: filePath, ...d });
      console.log(`[${path.relative(PROJECT_ROOT, filePath)}] line ${d.line}:${d.col} - ${d.kind} "${d.name}"`);
    }
  }
}

// 2. Comprehensive check of all exports across all files in src/lib and src/integrations and src/routes
console.log("\n=== ALL UNUSED EXPORTS BREAKDOWN (BY FOLDER & FILE) ===");

function checkExportUsage(targetFile, exp) {
  let appCount = 0;
  let testCount = 0;
  const usedInFiles = [];

  for (const [importingFile, imps] of fileImports.entries()) {
    const isTest = importingFile.endsWith(".test.ts") || importingFile.endsWith(".test.tsx");
    for (const imp of imps) {
      if (imp.resolved === targetFile) {
        let matched = false;
        if (exp.isDefault && (imp.defaultImport || imp.isDynamic)) matched = true;
        if (imp.namespaceImport) matched = true;
        if (imp.named.some((n) => n.importedName === exp.name)) matched = true;

        if (matched) {
          usedInFiles.push(importingFile);
          if (isTest) testCount++;
          else appCount++;
        }
      }
    }
  }

  return { appCount, testCount, usedIn: usedInFiles };
}

const libAndIntegFiles = allFiles.filter(
  (f) => (f.includes("src/lib/") || f.includes("src/integrations/") || f.includes("src/components/")) && (f.endsWith(".ts") || f.endsWith(".tsx"))
);

const report = [];

for (const filePath of libAndIntegFiles) {
  const exports = fileExports.get(filePath) || [];
  const unusedList = [];

  for (const exp of exports) {
    const usage = checkExportUsage(filePath, exp);
    if (usage.appCount === 0 && usage.testCount === 0) {
      unusedList.push({ ...exp, status: "NEVER_USED", usedIn: [] });
    } else if (usage.appCount === 0 && usage.testCount > 0) {
      unusedList.push({
        ...exp,
        status: "TEST_ONLY",
        usedIn: usage.usedIn.map((f) => path.basename(f)),
      });
    }
  }

  if (unusedList.length > 0) {
    report.push({
      file: filePath,
      relative: path.relative(PROJECT_ROOT, filePath),
      unused: unusedList,
    });
  }
}

fs.writeFileSync(
  "/Users/madecolombia/Developer/TailorCV/.agents/explorer_r1_1/lib_unused_exports.json",
  JSON.stringify(report, null, 2)
);

for (const r of report) {
  console.log(`\n📄 ${r.relative}`);
  for (const u of r.unused) {
    console.log(`   [L${u.line}:${u.col}] ${u.kind} "${u.name}" -> ${u.status}${u.status === "TEST_ONLY" ? ` (tests: ${u.usedIn.join(", ")})` : ""}`);
  }
}
