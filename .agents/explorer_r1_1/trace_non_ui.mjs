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

const fileImports = new Map(); // file -> [ { specifier, resolved, named, defaultImport, isDynamic } ]
const fileExports = new Map(); // file -> [ { name, line, col, kind, isDefault } ]

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

// Check non-UI components
const nonUiComps = allFiles.filter(
  (f) => f.includes("src/components/") && !f.includes("src/components/ui/")
);

console.log("=== NON-UI COMPONENTS IMPORT TRACE ===");
for (const comp of nonUiComps) {
  const incoming = [];
  for (const [importingFile, imps] of fileImports.entries()) {
    for (const imp of imps) {
      if (imp.resolved === comp) {
        incoming.push({
          file: importingFile,
          named: imp.named.map((n) => n.importedName),
          isDefault: !!imp.defaultImport,
        });
      }
    }
  }
  console.log(`\nComponent File: ${comp}`);
  console.log(`  Incoming refs count: ${incoming.length}`);
  incoming.forEach((inc) => {
    console.log(`    From: ${path.relative(PROJECT_ROOT, inc.file)} (named: ${inc.named.join(", ")}, default: ${inc.isDefault})`);
  });
  const exports = fileExports.get(comp) || [];
  console.log(`  Exports (${exports.length}):`);
  exports.forEach((e) => {
    const isImported = incoming.some(
      (inc) => inc.named.includes(e.name) || (e.isDefault && inc.isDefault)
    );
    console.log(`    - [L${e.line}] ${e.name} (${e.kind}) -> ${isImported ? "USED" : "UNUSED"}`);
  });
}
