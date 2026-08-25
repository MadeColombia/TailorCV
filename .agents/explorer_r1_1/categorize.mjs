import fs from "node:fs";
import path from "node:path";

const PROJECT_ROOT = "/Users/madecolombia/Developer/TailorCV";
const results = JSON.parse(
  fs.readFileSync("/Users/madecolombia/Developer/TailorCV/.agents/explorer_r1_1/export_audit_results.json", "utf-8")
);
const reachability = JSON.parse(
  fs.readFileSync("/Users/madecolombia/Developer/TailorCV/.agents/explorer_r1_1/reachability.json", "utf-8")
);

console.log("=== COMPREHENSIVE AUDIT SUMMARY ===");
console.log(`Completely dead files: ${reachability.completelyDeadFiles.length}`);
console.log(`Test-only files: ${reachability.testOnlyFiles.length}`);

// Group unused exports by file category
const byCategory = {
  deadFiles: reachability.completelyDeadFiles,
  unusedServerFns: [],
  unusedClientFns: [],
  unusedReactComponents: [],
  unusedConstantsAndVars: [],
  unusedTypesAndInterfaces: [],
  testOnlyExports: [],
};

for (const [fileRel, exports] of Object.entries(results)) {
  const fullPath = path.join(PROJECT_ROOT, fileRel);
  if (reachability.completelyDeadFiles.includes(fullPath)) {
    // All exports in dead files belong to the dead file section
    continue;
  }
  if (fileRel.startsWith("src/routes/")) {
    // Route files
    continue;
  }

  for (const exp of exports) {
    if (exp.isUnusedEverywhere) {
      if (exp.kind === "TypeAliasDeclaration" || exp.kind === "InterfaceDeclaration") {
        byCategory.unusedTypesAndInterfaces.push({ file: fileRel, ...exp });
      } else if (exp.name.startsWith("use") || exp.kind === "FunctionDeclaration") {
        if (fileRel.includes(".server.") || fileRel.includes("functions.ts")) {
          // Check if server function
          byCategory.unusedServerFns.push({ file: fileRel, ...exp });
        } else {
          byCategory.unusedClientFns.push({ file: fileRel, ...exp });
        }
      } else if (exp.kind === "VariableStatement") {
        // Could be a React component, serverFn, or constant
        if (fileRel.includes("functions.ts")) {
          byCategory.unusedServerFns.push({ file: fileRel, ...exp });
        } else if (/^[A-Z]/.test(exp.name) && (fileRel.includes("components/") || exp.name.endsWith("Button") || exp.name.endsWith("Card") || exp.name.endsWith("Menu") || exp.name.endsWith("Input") || exp.name.endsWith("Dialog") || exp.name.endsWith("Item") || exp.name.endsWith("Group") || exp.name.endsWith("Content") || exp.name.endsWith("Trigger") || exp.name.endsWith("Header") || exp.name.endsWith("Footer") || exp.name.endsWith("Tab") || exp.name.endsWith("List") || exp.name.endsWith("Select") || exp.name.endsWith("Separator") || exp.name.endsWith("Page") || exp.name.endsWith("Actions") || exp.name.endsWith("Action") || exp.name.endsWith("Branch") || exp.name.endsWith("Selector") || exp.name.endsWith("Previous") || exp.name.endsWith("Next") || exp.name.endsWith("Toolbar") || exp.name.endsWith("Body") || exp.name.endsWith("Provider") || exp.name.endsWith("Shimmer") || exp.name.endsWith("Portal") || exp.name.endsWith("Overlay") || exp.name.endsWith("Close") || exp.name.endsWith("Sub") || exp.name.endsWith("SubContent") || exp.name.endsWith("SubTrigger") || exp.name.endsWith("Shortcut") || exp.name.endsWith("Label") || exp.name.endsWith("Value") || exp.name.endsWith("Empty") || exp.name.endsWith("Input") || exp.name.endsWith("Item"))) {
          byCategory.unusedReactComponents.push({ file: fileRel, ...exp });
        } else if (/^[A-Z0-9_]+$/.test(exp.name)) {
          byCategory.unusedConstantsAndVars.push({ file: fileRel, ...exp });
        } else {
          byCategory.unusedClientFns.push({ file: fileRel, ...exp });
        }
      } else {
        byCategory.unusedConstantsAndVars.push({ file: fileRel, ...exp });
      }
    } else if (exp.isUnusedInApp && !exp.isUnusedEverywhere) {
      byCategory.testOnlyExports.push({ file: fileRel, ...exp });
    }
  }
}

console.log(`Unused Server Functions: ${byCategory.unusedServerFns.length}`);
console.log(`Unused Client Functions / Hooks: ${byCategory.unusedClientFns.length}`);
console.log(`Unused React Components: ${byCategory.unusedReactComponents.length}`);
console.log(`Unused Constants / Vars: ${byCategory.unusedConstantsAndVars.length}`);
console.log(`Unused Types / Interfaces: ${byCategory.unusedTypesAndInterfaces.length}`);
console.log(`Test-Only Exports: ${byCategory.testOnlyExports.length}`);

fs.writeFileSync(
  "/Users/madecolombia/Developer/TailorCV/.agents/explorer_r1_1/categorized_audit.json",
  JSON.stringify(byCategory, null, 2)
);
