import os, re

src_dir = "/Users/madecolombia/Developer/TailorCV/src"
all_files = []
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith((".ts", ".tsx")) and not f.endswith(".d.ts"):
            all_files.append(os.path.join(root, f))

print(f"Total ts/tsx files: {len(all_files)}")

# Build import graph
import_re = re.compile(r"""(?:from|import)\s+['"]([^'"]+)['"]""")
dynamic_re = re.compile(r"""import\s*\(\s*['"]([^'"]+)['"]\s*\)""")

graph = {f: set() for f in all_files}

def resolve_import(curr_file, imp):
    if imp.startswith("@/"):
        rel = imp[2:]
        cand = os.path.join(src_dir, rel)
    elif imp.startswith("."):
        cand = os.path.normpath(os.path.join(os.path.dirname(curr_file), imp))
    else:
        return None # node_modules

    for ext in ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]:
        test_path = cand + ext
        if os.path.isfile(test_path):
            return os.path.normpath(test_path)
    return None

for f in all_files:
    with open(f, "r", encoding="utf-8", errors="ignore") as fp:
        content = fp.read()
    for m in import_re.finditer(content):
        res = resolve_import(f, m.group(1))
        if res and res in graph:
            graph[f].add(res)
    for m in dynamic_re.finditer(content):
        res = resolve_import(f, m.group(1))
        if res and res in graph:
            graph[f].add(res)

# Find entry points
entry_points = set()
for f in all_files:
    rel = os.path.relpath(f, src_dir)
    if rel in ["server.ts", "start.ts", "router.tsx", "routeTree.gen.ts"]:
        entry_points.add(f)
    elif rel.startswith("routes/"):
        entry_points.add(f)
    elif rel.endswith(".test.ts") or rel.endswith(".test.tsx"):
        entry_points.add(f)

print(f"Entry points identified: {len(entry_points)}")

# Reachability via BFS
reachable = set(entry_points)
queue = list(entry_points)
while queue:
    curr = queue.pop(0)
    for neighbor in graph.get(curr, []):
        if neighbor not in reachable:
            reachable.add(neighbor)
            queue.append(neighbor)

unreachable = set(all_files) - reachable
print(f"Unreachable files count: {len(unreachable)}")
for u in sorted(unreachable):
    print("UNREACHABLE:", os.path.relpath(u, src_dir))

# Check in-degrees
in_degrees = {f: 0 for f in all_files}
for src, targets in graph.items():
    for t in targets:
        in_degrees[t] += 1

print("\nFiles with in-degree 0 not in entry points:")
for f, deg in in_degrees.items():
    if deg == 0 and f not in entry_points:
        print("IN-DEG 0:", os.path.relpath(f, src_dir))
