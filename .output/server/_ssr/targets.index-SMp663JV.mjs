import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as normalizeMatch, t as LANGUAGES } from "./cv-DMqvWRdG.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-DyZVOtWw.mjs";
import { n as Label, t as Input } from "./input-Cl4UdChK.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as Plus, o as Trash2, s as Target } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, c as DialogTrigger, i as DialogDescription, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle, t as AppShell, x as useServerFn } from "./app-shell-BSALpTtH.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Bub4Crhq.mjs";
import { a as listRoleTargets, n as deleteRoleTarget, t as createRoleTarget } from "./targets.functions-BFgxQ2gl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/targets.index-SMp663JV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TargetsPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const fetchTargets = useServerFn(listRoleTargets);
	const create = useServerFn(createRoleTarget);
	const remove = useServerFn(deleteRoleTarget);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [language, setLanguage] = (0, import_react.useState)("en");
	const { data: targets = [], isLoading } = useQuery({
		queryKey: ["role-targets"],
		queryFn: () => fetchTargets()
	});
	const createMutation = useMutation({
		mutationFn: () => create({ data: {
			title: title.trim(),
			language
		} }),
		onSuccess: ({ id }) => {
			setOpen(false);
			setTitle("");
			queryClient.invalidateQueries({ queryKey: ["role-targets"] });
			navigate({
				to: "/targets/$id",
				params: { id }
			});
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteMutation = useMutation({
		mutationFn: (id) => remove({ data: { id } }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["role-targets"] }),
		onError: (error) => toast.error(error.message)
	});
	const atLimit = targets.length >= 5;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-6xl px-6 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: "Role targets"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [
						"Up to ",
						5,
						" roles you're hunting for — one general, ATS-ready CV each, reusable across every posting for that role."
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
					open,
					onOpenChange: setOpen,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							disabled: atLimit,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " New target"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-md",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "New role target" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Name the role you want to be found for. You can refine it on the next screen." })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "target-title",
										children: "Role title"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "target-title",
										value: title,
										onChange: (event) => setTitle(event.target.value),
										placeholder: "Senior Backend Engineer"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "CV language" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: language,
										onValueChange: (value) => setLanguage(value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: LANGUAGES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: item.code,
											children: item.native
										}, item.code)) })]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => createMutation.mutate(),
								disabled: createMutation.isPending || title.trim().length < 2,
								children: "Create target"
							}) })
						]
					})]
				})]
			}),
			atLimit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: [
					"You've reached the ",
					5,
					"-target limit. Delete one to add another."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-4 sm:grid-cols-2",
				children: [
					isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Loading…"
					}),
					!isLoading && targets.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "col-span-full rounded-xl border border-dashed border-border p-12 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "mx-auto size-6 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: "No targets yet. Add the roles you're aiming for and we'll shape a CV around each."
						})]
					}),
					targets.map((target) => {
						const row = target;
						const match = row["match_result"] ? normalizeMatch(row["match_result"]) : null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "group relative rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/targets/$id",
								params: { id: row["id"] },
								className: "block",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-base font-semibold",
										children: row["title"] || "Untitled role"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [
											row["seniority"],
											row["industry"],
											row["location"]
										].filter(Boolean).join(" · ") || "No extra details yet"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex items-center gap-3 text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full border border-border px-2 py-0.5 uppercase",
											children: row["language"] === "es" ? "Español" : "English"
										}), match ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-primary",
											children: [match.score, "% role readiness"]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Not generated yet" })]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "absolute right-3 top-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100",
								onClick: () => deleteMutation.mutate(row["id"]),
								"aria-label": "Delete target",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						}, row["id"]);
					})
				]
			})
		]
	}) });
}
//#endregion
export { TargetsPage as component };
