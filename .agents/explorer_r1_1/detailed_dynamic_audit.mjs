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

// Map: filePath -> list of all imports (static + dynamic)
// Each item: { specifier, resolved, importedNames: Set<string>, isNamespace: boolean, isDefault: boolean, isDynamic: boolean }
const fileImports = new Map();
// Map: filePath -> list of exports { name, line, col, kind, isDefault, isTypeOnly }
const fileExports = new Map();

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

  function visit(node) {
    // Static imports
    if (ts.isImportDeclaration(node)) {
      const specifier = node.moduleSpecifier.text;
      const importedNames = new Set();
      let isDefault = false;
      let isNamespace = false;

      if (node.importClause) {
        if (node.importClause.name) {
          isDefault = true;
          importedNames.add("default");
        }
        if (node.importClause.namedBindings) {
          if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            isNamespace = true;
          } else if (ts.isNamedImports(node.importClause.namedBindings)) {
            for (const el of node.importClause.namedBindings.elements) {
              importedNames.add(el.propertyName ? el.propertyName.text : el.name.text);
            }
          }
        }
      }

      imports.push({
        specifier,
        resolved: resolveImport(filePath, specifier),
        importedNames,
        isDefault,
        isNamespace,
        isDynamic: false,
      });
    }

    // Dynamic imports: import(...)
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) {
        const specifier = arg.text;
        const importedNames = new Set();
        let isDefault = false;
        let isNamespace = false;

        // Check parent context: const { a, b } = await import(...) or const x = await import(...)
        let parent = node.parent;
        if (parent && ts.isAwaitExpression(parent)) {
          parent = parent.parent;
        }

        if (parent && ts.isVariableDeclaration(parent)) {
          if (ts.isObjectBindingPattern(parent.name)) {
            for (const el of parent.name.elements) {
              if (ts.isIdentifier(el.name)) {
                const name = el.propertyName && ts.isIdentifier(el.propertyName) ? el.propertyName.text : el.name.text;
                importedNames.add(name);
              }
            }
          } else if (ts.isIdentifier(parent.name)) {
            isNamespace = true;
          }
        } else if (parent && ts.isPropertyAccessExpression(parent)) {
          importedNames.add(parent.name.text);
        } else {
          // If we can't tell, assume namespace/default
          isNamespace = true;
        }

        imports.push({
          specifier,
          resolved: resolveImport(filePath, specifier),
          importedNames,
          isDefault,
          isNamespace,
          isDynamic: true,
        });
      }
    }

    // Re-exports
    if (ts.isExportDeclaration(node)) {
      const specifier = node.moduleSpecifier ? node.moduleSpecifier.text : null;
      if (specifier) {
        // This is a re-export
        const importedNames = new Set();
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          for (const el of node.exportClause.elements) {
            importedNames.add(el.propertyName ? el.propertyName.text : el.name.text);
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(el.getStart());
            exports.push({
              name: el.name.text,
              line: line + 1,
              col: character + 1,
              kind: "ExportSpecifier",
              isDefault: el.name.text === "default",
              isTypeOnly: !!node.isTypeOnly || !!el.isTypeOnly,
            });
          }
        } else {
          // export * from '...'
          imports.push({
            specifier,
            resolved: resolveImport(filePath, specifier),
            importedNames: new Set(["*"]),
            isDefault: false,
            isNamespace: true,
            isDynamic: false,
          });
        }
      } else if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const el of node.exportClause.elements) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(el.getStart());
          exports.push({
            name: el.name.text,
            line: line + 1,
            col: character + 1,
            kind: "ExportSpecifier",
            isDefault: el.name.text === "default",
            isTypeOnly: !!node.isTypeOnly || !!el.isTypeOnly,
          });
        }
      }
    }

    // Export default
    if (ts.isExportAssignment(node)) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      exports.push({
        name: "default",
        line: line + 1,
        col: character + 1,
        kind: "ExportDefault",
        isDefault: true,
        isTypeOnly: false,
      });
    }

    // Declarations
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isVariableStatement(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isEnumDeclaration(node)
    ) {
      const isExported = !!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      const isDefault = !!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);

      if (isExported) {
        if (ts.isVariableStatement(node)) {
          for (const decl of node.declarationList.declarations) {
            if (ts.isIdentifier(decl.name)) {
              const { line, character } = sourceFile.getLineAndCharacterOfPosition(decl.getStart());
              exports.push({
                name: decl.name.text,
                line: line + 1,
                col: character + 1,
                kind: "VariableStatement",
                isDefault,
                isTypeOnly: false,
              });
            }
          }
        } else if (node.name && ts.isIdentifier(node.name)) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.name.getStart());
          exports.push({
            name: node.name.text,
            line: line + 1,
            col: character + 1,
            kind: ts.isFunctionDeclaration(node)
              ? "FunctionDeclaration"
              : ts.isInterfaceDeclaration(node)
              ? "InterfaceDeclaration"
              : ts.isTypeAliasDeclaration(node)
              ? "TypeAliasDeclaration"
              : "Declaration",
            isDefault,
            isTypeOnly: ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node),
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  fileImports.set(filePath, imports);
  fileExports.set(filePath, exports);
}

