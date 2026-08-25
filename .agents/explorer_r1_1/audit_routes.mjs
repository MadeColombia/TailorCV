import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const PROJECT_ROOT = "/Users/madecolombia/Developer/TailorCV";
const routesDir = path.join(PROJECT_ROOT, "src/routes");

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

const routeFiles = getAllFiles(routesDir).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));

console.log("=== INSPECTING ROUTE FILES FOR UNUSED INTERNAL DECLARATIONS ===");

for (const filePath of routeFiles) {
  const content = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

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

  const decls = [];

  function visit(node) {
    if (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)) {
      const isExported = !!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            const name = decl.name.text;
            const { line, character } = sourceFile.getLineAndCharacterOfPosition(decl.getStart());
            decls.push({
              name,
              line: line + 1,
              col: character + 1,
              isExported,
              occurrences: countOccurrences(name),
              kind: "VariableStatement",
            });
          }
        }
      } else if (node.name && ts.isIdentifier(node.name)) {
        const name = node.name.text;
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.name.getStart());
        decls.push({
          name,
          line: line + 1,
          col: character + 1,
          isExported,
          occurrences: countOccurrences(name),
          kind: "FunctionDeclaration",
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  const unusedInFile = decls.filter((d) => !d.isExported && d.occurrences === 1);
  if (unusedInFile.length > 0) {
    console.log(`\nRoute File: ${path.relative(PROJECT_ROOT, filePath)}`);
    unusedInFile.forEach((d) => {
      console.log(`  - [L${d.line}:${d.col}] ${d.kind} "${d.name}" (only declared, never called/rendered)`);
    });
  }
}
console.log("\nFinished inspecting route files.");
