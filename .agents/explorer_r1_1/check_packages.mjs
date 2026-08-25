import fs from "node:fs";
import path from "node:path";

const pkg = JSON.parse(fs.readFileSync("/Users/madecolombia/Developer/TailorCV/package.json", "utf-8"));
const allDeps = Object.keys(pkg.dependencies || {});

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
const reachability = JSON.parse(
  fs.readFileSync("/Users/madecolombia/Developer/TailorCV/.agents/explorer_r1_1/reachability.json", "utf-8")
);

const activeFiles = allFiles.filter(
  (f) => !reachability.completelyDeadFiles.includes(f) && (f.endsWith(".ts") || f.endsWith(".tsx"))
);

const unusedPackagesInActiveCode = [];

for (const dep of allDeps) {
  let usedInActive = false;
  let usedInDead = false;

  for (const file of allFiles) {
    const content = fs.readFileSync(file, "utf-8");
    if (content.includes(`"${dep}"`) || content.includes(`'${dep}'`)) {
      if (activeFiles.includes(file)) {
        usedInActive = true;
      } else {
        usedInDead = true;
      }
    }
  }

  if (!usedInActive) {
    unusedPackagesInActiveCode.push({
      dep,
      usedInDeadOnly: usedInDead,
    });
  }
}

console.log("=== UNUSED NPM PACKAGES IN PRODUCTION APPLICATION CODE ===");
unusedPackagesInActiveCode.forEach((p) => {
  console.log(`- ${p.dep} (Used only in dead files: ${p.usedInDeadOnly})`);
});
