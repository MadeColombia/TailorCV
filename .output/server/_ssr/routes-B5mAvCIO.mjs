import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-DyZVOtWw.mjs";
import { A as FileText, G as ArrowRight, p as ScanLine, s as Target, v as MessagesSquare } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B5mAvCIO.js
var import_jsx_runtime = require_jsx_runtime();
var steps = [
	{
		icon: FileText,
		title: "Drop in your CV",
		body: "Upload a PDF or fill the fields. We turn it into one structured master profile you never retype."
	},
	{
		icon: MessagesSquare,
		title: "Answer the interview",
		body: "The AI reads the offer, spots the gaps, and asks only the questions that would make your CV land."
	},
	{
		icon: ScanLine,
		title: "Get an ATS-safe PDF",
		body: "Single column, real text, offer keywords mirrored truthfully. Plus a cover letter in the same voice."
	}
];
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-display text-lg font-bold tracking-tight",
					children: ["Tailor", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-primary",
						children: "CV"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						children: "Sign in"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grain relative mx-auto max-w-6xl px-6 pb-20 pt-10 md:pt-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-3.5 text-primary" }), "Built for applicant tracking systems"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "max-w-3xl text-4xl font-bold leading-[1.05] md:text-6xl",
						children: [
							"One profile in.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-primary",
								children: "A tailored CV"
							}),
							" out, for every offer."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-xl text-base leading-relaxed text-muted-foreground",
						children: "Paste the job description. TailorCV rewrites your résumé around it — same facts, the right words — scores the keyword match, and writes the cover letter to send with it."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-9 flex flex-wrap gap-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/auth",
								children: ["Build my CV ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto max-w-6xl px-6 pb-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-4 md:grid-cols-3",
					children: steps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(step.icon, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-display text-xs text-muted-foreground",
									children: ["0", index + 1]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-5 text-lg font-semibold",
								children: step.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted-foreground",
								children: step.body
							})
						]
					}, step.title))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-6xl px-6 py-8 text-xs text-muted-foreground",
					children: "TailorCV — your experience, phrased for the machine that reads it first."
				})
			})
		]
	});
}
//#endregion
export { Landing as component };
