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

// Map of file -> list of imports
const fileImports = new Map();
// Map of file -> list of exports
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
        resolvedPath: resolveImport(filePath, specifier),
        defaultImport,
        namespaceImport,
        named,
      });
    }

    // Dynamic import
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) {
        imports.push({
          specifier: arg.text,
          resolvedPath: resolveImport(filePath, arg.text),
          isDynamic: true,
        });
      }
    }

    // Exports
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
              exports.push({
                name: decl.name.text,
                line: line + 1,
                col: character + 1,
                kind: "VariableStatement",
                isDefault: !!isDefault,
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
            isDefault: !!isDefault,
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

// Check every UI component file in src/components/ui/
console.log("=== UI COMPONENTS AUDIT (src/components/ui/) ===");
const uiFiles = allFiles.filter((f) => f.includes("src/components/ui/"));
const usedUiFiles = [];
const unusedUiFiles = [];

for (const uiFile of uiFiles) {
  const incoming = [];
  for (const [importingFile, imps] of fileImports.entries()) {
    for (const imp of imps) {
      if (imp.resolvedPath === uiFile) {
        incoming.push({
          file: importingFile,
          importedNamed: imp.named?.map((n) => n.importedName) || [],
          defaultImport: imp.defaultImport,
        });
      }
    }
  }

  const exports = fileExports.get(uiFile) || [];
  if (incoming.length === 0) {
    unusedUiFiles.push({ file: uiFile, exports });
  } else {
    // Check which exports of this used UI file are unused
    const importedExportNames = new Set();
    incoming.forEach((inc) => {
      inc.importedNamed.forEach((name) => importedExportNames.add(name));
      if (inc.defaultImport) importedExportNames.add("default");
    });
    const unusedExports = exports.filter((exp) => !importedExportNames.has(exp.name));
    usedUiFiles.push({
      file: uiFile,
      incoming: incoming.map((i) => i.file),
      usedExports: Array.from(importedExportNames),
      unusedExports,
    });
  }
}

console.log(`Total UI components: ${uiFiles.length}`);
console.log(`Unused UI components files (0 imports): ${unusedUiFiles.length}`);
unusedUiFiles.forEach((u) => console.log(`  - ${path.basename(u.file)}`));

console.log(`\nUsed UI components with unused sub-components / exports:`);
usedUiFiles.forEach((u) => {
  if (u.unusedExports.length > 0) {
    console.log(`  File: ${path.basename(u.file)} (used in: ${u.incoming.map((f) => path.basename(f)).join(", ")})`);
    u.unusedExports.forEach((e) => console.log(`    - [L${e.line}] ${e.name} (${e.kind})`));
  }
});
