import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { r as cn, t as Button } from "./button-DyZVOtWw.mjs";
import { t as Input } from "./input-Cl4UdChK.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as Star, f as ShieldCheck } from "../_libs/lucide-react.mjs";
import { _ as setAdminRole, d as TabsContent, f as TabsList, g as getAdminOverview, l as Switch, p as TabsTrigger, t as AppShell, u as Tabs, v as setIssueStatus, x as useServerFn } from "./app-shell-BSALpTtH.mjs";
import { t as Badge } from "./badge-Bzug_clR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-9ONJ_2HR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("font-semibold leading-none tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-6 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
var CardFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center p-6 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
var numberFormat = new Intl.NumberFormat("en-US");
function formatDate(value) {
	if (typeof value !== "string") return "—";
	const stamp = Date.parse(value);
	return Number.isFinite(stamp) ? new Date(stamp).toLocaleDateString() : "—";
}
function AdminPage() {
	const overviewFn = useServerFn(getAdminOverview);
	const roleFn = useServerFn(setAdminRole);
	const statusFn = useServerFn(setIssueStatus);
	const queryClient = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const { data, isLoading, error } = useQuery({
		queryKey: ["admin-overview"],
		queryFn: () => overviewFn({}),
		retry: false
	});
	const roleMutation = useMutation({
		mutationFn: (input) => roleFn({ data: input }),
		onSuccess: () => {
			toast.success("Role updated");
			queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
		},
		onError: (mutationError) => toast.error(mutationError.message)
	});
	const statusMutation = useMutation({
		mutationFn: (input) => statusFn({ data: input }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
		onError: (mutationError) => toast.error(mutationError.message)
	});
	const users = (0, import_react.useMemo)(() => {
		const list = data?.users ?? [];
		const term = search.trim().toLowerCase();
		return [...term ? list.filter((user) => user.email.toLowerCase().includes(term)) : list].sort((a, b) => b.tokens - a.tokens);
	}, [data?.users, search]);
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl px-6 py-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-bold",
			children: "Admin"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: "This area is restricted to TailorCV operators."
		})]
	}) });
	const usage = data?.usage;
	const stats = data?.stats;
	const featureRows = Object.entries(usage?.byFeature ?? {}).sort((a, b) => b[1] - a[1]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-6xl space-y-6 px-6 py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold",
				children: "Admin dashboard"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Token spend, accounts, reported issues and reviews."
			})] })]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading…"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					{
						label: "Tokens (24h)",
						value: usage?.total1 ?? 0
					},
					{
						label: "Tokens (7d)",
						value: usage?.total7 ?? 0
					},
					{
						label: "Tokens (30d)",
						value: usage?.total30 ?? 0
					},
					{
						label: "AI calls (30d)",
						value: usage?.calls30 ?? 0
					}
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
						children: item.label
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "font-display text-2xl font-bold",
					children: numberFormat.format(item.value)
				})] }, item.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-5",
				children: [
					{
						label: "Users",
						value: stats?.totalUsers ?? 0
					},
					{
						label: "New (30d)",
						value: stats?.signupsLast30 ?? 0
					},
					{
						label: "Applications",
						value: stats?.totalApplications ?? 0
					},
					{
						label: "Interviewing",
						value: stats?.interviewing ?? 0
					},
					{
						label: "Offers",
						value: stats?.offers ?? 0
					}
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-wide text-muted-foreground",
						children: item.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl font-bold",
						children: numberFormat.format(item.value)
					})]
				}) }, item.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "users",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "users",
							children: "Users"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "usage",
							children: "Usage by feature"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "issues",
							children: ["Issues", data?.issues.some((issue) => issue.status === "new") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ml-2 size-2 rounded-full bg-destructive" }) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "reviews",
							children: "Reviews"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "users",
						className: "space-y-3 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: search,
							onChange: (event) => setSearch(event.target.value),
							placeholder: "Search by email",
							className: "max-w-xs"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden rounded-xl border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2",
											children: "Email"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2",
											children: "Joined"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2",
											children: "Last sign-in"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2 text-right",
											children: "Tokens (30d)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2 text-right",
											children: "Admin"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: users.map((user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2",
											children: user.email || user.id
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2 text-muted-foreground",
											children: formatDate(user.createdAt)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2 text-muted-foreground",
											children: formatDate(user.lastSignInAt)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2 text-right tabular-nums",
											children: numberFormat.format(user.tokens)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2 text-right",
											children: user.isMaster ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-medium text-primary",
												children: "Owner"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
												checked: user.isAdmin,
												disabled: !data?.viewerIsMaster,
												onCheckedChange: (checked) => roleMutation.mutate({
													userId: user.id,
													isAdmin: checked
												})
											})
										})
									]
								}, user.id)) })]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "usage",
						className: "pt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: featureRows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No AI usage recorded yet."
							}) : featureRows.map(([feature, tokens]) => {
								const max = featureRows[0]?.[1] || 1;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "capitalize",
											children: feature.replace(/_/g, " ")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "tabular-nums text-muted-foreground",
											children: numberFormat.format(tokens)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-2 rounded-full bg-muted",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-2 rounded-full bg-primary",
											style: { width: `${Math.round(tokens / max * 100)}%` }
										})
									})]
								}, feature);
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "issues",
						className: "space-y-3 pt-4",
						children: (data?.issues ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No issues reported. Nice."
						}) : (data?.issues ?? []).map((issue) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-2 py-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: issue.status === "resolved" ? "secondary" : "default",
											children: issue.status.replace("_", " ")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate(issue.created_at) }),
										issue.route ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", issue.route] }) : null
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-wrap text-sm",
									children: issue.message
								}),
								issue.client_info ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1.5 text-[11px] text-muted-foreground",
									children: [
										["App", `v${issue.client_info["appVersion"] ?? "?"} (${issue.client_info["appBuild"] ?? "?"})`],
										["Browser", `${issue.client_info["browser"] ?? "?"} ${issue.client_info["browserVersion"] ?? ""}`],
										["OS", issue.client_info["os"]],
										["Device", issue.client_info["deviceType"]],
										["Screen", issue.client_info["screen"]],
										["Viewport", issue.client_info["viewport"]],
										["DPR", issue.client_info["pixelRatio"]],
										["Lang", issue.client_info["language"]],
										["TZ", issue.client_info["timezone"]]
									].filter(([, value]) => value !== null && value !== void 0 && value !== "").map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "rounded border border-border px-1.5 py-0.5",
										children: [
											label,
											": ",
											String(value)
										]
									}, label))
								}) : null,
								issue.screenshot_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: issue.screenshot_url,
									target: "_blank",
									rel: "noreferrer",
									className: "block w-fit overflow-hidden rounded-lg border border-border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: issue.screenshot_url,
										alt: "User-submitted screenshot",
										className: "max-h-56 object-contain bg-muted"
									})
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-2",
									children: [
										"new",
										"in_progress",
										"resolved"
									].map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: issue.status === status ? "secondary" : "ghost",
										onClick: () => statusMutation.mutate({
											id: issue.id,
											status
										}),
										children: status.replace("_", " ")
									}, status))
								})
							]
						}) }, issue.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "reviews",
						className: "space-y-3 pt-4",
						children: (data?.reviews ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No reviews yet."
						}) : (data?.reviews ?? []).map((review) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-2 py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									Array.from({ length: 5 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: index < review.rating ? "size-4 fill-primary text-primary" : "size-4 text-muted-foreground/40" }, index)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										children: review.source
									}),
									review.may_quote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "quotable" }) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: formatDate(review.created_at)
									})
								]
							}), review.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "whitespace-pre-wrap text-sm",
								children: review.message
							}) : null]
						}) }, review.id))
					})
				]
			})
		] })]
	}) });
}
//#endregion
export { AdminPage as component };
