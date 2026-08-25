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
const nonUiComponents = allFiles.filter(
  (f) => f.includes("src/components/") && !f.includes("src/components/ui/")
);

console.log("Non-UI components:");
for (const comp of nonUiComponents) {
  console.log(`- ${comp}`);
}
