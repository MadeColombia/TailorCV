import { t as Button } from "./button-DyZVOtWw.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { ArrowRight, FileText, MessagesSquare, ScanLine, Target } from "lucide-react";
//#region src/routes/index.tsx?tsr-split=component
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
	return /* @__PURE__ */ jsxs("main", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-6",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "font-display text-lg font-bold tracking-tight",
					children: ["Tailor", /* @__PURE__ */ jsx("span", {
						className: "text-primary",
						children: "CV"
					})]
				}), /* @__PURE__ */ jsx(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/auth",
						children: "Sign in"
					})
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "grain relative mx-auto max-w-6xl px-6 pb-20 pt-10 md:pt-20",
				children: [
					/* @__PURE__ */ jsxs("p", {
						className: "mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground",
						children: [/* @__PURE__ */ jsx(Target, { className: "size-3.5 text-primary" }), "Built for applicant tracking systems"]
					}),
					/* @__PURE__ */ jsxs("h1", {
						className: "max-w-3xl text-4xl font-bold leading-[1.05] md:text-6xl",
						children: [
							"One profile in.",
							/* @__PURE__ */ jsx("br", {}),
							/* @__PURE__ */ jsx("span", {
								className: "text-primary",
								children: "A tailored CV"
							}),
							" out, for every offer."
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-6 max-w-xl text-base leading-relaxed text-muted-foreground",
						children: "Paste the job description. TailorCV rewrites your résumé around it — same facts, the right words — scores the keyword match, and writes the cover letter to send with it."
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-9 flex flex-wrap gap-3",
						children: /* @__PURE__ */ jsx(Button, {
							asChild: true,
							size: "lg",
							children: /* @__PURE__ */ jsxs(Link, {
								to: "/auth",
								children: ["Build my CV ", /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })]
							})
						})
					})
				]
			}),
			/* @__PURE__ */ jsx("section", {
				className: "mx-auto max-w-6xl px-6 pb-24",
				children: /* @__PURE__ */ jsx("div", {
					className: "grid gap-4 md:grid-cols-3",
					children: steps.map((step, index) => /* @__PURE__ */ jsxs("article", {
						className: "rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ jsx(step.icon, { className: "size-5 text-primary" }), /* @__PURE__ */ jsxs("span", {
									className: "font-display text-xs text-muted-foreground",
									children: ["0", index + 1]
								})]
							}),
							/* @__PURE__ */ jsx("h2", {
								className: "mt-5 text-lg font-semibold",
								children: step.title
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 text-sm leading-relaxed text-muted-foreground",
								children: step.body
							})
						]
					}, step.title))
				})
			}),
			/* @__PURE__ */ jsx("footer", {
				className: "border-t border-border",
				children: /* @__PURE__ */ jsx("div", {
					className: "mx-auto max-w-6xl px-6 py-8 text-xs text-muted-foreground",
					children: "TailorCV — your experience, phrased for the machine that reads it first."
				})
			})
		]
	});
}
//#endregion
export { Landing as component };