// Function to check if an export in a file is referenced anywhere in app code or test code
function checkSymbolUsage(targetFile, expName, isDefault) {
  const appReferrers = [];
  const testReferrers = [];

  for (const [importingFile, imps] of fileImports.entries()) {
    const isTest = importingFile.endsWith(".test.ts") || importingFile.endsWith(".test.tsx");
    for (const imp of imps) {
      if (imp.resolved === targetFile) {
        let isUsed = false;
        if (isDefault && (imp.isDefault || imp.importedNames.has("default"))) {
          isUsed = true;
        }
        if (imp.isNamespace) {
          isUsed = true;
        }
        if (imp.importedNames.has(expName)) {
          isUsed = true;
        }

        if (isUsed) {
          if (isTest) testReferrers.push(importingFile);
          else appReferrers.push(importingFile);
        }
      }
    }
  }

  return { appReferrers, testReferrers };
}

// Run for all files and exports
const resultsByFile = new Map();

for (const [filePath, exports] of fileExports.entries()) {
  const fileReport = [];
  for (const exp of exports) {
    const usage = checkSymbolUsage(filePath, exp.name, exp.isDefault);
    fileReport.push({
      ...exp,
      appReferrers: usage.appReferrers.map((f) => path.relative(PROJECT_ROOT, f)),
      testReferrers: usage.testReferrers.map((f) => path.relative(PROJECT_ROOT, f)),
      isUnusedInApp: usage.appReferrers.length === 0,
      isUnusedEverywhere: usage.appReferrers.length === 0 && usage.testReferrers.length === 0,
    });
  }
  resultsByFile.set(filePath, fileReport);
}

// Output summary for each directory
console.log("=== DYNAMIC & STATIC EXPORT USAGE AUDIT ===");

for (const [filePath, report] of resultsByFile.entries()) {
  const relative = path.relative(PROJECT_ROOT, filePath);
  const unusedInApp = report.filter((r) => r.isUnusedInApp && !relative.startsWith("src/routes/"));
  if (unusedInApp.length > 0) {
    console.log(`\n📄 ${relative}`);
    for (const u of unusedInApp) {
      const typeStr = u.isTypeOnly ? "[type]" : "[val]";
      if (u.isUnusedEverywhere) {
        console.log(`   ❌ [L${u.line}:${u.col}] ${typeStr} ${u.kind} "${u.name}" (UNUSED EVERYWHERE)`);
      } else {
        console.log(`   ⚠️ [L${u.line}:${u.col}] ${typeStr} ${u.kind} "${u.name}" (TEST ONLY: ${u.testReferrers.join(", ")})`);
      }
    }
  }
}

fs.writeFileSync(
  "/Users/madecolombia/Developer/TailorCV/.agents/explorer_r1_1/export_audit_results.json",
  JSON.stringify(
    Object.fromEntries(
      Array.from(resultsByFile.entries()).map(([k, v]) => [path.relative(PROJECT_ROOT, k), v])
    ),
    null,
    2
  )
);
