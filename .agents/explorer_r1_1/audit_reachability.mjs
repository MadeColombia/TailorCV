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

const fileImports = new Map(); // file -> Set of resolved imported file paths
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

  const imports = new Set();
  const exports = [];

  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const specifier = node.moduleSpecifier.text;
      const res = resolveImport(filePath, specifier);
      if (res) imports.add(res);
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteral(arg)) {
        const res = resolveImport(filePath, arg.text);
        if (res) imports.add(res);
      }
    }
    if (ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const res = resolveImport(filePath, node.moduleSpecifier.text);
        if (res) imports.add(res);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  fileImports.set(filePath, imports);
}

// Entry points for production app
const prodEntryRoots = [
  path.join(SRC_ROOT, "server.ts"),
  path.join(SRC_ROOT, "start.ts"),
  path.join(SRC_ROOT, "router.tsx"),
  path.join(SRC_ROOT, "routeTree.gen.ts"),
  ...allFiles.filter((f) => f.includes("src/routes/") && (f.endsWith(".ts") || f.endsWith(".tsx"))),
];

// Test entries
const testEntryRoots = allFiles.filter((f) => f.endsWith(".test.ts") || f.endsWith(".test.tsx"));

// Traverse reachable from prod roots
const reachableFromProd = new Set(prodEntryRoots);
const queue = [...prodEntryRoots];

while (queue.length > 0) {
  const curr = queue.shift();
  const deps = fileImports.get(curr) || new Set();
  for (const dep of deps) {
    if (!reachableFromProd.has(dep)) {
      reachableFromProd.add(dep);
      queue.push(dep);
    }
  }
}

// Traverse reachable from tests
const reachableFromTests = new Set(testEntryRoots);
const testQueue = [...testEntryRoots];
while (testQueue.length > 0) {
  const curr = testQueue.shift();
  const deps = fileImports.get(curr) || new Set();
  for (const dep of deps) {
    if (!reachableFromTests.has(dep)) {
      reachableFromTests.add(dep);
      testQueue.push(dep);
    }
  }
}

console.log("=== PRODUCTION ENTRY ROOTS ===");
console.log(`Count: ${prodEntryRoots.length}`);

console.log("\n=== TOTAL REACHABLE IN PRODUCTION BUNDLE/SSR ===");
console.log(`Count: ${reachableFromProd.size}`);

// Files in src that are NOT reachable in production
const unreachableInProd = tsFiles.filter((f) => !reachableFromProd.has(f));

// Categorize unreachable files:
// 1. Test files themselves
// 2. Test-only reachable files (used only in tests, never in prod)
// 3. Completely unreachable (dead) files (not reachable in prod AND not in tests)

const testFiles = unreachableInProd.filter((f) => f.endsWith(".test.ts") || f.endsWith(".test.tsx"));
const testOnlyFiles = unreachableInProd.filter(
  (f) => !testFiles.includes(f) && reachableFromTests.has(f)
);
const completelyDeadFiles = unreachableInProd.filter(
  (f) => !testFiles.includes(f) && !reachableFromTests.has(f)
);

console.log("\n=== COMPLETELY DEAD FILES (Not reachable in prod OR tests) ===");
console.log(`Count: ${completelyDeadFiles.length}`);
completelyDeadFiles.forEach((f) => console.log(`  - ${f}`));

console.log("\n=== TEST-ONLY REACHABLE FILES (Reachable in tests, but 0 prod reachability) ===");
console.log(`Count: ${testOnlyFiles.length}`);
testOnlyFiles.forEach((f) => console.log(`  - ${f}`));

fs.writeFileSync(
  "/Users/madecolombia/Developer/TailorCV/.agents/explorer_r1_1/reachability.json",
  JSON.stringify(
    {
      prodEntryRoots,
      reachableFromProd: Array.from(reachableFromProd),
      completelyDeadFiles,
      testOnlyFiles,
    },
    null,
    2
  )
);
