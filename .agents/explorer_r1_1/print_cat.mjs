import fs from "node:fs";
import path from "node:path";

const cat = JSON.parse(
  fs.readFileSync("/Users/madecolombia/Developer/TailorCV/.agents/explorer_r1_1/categorized_audit.json", "utf-8")
);

console.log("=== 1. UNUSED SERVER FUNCTIONS ===");
cat.unusedServerFns.forEach((f) => {
  console.log(`- ${f.file}:${f.line} -> ${f.name} (${f.kind})`);
});

console.log("\n=== 2. UNUSED CLIENT FUNCTIONS & HOOKS ===");
cat.unusedClientFns.forEach((f) => {
  console.log(`- ${f.file}:${f.line} -> ${f.name} (${f.kind})`);
});

console.log("\n=== 3. UNUSED REACT COMPONENTS (in actively used files) ===");
cat.unusedReactComponents.forEach((f) => {
  console.log(`- ${f.file}:${f.line} -> ${f.name} (${f.kind})`);
});

console.log("\n=== 4. TEST-ONLY EXPORTS ===");
cat.testOnlyExports.forEach((f) => {
  console.log(`- ${f.file}:${f.line} -> ${f.name} (${f.kind}) [tested in: ${f.testReferrers.join(", ")}]`);
});

console.log("\n=== 5. UNUSED CONSTANTS & VARIABLES ===");
cat.unusedConstantsAndVars.forEach((f) => {
  console.log(`- ${f.file}:${f.line} -> ${f.name} (${f.kind})`);
});
