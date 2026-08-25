import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as normalizeCv, m as sectionLabels, p as normalizeMatch, t as LANGUAGES } from "./cv-DMqvWRdG.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-DyZVOtWw.mjs";
import { n as Label, t as Input } from "./input-Cl4UdChK.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { K as ArrowLeft, M as Download, d as Sparkle, n as WandSparkles } from "../_libs/lucide-react.mjs";
import { m as Textarea, t as AppShell, x as useServerFn } from "./app-shell-BSALpTtH.mjs";
import { n as DEFAULT_TEMPLATE } from "./cv-template-6N3GXnPx.mjs";
import { t as Spinner } from "./spinner-iFQhnBJc.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Bub4Crhq.mjs";
import { r as getCvTemplate, t as downloadCvPdf } from "./template.functions-Ckt2YtgL.mjs";
import { i as getRoleTarget, o as updateRoleTarget, r as generateTargetCv } from "./targets.functions-BFgxQ2gl.mjs";
import { t as Route } from "./targets._id-7JEKpdds.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/targets._id-BtZ9dSeJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TargetWorkspace() {
	const { id } = Route.useParams();
	const queryClient = useQueryClient();
	const fetchTarget = useServerFn(getRoleTarget);
	const update = useServerFn(updateRoleTarget);
	const generate = useServerFn(generateTargetCv);
	const fetchTemplate = useServerFn(getCvTemplate);
	const { data, isLoading } = useQuery({
		queryKey: ["role-target", id],
		queryFn: () => fetchTarget({ data: { id } })
	});
	const templateSettings = useQuery({
		queryKey: ["cv-template"],
		queryFn: () => fetchTemplate()
	}).data ?? DEFAULT_TEMPLATE;
	const [title, setTitle] = (0, import_react.useState)("");
	const [seniority, setSeniority] = (0, import_react.useState)("");
	const [location, setLocation] = (0, import_react.useState)("");
	const [industry, setIndustry] = (0, import_react.useState)("");
	const [keywords, setKeywords] = (0, import_react.useState)("");
	const [sampleOffers, setSampleOffers] = (0, import_react.useState)("");
	const [language, setLanguage] = (0, import_react.useState)("en");
	const [cv, setCv] = (0, import_react.useState)(null);
	const [match, setMatch] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!data) return;
		const row = data;
		setTitle(row["title"] ?? "");
		setSeniority(row["seniority"] ?? "");
		setLocation(row["location"] ?? "");
		setIndustry(row["industry"] ?? "");
		setKeywords(Array.isArray(row["keywords"]) ? row["keywords"].join(", ") : "");
		setSampleOffers(row["sample_offers"] ?? "");
		setLanguage(row["language"] === "es" ? "es" : "en");
		setCv(row["generated_cv"] ? normalizeCv(row["generated_cv"]) : null);
		setMatch(row["match_result"] ? normalizeMatch(row["match_result"]) : null);
	}, [data]);
	const labels = sectionLabels(language);
	const payload = () => ({
		id,
		title,
		seniority,
		location,
		industry,
		keywords: keywords.split(",").map((item) => item.trim()).filter(Boolean),
		sampleOffers,
		language
	});
	const saveMutation = useMutation({
		mutationFn: () => update({ data: payload() }),
		onSuccess: () => {
			toast.success("Target saved");
			queryClient.invalidateQueries({ queryKey: ["role-targets"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const generateMutation = useMutation({
		mutationFn: async () => {
			await update({ data: payload() });
			return generate({ data: { id } });
		},
		onSuccess: (result) => {
			setCv(result.cv);
			setMatch(result.match);
			queryClient.invalidateQueries({ queryKey: ["role-targets"] });
			toast.success("Role CV generated");
		},
		onError: (error) => toast.error(error.message)
	});
	if (isLoading || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto max-w-6xl px-6 py-16 text-sm text-muted-foreground",
		children: "Loading…"
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-7xl px-6 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/targets",
				className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }), " All targets"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "max-w-md font-display text-lg font-semibold",
					value: title,
					onChange: (event) => setTitle(event.target.value),
					placeholder: "Senior Backend Engineer"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => saveMutation.mutate(),
						children: "Save"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => generateMutation.mutate(),
						disabled: generateMutation.isPending,
						children: [generateMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spinner, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "size-4" }), cv ? "Regenerate CV" : "Generate CV"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-5 lg:grid-cols-[1fr_1.3fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-4 rounded-xl border border-border bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "seniority",
										children: "Seniority"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "seniority",
										value: seniority,
										onChange: (event) => setSeniority(event.target.value),
										placeholder: "Senior / Lead"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "industry",
										children: "Industry"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "industry",
										value: industry,
										onChange: (event) => setIndustry(event.target.value),
										placeholder: "Fintech, SaaS…"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "location",
										children: "Location / work mode"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "location",
										value: location,
										onChange: (event) => setLocation(event.target.value),
										placeholder: "Madrid · Remote"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "CV language" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: language,
										onValueChange: (value) => setLanguage(value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: LANGUAGES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: item.code,
											children: item.native
										}, item.code)) })]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "keywords",
									children: "Keywords to emphasise"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "keywords",
									value: keywords,
									onChange: (event) => setKeywords(event.target.value),
									placeholder: "Go, Kubernetes, event-driven, PostgreSQL"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Comma separated."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "samples",
								children: "Sample job ads (optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "samples",
								rows: 12,
								value: sampleOffers,
								onChange: (event) => setSampleOffers(event.target.value),
								placeholder: "Paste 1-3 job ads you'd realistically apply to. The AI uses them as the market description for this role."
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "min-w-0",
					children: [match && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-5 rounded-xl border border-border bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-display text-3xl font-bold text-primary",
									children: [match.score, "%"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted-foreground",
									children: "role readiness"
								})]
							}),
							match.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed text-muted-foreground",
								children: match.notes
							}),
							match.missing.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs uppercase tracking-wide text-muted-foreground",
									children: "Usually asked, not covered yet"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-1.5",
									children: match.missing.map((keyword) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground",
										children: keyword
									}, keyword))
								})]
							})
						]
					}), cv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap items-center justify-end gap-2 border-b border-border p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => downloadCvPdf(cv, `${(cv.fullName || "CV").replace(/\s+/g, "-")}-${(title || "role").replace(/\s+/g, "-")}.pdf`, language, templateSettings),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), " Download PDF"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "space-y-6 p-7 text-sm leading-relaxed",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
									className: "flex items-start gap-4",
									children: [cv.photoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: cv.photoUrl,
										alt: `${cv.fullName} profile photo`,
										className: "size-16 shrink-0 rounded-full object-cover"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "font-display text-xl font-bold",
												children: cv.fullName
											}),
											cv.headline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-muted-foreground",
												children: cv.headline
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: [
													cv.email,
													cv.phone,
													cv.location
												].filter(Boolean).join("  •  ")
											})
										]
									})]
								}),
								cv.summary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-xs font-semibold uppercase tracking-wide text-primary",
									children: labels.summary
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									className: "mt-2",
									rows: 4,
									value: cv.summary,
									onChange: (event) => setCv({
										...cv,
										summary: event.target.value
									}),
									onBlur: () => update({ data: {
										id,
										generatedCv: cv
									} })
								})] }),
								cv.experiences.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-xs font-semibold uppercase tracking-wide text-primary",
									children: labels.experience
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 space-y-4",
									children: cv.experiences.map((experience, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-semibold",
											children: [experience.title, experience.company ? ` — ${experience.company}` : ""]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: [experience.location, [experience.start, experience.end].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "mt-2 list-disc space-y-1 pl-5",
											children: experience.bullets.map((bullet, bulletIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: bullet }, bulletIndex))
										})
									] }, index))
								})] }),
								cv.education.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-xs font-semibold uppercase tracking-wide text-primary",
									children: labels.education
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 space-y-3",
									children: cv.education.map((education, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-semibold",
											children: [education.degree, education.school ? ` — ${education.school}` : ""]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: [education.start, education.end].filter(Boolean).join(" – ")
										}),
										education.details && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: education.details })
									] }, index))
								})] }),
								cv.skills.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-xs font-semibold uppercase tracking-wide text-primary",
									children: labels.skills
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "mt-2",
									value: cv.skills.join(", "),
									onChange: (event) => setCv({
										...cv,
										skills: event.target.value.split(",").map((item) => item.trim()).filter(Boolean)
									}),
									onBlur: () => update({ data: {
										id,
										generatedCv: cv
									} })
								})] })
							]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-dashed border-border p-12 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkle, { className: "mx-auto size-6 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: "No role CV yet. Fill in the details on the left, then hit “Generate CV”."
						})]
					})]
				})]
			})
		]
	}) });
}
//#endregion
export { TargetWorkspace as component };
