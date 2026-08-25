//#region node_modules/.nitro/vite/services/ssr/assets/cv-template-6N3GXnPx.js
var DEFAULT_TEMPLATE = {
	template: "classic",
	font: "helvetica",
	density: "normal",
	accent: "none",
	showPhoto: false,
	sectionOrder: [
		"summary",
		"experience",
		"education",
		"skills"
	]
};
var TEMPLATE_OPTIONS = [
	{
		id: "classic",
		label: "Classic",
		description: "Single column with ruled section headings — the most conservative ATS layout."
	},
	{
		id: "compact",
		label: "Compact",
		description: "Same single column, tighter spacing and smaller headings for dense CVs."
	},
	{
		id: "band",
		label: "Header band",
		description: "Name and contact set apart in a light band at the top, body stays single column."
	}
];
var FONT_OPTIONS = [
	{
		id: "helvetica",
		label: "Helvetica (sans)",
		css: "Helvetica, Arial, sans-serif"
	},
	{
		id: "times",
		label: "Times (serif)",
		css: "'Times New Roman', Times, serif"
	},
	{
		id: "courier",
		label: "Courier (mono)",
		css: "'Courier New', Courier, monospace"
	}
];
var DENSITY_OPTIONS = [
	{
		id: "small",
		label: "Small",
		factor: .92
	},
	{
		id: "normal",
		label: "Normal",
		factor: 1
	},
	{
		id: "large",
		label: "Large",
		factor: 1.08
	}
];
var ACCENT_OPTIONS = [
	{
		id: "none",
		label: "None (black)",
		hex: "#111111"
	},
	{
		id: "navy",
		label: "Navy",
		hex: "#1f3864"
	},
	{
		id: "slate",
		label: "Slate",
		hex: "#3f4a5a"
	},
	{
		id: "teal",
		label: "Teal",
		hex: "#155e5b"
	},
	{
		id: "maroon",
		label: "Maroon",
		hex: "#6b2233"
	}
];
var SECTION_LABELS_UI = {
	summary: "Summary",
	experience: "Experience",
	education: "Education",
	skills: "Skills"
};
function accentHex(accent) {
	return ACCENT_OPTIONS.find((option) => option.id === accent)?.hex ?? "#111111";
}
function densityFactor(density) {
	return DENSITY_OPTIONS.find((option) => option.id === density)?.factor ?? 1;
}
function fontCss(font) {
	return FONT_OPTIONS.find((option) => option.id === font)?.css ?? FONT_OPTIONS[0].css;
}
var SECTIONS = [
	"summary",
	"experience",
	"education",
	"skills"
];
function normalizeTemplate(input) {
	const raw = input ?? {};
	const template = [
		"classic",
		"compact",
		"band"
	].includes(raw["template"]) ? raw["template"] : DEFAULT_TEMPLATE.template;
	const font = [
		"helvetica",
		"times",
		"courier"
	].includes(raw["font"]) ? raw["font"] : DEFAULT_TEMPLATE.font;
	const density = [
		"small",
		"normal",
		"large"
	].includes(raw["density"]) ? raw["density"] : DEFAULT_TEMPLATE.density;
	const accent = ACCENT_OPTIONS.some((option) => option.id === raw["accent"]) ? String(raw["accent"]) : DEFAULT_TEMPLATE.accent;
	const requested = Array.isArray(raw["sectionOrder"]) ? raw["sectionOrder"].filter((item) => SECTIONS.includes(item)) : [];
	const sectionOrder = [.../* @__PURE__ */ new Set([...requested, ...SECTIONS])];
	return {
		template,
		font,
		density,
		accent,
		showPhoto: raw["showPhoto"] === true,
		sectionOrder
	};
}
//#endregion
export { SECTION_LABELS_UI as a, densityFactor as c, FONT_OPTIONS as i, fontCss as l, DEFAULT_TEMPLATE as n, TEMPLATE_OPTIONS as o, DENSITY_OPTIONS as r, accentHex as s, ACCENT_OPTIONS as t, normalizeTemplate as u };
