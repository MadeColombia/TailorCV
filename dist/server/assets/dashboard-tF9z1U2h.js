import { t as createServerFn } from "./createServerFn-BFFE07zL.js";
import { S as useServerFn, _ as DialogHeader, c as Textarea, g as DialogFooter, h as DialogDescription, m as DialogContent, o as createSsrRpc, p as Dialog, t as AppShell, v as DialogTitle, y as DialogTrigger } from "./app-shell-bjwPVDLq.js";
import { t as requireSupabaseAuth } from "./auth-middleware-ZGAJzz7F.js";
import { p as normalizeMatch, t as LANGUAGES } from "./cv-DMqvWRdG.js";
import { a as validateOfferUrl } from "./offer-parse-ClieybKl.js";
import { a as pipelineHealth, c as toneEdgeClass, i as matchesFilter, l as toneTextClass, n as PIPELINE_STAGES, r as daysUntil, s as stageLabel, t as CLOSED_STAGES } from "./pipeline-B78LRwYF.js";
import { r as cn, t as Button } from "./button-DyZVOtWw.js";
import { n as Label, t as Input } from "./input-Cl4UdChK.js";
import { t as Badge } from "./badge-Bzug_clR.js";
import { t as Spinner } from "./spinner-iFQhnBJc.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Bub4Crhq.js";
import { c as listApplications, d as restoreApplication, n as createApplication, r as deleteApplication, v as updateApplicationStage } from "./applications.functions-Dt0KIvJh.js";
import { a as notify } from "./notifications-_1kSfE6U.js";
import { r as getUserSettings } from "./user-settings.functions-Hdzanu9i.js";
import { a as listRoleTargets } from "./targets.functions-BPMErzPa.js";
import * as React from "react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Archive, ArchiveRestore, Bell, Building2, Check, CheckCircle2, Link2, ListChecks, Plus, Trash2, X } from "lucide-react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
//#region src/components/ui/checkbox.tsx
var Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(CheckboxPrimitive.Root, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
//#endregion
//#region src/lib/offer.functions.ts
/**
* Try, in order: direct HTML (JSON-LD first, then visible text), then a reader
* proxy that renders JavaScript. Job boards block most of these individually.
*/
/** Read a job posting URL and extract the structured offer so the user can confirm it. */
var analyzeOfferUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => ({ url: validateOfferUrl(input.url) })).handler(createSsrRpc("7d7ba122e8d710b83fbd6a865d41d9b46716103b6dda1ea8f8f09eb9a2d6aa74"));
//#endregion
//#region src/routes/_authenticated/dashboard.tsx?tsr-split=component
function Dashboard() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const fetchApplications = useServerFn(listApplications);
	const create = useServerFn(createApplication);
	const remove = useServerFn(deleteApplication);
	const analyze = useServerFn(analyzeOfferUrl);
	const restore = useServerFn(restoreApplication);
	const [filter, setFilter] = useState("all");
	const [open, setOpen] = useState(false);
	const [company, setCompany] = useState("");
	const [roleTitle, setRoleTitle] = useState("");
	const [offerText, setOfferText] = useState("");
	const [offerUrl, setOfferUrl] = useState("");
	const [language, setLanguage] = useState(null);
	const [targetId, setTargetId] = useState("none");
	const [analysis, setAnalysis] = useState(null);
	const fetchSettings = useServerFn(getUserSettings);
	const settingsQuery = useQuery({
		queryKey: ["user-settings"],
		queryFn: () => fetchSettings()
	});
	const cvLanguages = settingsQuery.data?.cvLanguages ?? ["en"];
	const effectiveLanguage = language ?? settingsQuery.data?.defaultAppLanguage ?? "en";
	const fetchTargets = useServerFn(listRoleTargets);
	const { data: targets = [] } = useQuery({
		queryKey: ["role-targets"],
		queryFn: () => fetchTargets()
	});
	const readyTargets = targets.filter((target) => Boolean(target["generated_cv"])).map((target) => ({
		id: target["id"],
		title: target["title"] || "Untitled role"
	}));
	const analyzeRunRef = useRef(0);
	const resetForm = () => {
		setTargetId("none");
		setCompany("");
		setRoleTitle("");
		setOfferText("");
		setOfferUrl("");
		setAnalysis(null);
	};
	const { data: applications = [], isLoading } = useQuery({
		queryKey: ["applications"],
		queryFn: () => fetchApplications()
	});
	const analyzeMutation = useMutation({
		mutationFn: () => {
			const run = ++analyzeRunRef.current;
			return analyze({ data: { url: offerUrl.trim() } }).then((result) => ({
				run,
				result
			}));
		},
		onSuccess: ({ run, result }) => {
			if (run !== analyzeRunRef.current) return;
			setAnalysis(result);
			if (result.ok) {
				setCompany(result.company);
				setRoleTitle(result.roleTitle);
				setOfferText(result.offerText);
				toast.success("Offer found — check the details below");
				notify("offer_analyzed", "Job offer analysed", `${result.roleTitle || "Role"} at ${result.company || "company"}.`);
			} else {
				toast.error("We couldn't read that offer");
				notify("errors", "We couldn't read that job link", "Fill in the offer details manually to continue.");
			}
		},
		onError: (error) => {
			toast.error(error.message);
			notify("errors", "Job link analysis failed", error.message);
		}
	});
	const createMutation = useMutation({
		mutationFn: () => create({ data: {
			company,
			roleTitle,
			offerText,
			offerUrl: offerUrl.trim(),
			language: effectiveLanguage,
			...targetId !== "none" ? { targetId } : {},
			...analysis?.ok ? { offerSummary: {
				summary: analysis.summary,
				location: analysis.location,
				employmentType: analysis.employmentType,
				seniority: analysis.seniority,
				salaryText: analysis.salaryText,
				skills: analysis.skills,
				companyUrl: offerUrl.trim()
			} } : {}
		} }),
		onSuccess: ({ id }) => {
			setOpen(false);
			resetForm();
			queryClient.invalidateQueries({ queryKey: ["applications"] });
			navigate({
				to: "/applications/$id",
				params: { id }
			});
		},
		onError: (error) => toast.error(error.message)
	});
	const windows = {
		responseWindowDays: settingsQuery.data?.responseWindowDays ?? 21,
		ghostAfterDays: settingsQuery.data?.ghostAfterDays ?? 45,
		archiveRetentionDays: settingsQuery.data?.archiveRetentionDays ?? 30,
		followupOffsetDays: settingsQuery.data?.followupOffsetDays ?? 10
	};
	const visible = applications.filter((application) => matchesFilter(application, filter, windows));
	const [selected, setSelected] = useState([]);
	const [isBulkMode, setIsBulkMode] = useState(false);
	const visibleIds = visible.map((item) => item.id);
	const selectedVisible = selected.filter((id) => visibleIds.includes(id));
	const allVisibleSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
	const toggleSelected = (id, checked) => setSelected((prev) => checked ? [.../* @__PURE__ */ new Set([...prev, id])] : prev.filter((x) => x !== id));
	const exitBulkMode = () => {
		setIsBulkMode(false);
		setSelected([]);
	};
	const changeStage = useServerFn(updateApplicationStage);
	const bulkStageMutation = useMutation({
		mutationFn: async (stage) => {
			for (const id of selectedVisible) await changeStage({ data: {
				id,
				stage
			} });
			return selectedVisible.length;
		},
		onSuccess: (count) => {
			toast.success(`${count} application${count === 1 ? "" : "s"} updated`);
			setSelected([]);
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const bulkDeleteMutation = useMutation({
		mutationFn: async () => {
			for (const id of selectedVisible) await remove({ data: { id } });
			return selectedVisible.length;
		},
		onSuccess: (count) => {
			toast.success(`${count} application${count === 1 ? "" : "s"} deleted`);
			setSelected([]);
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const restoreMutation = useMutation({
		mutationFn: (id) => restore({ data: { id } }),
		onSuccess: () => {
			toast.success("Application reclaimed");
			queryClient.invalidateQueries({ queryKey: ["applications"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteMutation = useMutation({
		mutationFn: (id) => remove({ data: { id } }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
		onError: (error) => toast.error(error.message)
	});
	return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("main", {
		className: "mx-auto max-w-6xl px-6 py-10",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold",
					children: "Applications"
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "One workspace per offer — tailored CV, interview and cover letter."
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ jsxs(Button, {
						variant: "outline",
						onClick: () => isBulkMode ? exitBulkMode() : setIsBulkMode(true),
						"aria-pressed": isBulkMode,
						children: [isBulkMode ? /* @__PURE__ */ jsx(X, { className: "size-4" }) : /* @__PURE__ */ jsx(ListChecks, { className: "size-4" }), isBulkMode ? "Cancel" : "Multiple"]
					}), /* @__PURE__ */ jsxs(Dialog, {
						open,
						onOpenChange: (next) => {
							setOpen(next);
							if (!next) {
								analyzeRunRef.current += 1;
								analyzeMutation.reset();
								resetForm();
							}
						},
						children: [/* @__PURE__ */ jsx(DialogTrigger, {
							asChild: true,
							children: /* @__PURE__ */ jsxs(Button, { children: [/* @__PURE__ */ jsx(Plus, { className: "size-4" }), " New application"] })
						}), /* @__PURE__ */ jsxs(DialogContent, {
							className: "max-h-[85vh] max-w-lg overflow-y-auto",
							children: [
								/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "New application" }), /* @__PURE__ */ jsx(DialogDescription, { children: "Paste the link to the offer and we'll read it for you — or fill it in by hand." })] }),
								/* @__PURE__ */ jsxs("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "offer-url",
												children: "Job offer link"
											}), /* @__PURE__ */ jsxs("div", {
												className: "flex gap-2",
												children: [/* @__PURE__ */ jsx(Input, {
													id: "offer-url",
													value: offerUrl,
													onChange: (event) => setOfferUrl(event.target.value),
													placeholder: "https://company.com/careers/senior-data-analyst"
												}), /* @__PURE__ */ jsxs(Button, {
													variant: "outline",
													onClick: () => analyzeMutation.mutate(),
													disabled: analyzeMutation.isPending || offerUrl.trim().length < 8,
													children: [analyzeMutation.isPending ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsx(Link2, { className: "size-4" }), "Analyze"]
												})]
											})]
										}),
										analysis?.ok && /* @__PURE__ */ jsxs("div", {
											className: "rounded-lg border border-primary/40 bg-primary/5 p-4",
											children: [
												/* @__PURE__ */ jsxs("p", {
													className: "flex items-center gap-2 text-sm font-semibold",
													children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "size-4 text-primary" }), " Is this the right offer?"]
												}),
												/* @__PURE__ */ jsxs("dl", {
													className: "mt-3 grid gap-1 text-sm",
													children: [
														/* @__PURE__ */ jsxs("div", {
															className: "flex gap-2",
															children: [/* @__PURE__ */ jsx("dt", {
																className: "w-24 shrink-0 text-muted-foreground",
																children: "Role"
															}), /* @__PURE__ */ jsx("dd", { children: analysis.roleTitle || "—" })]
														}),
														/* @__PURE__ */ jsxs("div", {
															className: "flex gap-2",
															children: [/* @__PURE__ */ jsx("dt", {
																className: "w-24 shrink-0 text-muted-foreground",
																children: "Company"
															}), /* @__PURE__ */ jsx("dd", { children: analysis.company || "—" })]
														}),
														analysis.location && /* @__PURE__ */ jsxs("div", {
															className: "flex gap-2",
															children: [/* @__PURE__ */ jsx("dt", {
																className: "w-24 shrink-0 text-muted-foreground",
																children: "Location"
															}), /* @__PURE__ */ jsx("dd", { children: analysis.location })]
														}),
														(analysis.employmentType || analysis.seniority) && /* @__PURE__ */ jsxs("div", {
															className: "flex gap-2",
															children: [/* @__PURE__ */ jsx("dt", {
																className: "w-24 shrink-0 text-muted-foreground",
																children: "Type"
															}), /* @__PURE__ */ jsx("dd", { children: [analysis.seniority, analysis.employmentType].filter(Boolean).join(" · ") })]
														})
													]
												}),
												analysis.highlights.length > 0 && /* @__PURE__ */ jsx("ul", {
													className: "mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground",
													children: analysis.highlights.map((highlight, index) => /* @__PURE__ */ jsx("li", { children: highlight }, index))
												}),
												/* @__PURE__ */ jsx("p", {
													className: "mt-3 text-xs text-muted-foreground",
													children: "Anything off? Edit the fields below before creating the workspace."
												})
											]
										}),
										analysis && !analysis.ok && /* @__PURE__ */ jsxs("div", {
											className: "flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm",
											children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 size-4 shrink-0 text-destructive" }), /* @__PURE__ */ jsx("p", { children: analysis.reason })]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "grid gap-4 sm:grid-cols-2",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "space-y-2",
												children: [/* @__PURE__ */ jsx(Label, {
													htmlFor: "company",
													children: "Company"
												}), /* @__PURE__ */ jsx(Input, {
													id: "company",
													value: company,
													onChange: (event) => setCompany(event.target.value),
													placeholder: "Acme Ltd"
												})]
											}), /* @__PURE__ */ jsxs("div", {
												className: "space-y-2",
												children: [/* @__PURE__ */ jsx(Label, {
													htmlFor: "role",
													children: "Role"
												}), /* @__PURE__ */ jsx(Input, {
													id: "role",
													value: roleTitle,
													onChange: (event) => setRoleTitle(event.target.value),
													placeholder: "Senior Data Analyst"
												})]
											})]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ jsx(Label, { children: "CV language" }), /* @__PURE__ */ jsxs(Select, {
												value: effectiveLanguage,
												onValueChange: (value) => setLanguage(value),
												children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsx(SelectContent, { children: LANGUAGES.filter((item) => cvLanguages.includes(item.code)).map((item) => /* @__PURE__ */ jsx(SelectItem, {
													value: item.code,
													children: item.native
												}, item.code)) })]
											})]
										}),
										readyTargets.length > 0 && /* @__PURE__ */ jsxs("div", {
											className: "space-y-2",
											children: [
												/* @__PURE__ */ jsx(Label, { children: "Start from a role target (optional)" }),
												/* @__PURE__ */ jsxs(Select, {
													value: targetId,
													onValueChange: setTargetId,
													children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Master profile" }) }), /* @__PURE__ */ jsxs(SelectContent, { children: [/* @__PURE__ */ jsx(SelectItem, {
														value: "none",
														children: "Master profile"
													}), readyTargets.map((target) => /* @__PURE__ */ jsx(SelectItem, {
														value: target.id,
														children: target.title
													}, target.id))] })]
												}),
												/* @__PURE__ */ jsx("p", {
													className: "text-xs text-muted-foreground",
													children: "Tailoring will start from that role's CV instead of the raw master profile."
												})
											]
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "offer",
												children: "Job offer"
											}), /* @__PURE__ */ jsx(Textarea, {
												id: "offer",
												value: offerText,
												onChange: (event) => setOfferText(event.target.value),
												rows: 10,
												placeholder: "Paste the job description here…"
											})]
										})
									]
								}),
								/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
									onClick: () => createMutation.mutate(),
									disabled: createMutation.isPending || offerText.trim().length < 30,
									children: "Create workspace"
								}) })
							]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ jsx("nav", {
				className: "mt-8 flex flex-wrap gap-2",
				children: [
					["active", "Active"],
					["draft", "Drafts"],
					["interviewing", "Interviewing"],
					["risk", "Needs attention"],
					["archive", "Archived"],
					["all", "All applications"]
				].map(([value, label]) => {
					const count = applications.filter((application) => matchesFilter(application, value, windows)).length;
					return /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => {
							setFilter(value);
							setSelected([]);
						},
						className: cn("rounded-full border px-3 py-1.5 text-sm transition-colors", filter === value ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"),
						children: [label, /* @__PURE__ */ jsx("span", {
							className: "ml-1.5 text-xs text-muted-foreground",
							children: count
						})]
					}, value);
				})
			}),
			isBulkMode && visible.length > 0 && /* @__PURE__ */ jsxs("div", {
				className: "animate-fade-in mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3",
				children: [/* @__PURE__ */ jsxs("label", {
					className: "flex items-center gap-2 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ jsx(Checkbox, {
						checked: allVisibleSelected,
						onCheckedChange: (checked) => setSelected(checked ? visible.map((item) => item.id) : []),
						"aria-label": "Select all applications in this view"
					}), selected.length > 0 ? `${selected.length} selected` : "Select all"]
				}), selected.length > 0 && /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ jsxs(Select, {
							value: "",
							onValueChange: (value) => bulkStageMutation.mutate(value),
							disabled: bulkStageMutation.isPending,
							children: [/* @__PURE__ */ jsx(SelectTrigger, {
								className: "h-9 w-56",
								children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Change status to…" })
							}), /* @__PURE__ */ jsx(SelectContent, { children: [...PIPELINE_STAGES, ...CLOSED_STAGES].map((stage) => /* @__PURE__ */ jsx(SelectItem, {
								value: stage.value,
								children: stage.label
							}, stage.value)) })]
						}),
						bulkStageMutation.isPending && /* @__PURE__ */ jsx(Spinner, { className: "size-4" }),
						/* @__PURE__ */ jsxs(Button, {
							variant: "ghost",
							size: "sm",
							className: "text-destructive hover:bg-destructive/10 hover:text-destructive",
							onClick: () => bulkDeleteMutation.mutate(),
							disabled: bulkDeleteMutation.isPending,
							children: [bulkDeleteMutation.isPending ? /* @__PURE__ */ jsx(Spinner, { className: "size-4" }) : /* @__PURE__ */ jsx(Trash2, { className: "size-4" }), "Delete"]
						}),
						/* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => setSelected([]),
							children: "Clear"
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4 grid gap-3",
				children: [
					isLoading && /* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted-foreground",
						children: "Loading…"
					}),
					!isLoading && applications.length === 0 && /* @__PURE__ */ jsxs("div", {
						className: "rounded-xl border border-dashed border-border p-12 text-center",
						children: [/* @__PURE__ */ jsx(Building2, { className: "mx-auto size-6 text-muted-foreground" }), /* @__PURE__ */ jsx("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: "No applications yet. Add your first job offer to tailor a CV for it."
						})]
					}),
					!isLoading && applications.length > 0 && visible.length === 0 && /* @__PURE__ */ jsx("div", {
						className: "rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground",
						children: filter === "archive" ? "Nothing archived. Rejected or ghosted roles land here for 30 days." : "No applications in this view."
					}),
					visible.map((application) => {
						const match = application.match_result ? normalizeMatch(application.match_result) : null;
						const health = pipelineHealth(application, windows);
						const archived = Boolean(application.archived_at);
						const reminderInDays = application.next_action_at ? daysUntil(application.next_action_at) : null;
						return /* @__PURE__ */ jsxs("div", {
							className: cn("group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40", toneEdgeClass(health.tone)),
							children: [
								isBulkMode && /* @__PURE__ */ jsx("div", {
									className: "animate-fade-in",
									children: /* @__PURE__ */ jsx(Checkbox, {
										checked: selected.includes(application.id),
										onCheckedChange: (checked) => toggleSelected(application.id, checked === true),
										"aria-label": `Select ${application.role_title || "application"}`
									})
								}),
								/* @__PURE__ */ jsxs(Link, {
									to: "/applications/$id",
									params: { id: application.id },
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex flex-wrap items-center gap-2",
											children: [
												/* @__PURE__ */ jsx("p", {
													className: "truncate font-display text-base font-semibold",
													children: application.role_title || "Untitled role"
												}),
												/* @__PURE__ */ jsx(Badge, {
													variant: "secondary",
													children: stageLabel(application.stage)
												}),
												/* @__PURE__ */ jsx("span", {
													className: "text-xs uppercase text-muted-foreground",
													children: application.language ?? "en"
												})
											]
										}),
										/* @__PURE__ */ jsx("p", {
											className: "mt-0.5 truncate text-sm text-muted-foreground",
											children: application.company || "Unknown company"
										}),
										/* @__PURE__ */ jsx("p", {
											className: cn("mt-1 truncate text-sm", toneTextClass(health.tone)),
											children: health.sentence
										}),
										reminderInDays !== null && !archived && /* @__PURE__ */ jsxs("p", {
											className: "mt-1 flex items-center gap-1.5 text-xs text-muted-foreground",
											children: [/* @__PURE__ */ jsx(Bell, { className: "size-3" }), reminderInDays > 0 ? `Follow up in ${reminderInDays} day${reminderInDays === 1 ? "" : "s"}` : reminderInDays === 0 ? "Follow up today" : `Follow-up overdue by ${Math.abs(reminderInDays)} day${reminderInDays === -1 ? "" : "s"}`]
										})
									]
								}),
								match && /* @__PURE__ */ jsxs("div", {
									className: "text-right",
									children: [/* @__PURE__ */ jsxs("p", {
										className: "font-display text-xl font-bold text-primary",
										children: [match.score, "%"]
									}), /* @__PURE__ */ jsx("p", {
										className: "text-[11px] uppercase tracking-wide text-muted-foreground",
										children: "match"
									})]
								}),
								archived ? /* @__PURE__ */ jsxs(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => restoreMutation.mutate(application.id),
									children: [/* @__PURE__ */ jsx(ArchiveRestore, { className: "size-4" }), " Reclaim"]
								}) : /* @__PURE__ */ jsx(Archive, {
									className: "size-4 text-transparent",
									"aria-hidden": true
								}),
								/* @__PURE__ */ jsx(Button, {
									variant: "ghost",
									size: "icon-sm",
									className: "text-muted-foreground hover:text-destructive",
									onClick: () => deleteMutation.mutate(application.id),
									"aria-label": "Delete application",
									children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
								})
							]
						}, application.id);
					})
				]
			})
		]
	}) });
}
//#endregion
export { Dashboard as component };
