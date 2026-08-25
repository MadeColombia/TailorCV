import { t as createServerFn } from "./createServerFn-BFFE07zL.js";
import { S as useServerFn, c as Textarea, d as TabsList, f as TabsTrigger, l as Tabs, o as createSsrRpc, s as Switch, t as AppShell, x as useUiStrings } from "./app-shell-bjwPVDLq.js";
import { t as requireSupabaseAuth } from "./auth-middleware-ZGAJzz7F.js";
import { a as emptyCv, c as emptyLink, m as sectionLabels, n as LINK_PRESETS, o as emptyEducation, s as emptyExperience, t as LANGUAGES } from "./cv-DMqvWRdG.js";
import { a as SECTION_LABELS_UI, c as densityFactor, i as FONT_OPTIONS, l as fontCss, n as DEFAULT_TEMPLATE, o as TEMPLATE_OPTIONS, r as DENSITY_OPTIONS, s as accentHex, t as ACCENT_OPTIONS } from "./cv-template-6N3GXnPx.js";
import { r as cn, t as Button } from "./button-DyZVOtWw.js";
import { n as Label, t as Input } from "./input-Cl4UdChK.js";
import { t as Spinner } from "./spinner-iFQhnBJc.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Bub4Crhq.js";
import { i as updateUserSettings, r as getUserSettings } from "./user-settings.functions-Hdzanu9i.js";
import { n as saveCvTemplate, r as downloadCvPdf, t as getCvTemplate } from "./template.functions-DCc8TDCF.js";
import { useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Download, Languages, Plus, RotateCcw, Save, Trash2, Upload, UserRound, X } from "lucide-react";
//#region src/components/cv-template-editor.tsx
var SAMPLE = {
	...emptyCv,
	fullName: "Alex Moreno",
	email: "alex@example.com",
	phone: "+34 600 000 000",
	location: "Madrid, Spain",
	linkItems: [{
		label: "LinkedIn",
		url: "linkedin.com/in/alex"
	}],
	links: "LinkedIn: linkedin.com/in/alex",
	headline: "Senior Product Engineer",
	summary: "Product engineer with 8 years building data-heavy web platforms, focused on measurable delivery and clean, testable systems.",
	experiences: [{
		company: "Northwind",
		title: "Senior Product Engineer",
		location: "Remote",
		start: "2022",
		end: "Present",
		bullets: ["Led the migration of the billing platform, cutting invoice errors by 38%.", "Shipped a self-serve analytics module used by 12k monthly accounts."]
	}],
	education: [{
		school: "Universidad Politécnica",
		degree: "BSc Computer Science",
		start: "2013",
		end: "2017",
		details: ""
	}],
	skills: [
		"TypeScript",
		"React",
		"PostgreSQL",
		"AWS"
	]
};
function Panel({ title, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-xl border border-border bg-card p-5",
		children: [/* @__PURE__ */ jsx("h3", {
			className: "font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground",
			children: title
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-4 space-y-3",
			children
		})]
	});
}
function Preview({ cv, settings, language }) {
	const labels = sectionLabels(language);
	const accent = accentHex(settings.accent);
	const base = 12 * (densityFactor(settings.density) * (settings.template === "compact" ? .94 : 1));
	const heading = (label) => /* @__PURE__ */ jsx("h4", {
		className: "mb-2 border-b pb-1 font-semibold uppercase tracking-wide",
		style: {
			color: accent,
			borderColor: accent,
			fontSize: base * .9
		},
		children: label
	});
	const sections = {
		summary: cv.summary ? /* @__PURE__ */ jsxs("div", {
			className: "mt-4",
			children: [heading(labels.summary), /* @__PURE__ */ jsx("p", { children: cv.summary })]
		}, "summary") : null,
		experience: cv.experiences.length ? /* @__PURE__ */ jsxs("div", {
			className: "mt-4",
			children: [heading(labels.experience), cv.experiences.map((exp, index) => /* @__PURE__ */ jsxs("div", {
				className: "mb-3",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "font-semibold",
						children: [exp.title, exp.company].filter(Boolean).join(" — ")
					}),
					/* @__PURE__ */ jsx("p", {
						style: {
							fontSize: base * .85,
							opacity: .75
						},
						children: [exp.location, [exp.start, exp.end].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ")
					}),
					/* @__PURE__ */ jsx("ul", {
						className: "mt-1 list-disc pl-4",
						children: exp.bullets.map((bullet, bulletIndex) => /* @__PURE__ */ jsx("li", { children: bullet }, bulletIndex))
					})
				]
			}, index))]
		}, "experience") : null,
		education: cv.education.length ? /* @__PURE__ */ jsxs("div", {
			className: "mt-4",
			children: [heading(labels.education), cv.education.map((edu, index) => /* @__PURE__ */ jsxs("div", {
				className: "mb-2",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "font-semibold",
						children: [edu.degree, edu.school].filter(Boolean).join(" — ")
					}),
					/* @__PURE__ */ jsx("p", {
						style: {
							fontSize: base * .85,
							opacity: .75
						},
						children: [edu.start, edu.end].filter(Boolean).join(" – ")
					}),
					edu.details && /* @__PURE__ */ jsx("p", { children: edu.details })
				]
			}, index))]
		}, "education") : null,
		skills: cv.skills.length ? /* @__PURE__ */ jsxs("div", {
			className: "mt-4",
			children: [heading(labels.skills), /* @__PURE__ */ jsx("p", { children: cv.skills.join(", ") })]
		}, "skills") : null
	};
	const links = cv.linkItems.length ? cv.linkItems.filter((item) => item.url.trim()).map((item) => item.label ? `${item.label}: ${item.url}` : item.url).join("  |  ") : cv.links;
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-lg bg-white p-8 text-[#111] shadow-sm",
		style: {
			fontFamily: fontCss(settings.font),
			fontSize: base,
			lineHeight: 1.45
		},
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: cn("flex items-start gap-4", settings.template === "band" && "-m-8 mb-0 bg-[#f4f5f7] p-8"),
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "font-bold",
							style: { fontSize: base * 1.7 },
							children: cv.fullName
						}),
						cv.headline && /* @__PURE__ */ jsx("p", {
							style: { fontSize: base * 1.05 },
							children: cv.headline
						}),
						/* @__PURE__ */ jsx("p", {
							style: {
								fontSize: base * .85,
								opacity: .8
							},
							children: [
								cv.email,
								cv.phone,
								cv.location
							].filter(Boolean).join("  |  ")
						}),
						links && /* @__PURE__ */ jsx("p", {
							style: {
								fontSize: base * .85,
								opacity: .8
							},
							children: links
						})
					]
				}), settings.showPhoto && cv.photoUrl && /* @__PURE__ */ jsx("img", {
					src: cv.photoUrl,
					alt: "",
					className: "size-16 shrink-0 object-cover"
				})]
			}),
			settings.template === "band" && /* @__PURE__ */ jsx("div", { className: "h-4" }),
			settings.sectionOrder.map((section) => sections[section])
		]
	});
}
/** Purely visual CV template controls with a live preview of the master profile. */
function CvTemplateEditor({ profileCv, language = "en" }) {
	const fetchTemplate = useServerFn(getCvTemplate);
	const persistTemplate = useServerFn(saveCvTemplate);
	const templateQuery = useQuery({
		queryKey: ["cv-template"],
		queryFn: () => fetchTemplate()
	});
	const [settings, setSettings] = useState(DEFAULT_TEMPLATE);
	useEffect(() => {
		if (templateQuery.data) setSettings(templateQuery.data);
	}, [templateQuery.data]);
	const saveMutation = useMutation({
		mutationFn: (next) => persistTemplate({ data: { settings: next } }),
		onSuccess: () => toast.success("Template saved — it will be used for every CV export."),
		onError: (error) => toast.error(error.message)
	});
	const patch = (next) => setSettings((current) => ({
		...current,
		...next
	}));
	const move = (index, direction) => {
		setSettings((current) => {
			const order = [...current.sectionOrder];
			const target = index + direction;
			if (target < 0 || target >= order.length) return current;
			[order[index], order[target]] = [order[target], order[index]];
			return {
				...current,
				sectionOrder: order
			};
		});
	};
	const previewCv = profileCv && (profileCv.fullName || profileCv.experiences.length) ? profileCv : SAMPLE;
	if (templateQuery.isLoading) return /* @__PURE__ */ jsx("div", {
		className: "flex justify-center py-10",
		children: /* @__PURE__ */ jsx(Spinner, { className: "size-5" })
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap justify-end gap-2",
			children: [
				/* @__PURE__ */ jsxs(Button, {
					variant: "ghost",
					onClick: () => {
						setSettings(DEFAULT_TEMPLATE);
						saveMutation.mutate(DEFAULT_TEMPLATE);
					},
					children: [/* @__PURE__ */ jsx(RotateCcw, { className: "size-4" }), " Default design"]
				}),
				/* @__PURE__ */ jsxs(Button, {
					variant: "outline",
					onClick: () => downloadCvPdf(previewCv, "cv-template-sample.pdf", language, settings),
					children: [/* @__PURE__ */ jsx(Download, { className: "size-4" }), " Sample PDF"]
				}),
				/* @__PURE__ */ jsxs(Button, {
					onClick: () => saveMutation.mutate(settings),
					disabled: saveMutation.isPending,
					children: [saveMutation.isPending ? /* @__PURE__ */ jsx(Spinner, { className: "size-4" }) : /* @__PURE__ */ jsx(Save, { className: "size-4" }), "Save template"]
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid gap-6 lg:grid-cols-[320px_1fr]",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsx(Panel, {
						title: "Template",
						children: TEMPLATE_OPTIONS.map((option) => /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => patch({ template: option.id }),
							className: cn("w-full rounded-lg border p-3 text-left transition-colors", settings.template === option.id ? "border-primary bg-secondary" : "border-border hover:border-muted-foreground/40"),
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-sm font-medium",
								children: option.label
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: option.description
							})]
						}, option.id))
					}),
					/* @__PURE__ */ jsxs(Panel, {
						title: "Typography",
						children: [/* @__PURE__ */ jsx("div", {
							className: "grid grid-cols-3 gap-2",
							children: FONT_OPTIONS.map((option) => /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => patch({ font: option.id }),
								style: { fontFamily: option.css },
								className: cn("rounded-md border px-2 py-2 text-xs", settings.font === option.id ? "border-primary bg-secondary" : "border-border text-muted-foreground"),
								children: option.label.split(" ")[0]
							}, option.id))
						}), /* @__PURE__ */ jsx("div", {
							className: "grid grid-cols-3 gap-2",
							children: DENSITY_OPTIONS.map((option) => /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => patch({ density: option.id }),
								className: cn("rounded-md border px-2 py-2 text-xs", settings.density === option.id ? "border-primary bg-secondary" : "border-border text-muted-foreground"),
								children: option.label
							}, option.id))
						})]
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Accent colour",
						children: /* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap gap-2",
							children: ACCENT_OPTIONS.map((option) => /* @__PURE__ */ jsx("button", {
								type: "button",
								title: option.label,
								onClick: () => patch({ accent: option.id }),
								className: cn("size-8 rounded-full border-2", settings.accent === option.id ? "border-primary" : "border-border"),
								style: { backgroundColor: option.hex }
							}, option.id))
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Photo",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
								htmlFor: "show-photo",
								children: "Show profile photo"
							}), /* @__PURE__ */ jsx("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Off by default — many parsers prefer a CV with no image."
							})] }), /* @__PURE__ */ jsx(Switch, {
								id: "show-photo",
								checked: settings.showPhoto,
								onCheckedChange: (checked) => patch({ showPhoto: checked })
							})]
						})
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "Section order",
						children: settings.sectionOrder.map((section, index) => /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm",
							children: [SECTION_LABELS_UI[section], /* @__PURE__ */ jsxs("div", {
								className: "flex gap-1",
								children: [/* @__PURE__ */ jsx(Button, {
									variant: "ghost",
									size: "icon",
									className: "size-7",
									onClick: () => move(index, -1),
									"aria-label": `Move ${SECTION_LABELS_UI[section]} up`,
									children: /* @__PURE__ */ jsx(ArrowUp, { className: "size-3.5" })
								}), /* @__PURE__ */ jsx(Button, {
									variant: "ghost",
									size: "icon",
									className: "size-7",
									onClick: () => move(index, 1),
									"aria-label": `Move ${SECTION_LABELS_UI[section]} down`,
									children: /* @__PURE__ */ jsx(ArrowDown, { className: "size-3.5" })
								})]
							})]
						}, section))
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "rounded-xl border border-border bg-muted/30 p-4",
				children: [/* @__PURE__ */ jsx("p", {
					className: "mb-3 text-xs uppercase tracking-wide text-muted-foreground",
					children: "Preview — how your PDF will look"
				}), /* @__PURE__ */ jsx(Preview, {
					cv: previewCv,
					settings,
					language
				})]
			})]
		})]
	});
}
//#endregion
//#region src/lib/profile.functions.ts
function lang(value) {
	return value === "es" ? "es" : "en";
}
var getProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => ({ language: lang(input?.language) })).handler(createSsrRpc("9df9652da79c7ccc337ce62c64dcd11f1800a8eb6e0bd13747650358f67fe4e8"));
/** Which language versions the user has actually filled in. */
var listProfileVersions = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("b2058c9262bf2a9974141b874658eabbdbb7a82ec9ed396cbbec288097cd7267"));
var saveProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("cbcc924041242dd11e1ad5000167f6d3fdcc014f84f3fe5dca969bb9361d5d65"));
var extractCvFromFile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("8a537ba8441d63d2f6be38e34dad8fadf34566543511cfc7ceb7dc5a88cfba38"));
/** Translate one saved profile version into another language and save it. */
var translateProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("3404311c309f1ed5631d4d98ddbeb66886f0d6eaaec57dd015223e481d95bf4d"));
//#endregion
//#region src/lib/profile-strings.ts
var EN = {
	title: "Master profile",
	subtitle: "Everything you have ever done — one version per language.",
	importPdf: "Import PDF",
	save: "Save profile",
	download: "Download CV",
	tabDetails: "Profile details",
	tabTemplate: "CV template",
	languageHint: (other) => `Upload a CV in this language, fill it in by hand, or translate the ${other} one.`,
	translateFrom: (other) => `Translate from ${other}`,
	fillOtherFirst: (other) => `Fill in your ${other} profile first`,
	loading: "Loading…",
	contact: "Contact",
	photoOptional: "Optional. Left out of the ATS PDF.",
	addPhoto: "Add photo",
	changePhoto: "Change",
	removePhoto: "Remove photo",
	fullName: "Full name",
	headline: "Professional headline",
	headlinePlaceholder: "Senior Data Analyst",
	email: "Email",
	phone: "Phone",
	location: "Location",
	links: "Links",
	addLink: "Add link",
	linksEmpty: "Add your LinkedIn, GitHub, portfolio or personal site — one line each.",
	label: "Label",
	removeLink: "Remove link",
	summary: "Summary",
	summaryPlaceholder: "Three or four lines about what you do and the results you get.",
	experience: "Experience",
	jobTitle: "Job title",
	company: "Company",
	start: "Start",
	end: "End",
	bulletsPlaceholder: "One achievement per line",
	removeRole: "Remove role",
	addRole: "Add role",
	education: "Education",
	degree: "Degree",
	school: "School",
	details: "Details (optional)",
	remove: "Remove",
	addEducation: "Add education",
	skills: "Skills",
	skillsPlaceholder: "SQL, Python, Power BI, stakeholder management…",
	languageNames: {
		en: "English",
		es: "Spanish",
		pt: "Portuguese",
		fr: "French",
		de: "German",
		it: "Italian",
		nl: "Dutch",
		ca: "Catalan"
	}
};
var ES = {
	title: "Perfil maestro",
	subtitle: "Todo lo que has hecho — una versión por idioma.",
	importPdf: "Importar PDF",
	save: "Guardar perfil",
	download: "Descargar CV",
	tabDetails: "Datos del perfil",
	tabTemplate: "Plantilla del CV",
	languageHint: (other) => `Sube un CV en este idioma, rellénalo a mano o traduce el de ${other}.`,
	translateFrom: (other) => `Traducir desde ${other}`,
	fillOtherFirst: (other) => `Rellena primero tu perfil en ${other}`,
	loading: "Cargando…",
	contact: "Contacto",
	photoOptional: "Opcional. No se incluye en el PDF ATS.",
	addPhoto: "Añadir foto",
	changePhoto: "Cambiar",
	removePhoto: "Quitar foto",
	fullName: "Nombre completo",
	headline: "Titular profesional",
	headlinePlaceholder: "Analista de Datos Senior",
	email: "Correo electrónico",
	phone: "Teléfono",
	location: "Ubicación",
	links: "Enlaces",
	addLink: "Añadir enlace",
	linksEmpty: "Añade tu LinkedIn, GitHub, portfolio o web personal — una línea cada uno.",
	label: "Etiqueta",
	removeLink: "Quitar enlace",
	summary: "Perfil profesional",
	summaryPlaceholder: "Tres o cuatro líneas sobre lo que haces y los resultados que consigues.",
	experience: "Experiencia",
	jobTitle: "Puesto",
	company: "Empresa",
	start: "Inicio",
	end: "Fin",
	bulletsPlaceholder: "Un logro por línea",
	removeRole: "Quitar puesto",
	addRole: "Añadir puesto",
	education: "Formación",
	degree: "Titulación",
	school: "Centro de estudios",
	details: "Detalles (opcional)",
	remove: "Quitar",
	addEducation: "Añadir formación",
	skills: "Competencias",
	skillsPlaceholder: "SQL, Python, Power BI, gestión de stakeholders…",
	languageNames: {
		en: "inglés",
		es: "español",
		pt: "portugués",
		fr: "francés",
		de: "alemán",
		it: "italiano",
		nl: "neerlandés",
		ca: "catalán"
	}
};
function profileStrings(language) {
	return language === "es" ? ES : EN;
}
//#endregion
//#region src/routes/_authenticated/profile.tsx?tsr-split=component
function Section({ title, action, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-xl border border-border bg-card p-6",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground",
				children: title
			}), action]
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-5 space-y-4",
			children
		})]
	});
}
/** Downscale to a small square JPEG data URL so it fits comfortably in the profile row. */
async function toCompactDataUrl(file) {
	const dataUrl = await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read that image"));
		reader.readAsDataURL(file);
	});
	const image = await new Promise((resolve, reject) => {
		const element = new Image();
		element.onload = () => resolve(element);
		element.onerror = () => reject(/* @__PURE__ */ new Error("That image could not be opened"));
		element.src = dataUrl;
	});
	const size = 320;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const context = canvas.getContext("2d");
	if (!context) return dataUrl;
	const side = Math.min(image.width, image.height);
	context.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, size, size);
	return canvas.toDataURL("image/jpeg", .82);
}
function ProfilePage() {
	const queryClient = useQueryClient();
	const fetchProfile = useServerFn(getProfile);
	const fetchVersions = useServerFn(listProfileVersions);
	const persist = useServerFn(saveProfile);
	const extract = useServerFn(extractCvFromFile);
	const translate = useServerFn(translateProfile);
	const fetchTemplate = useServerFn(getCvTemplate);
	const fileRef = useRef(null);
	const photoRef = useRef(null);
	const [language, setLanguage] = useState("en");
	const fetchSettings = useServerFn(getUserSettings);
	const saveSettings = useServerFn(updateUserSettings);
	const cvLanguages = useQuery({
		queryKey: ["user-settings"],
		queryFn: () => fetchSettings()
	}).data?.cvLanguages ?? ["en"];
	const [view, setView] = useState("details");
	const [cv, setCv] = useState(emptyCv);
	const { data, isLoading, isFetching } = useQuery({
		queryKey: ["profile", language],
		queryFn: () => fetchProfile({ data: { language } })
	});
	const { data: versions = [] } = useQuery({
		queryKey: ["profile-versions"],
		queryFn: () => fetchVersions()
	});
	useEffect(() => {
		if (data) setCv(data.cv);
	}, [data]);
	const filled = new Set(versions.filter((version) => (version.full_name ?? "").trim().length > 0).map((version) => version.language));
	const saveMutation = useMutation({
		mutationFn: () => persist({ data: {
			language,
			cv
		} }),
		onSuccess: () => {
			toast.success(`${LANGUAGES.find((item) => item.code === language)?.label} profile saved`);
			queryClient.invalidateQueries({ queryKey: ["profile-versions"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const extractMutation = useMutation({
		mutationFn: async (file) => {
			const dataUrl = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(String(reader.result));
				reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read that file"));
				reader.readAsDataURL(file);
			});
			return extract({ data: {
				filename: file.name,
				dataUrl
			} });
		},
		onSuccess: (result) => {
			setCv((current) => ({
				...result,
				photoUrl: result.photoUrl || current.photoUrl
			}));
			toast.success("CV imported — review it and save");
		},
		onError: (error) => toast.error(error.message)
	});
	const translateMutation = useMutation({
		mutationFn: () => translate({ data: {
			from: language === "en" ? "es" : "en",
			to: language
		} }),
		onSuccess: (result) => {
			setCv(result);
			queryClient.invalidateQueries({ queryKey: ["profile-versions"] });
			toast.success("Translated — review the wording and save");
		},
		onError: (error) => toast.error(error.message)
	});
	const photoMutation = useMutation({
		mutationFn: toCompactDataUrl,
		onSuccess: (dataUrl) => set("photoUrl", dataUrl),
		onError: (error) => toast.error(error.message)
	});
	const set = (key, value) => setCv((current) => ({
		...current,
		[key]: value
	}));
	const otherLanguage = LANGUAGES.find((item) => item.code !== language && cvLanguages.includes(item.code) && filled.has(item.code)) ?? LANGUAGES.find((item) => item.code !== language && cvLanguages.includes(item.code)) ?? LANGUAGES[0];
	const addLanguageMutation = useMutation({
		mutationFn: (code) => saveSettings({ data: { cvLanguages: [...cvLanguages, code] } }),
		onSuccess: (result, code) => {
			queryClient.setQueryData(["user-settings"], result);
			setLanguage(code);
			toast.success(`${LANGUAGES.find((item) => item.code === code)?.native} version added`);
		},
		onError: (error) => toast.error(error.message)
	});
	const t = profileStrings(language);
	const ui = useUiStrings();
	const otherName = t.languageNames[otherLanguage.code] ?? otherLanguage.label;
	const { data: templateSettings } = useQuery({
		queryKey: ["cv-template"],
		queryFn: () => fetchTemplate()
	});
	const downloadMaster = () => {
		const name = (cv.fullName || "master-profile").toLowerCase().replace(/[^a-z0-9]+/g, "-");
		downloadCvPdf(cv, `${name}-${language}.pdf`, language, templateSettings ?? DEFAULT_TEMPLATE);
	};
	return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("main", {
		className: "mx-auto max-w-6xl px-6 py-10",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "text-2xl font-bold",
					children: t.title
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: t.subtitle
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ jsx("input", {
							ref: fileRef,
							type: "file",
							accept: "application/pdf",
							className: "hidden",
							onChange: (event) => {
								const file = event.target.files?.[0];
								if (file) extractMutation.mutate(file);
								event.target.value = "";
							}
						}),
						/* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							onClick: () => fileRef.current?.click(),
							disabled: extractMutation.isPending,
							children: [extractMutation.isPending ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsx(Upload, { className: "size-4" }), t.importPdf]
						}),
						/* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							onClick: downloadMaster,
							children: [/* @__PURE__ */ jsx(Download, { className: "size-4" }), t.download]
						}),
						/* @__PURE__ */ jsx(Button, {
							onClick: () => saveMutation.mutate(),
							disabled: saveMutation.isPending,
							children: t.save
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx(Tabs, {
				value: view,
				onValueChange: (value) => setView(value),
				children: /* @__PURE__ */ jsxs(TabsList, {
					className: "mt-6",
					children: [/* @__PURE__ */ jsx(TabsTrigger, {
						value: "details",
						children: t.tabDetails
					}), /* @__PURE__ */ jsx(TabsTrigger, {
						value: "design",
						children: t.tabTemplate
					})]
				})
			}),
			view === "details" && /* @__PURE__ */ jsxs("div", {
				className: "mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3",
				children: [
					/* @__PURE__ */ jsx(Tabs, {
						value: language,
						onValueChange: (value) => setLanguage(value),
						children: /* @__PURE__ */ jsx(TabsList, { children: LANGUAGES.filter((item) => cvLanguages.includes(item.code)).map((item) => /* @__PURE__ */ jsxs(TabsTrigger, {
							value: item.code,
							children: [item.native, filled.has(item.code) && /* @__PURE__ */ jsx("span", {
								className: "ml-1.5 text-primary",
								children: "•"
							})]
						}, item.code)) })
					}),
					LANGUAGES.some((item) => !cvLanguages.includes(item.code)) && /* @__PURE__ */ jsxs(Select, {
						value: "",
						onValueChange: (value) => addLanguageMutation.mutate(value),
						children: [/* @__PURE__ */ jsxs(SelectTrigger, {
							className: "w-44",
							"aria-label": "Add a CV language",
							children: [/* @__PURE__ */ jsx(Plus, { className: "size-4" }), /* @__PURE__ */ jsx("span", {
								className: "text-sm",
								children: ui.addLanguage
							})]
						}), /* @__PURE__ */ jsx(SelectContent, { children: LANGUAGES.filter((item) => !cvLanguages.includes(item.code)).map((item) => /* @__PURE__ */ jsx(SelectItem, {
							value: item.code,
							children: item.native
						}, item.code)) })]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "flex-1 text-xs text-muted-foreground",
						children: t.languageHint(otherName)
					}),
					/* @__PURE__ */ jsxs(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => translateMutation.mutate(),
						disabled: translateMutation.isPending || !filled.has(otherLanguage.code),
						title: filled.has(otherLanguage.code) ? void 0 : t.fillOtherFirst(otherName),
						children: [translateMutation.isPending ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsx(Languages, { className: "size-4" }), t.translateFrom(otherName)]
					})
				]
			}),
			view === "design" ? /* @__PURE__ */ jsx("div", {
				className: "mt-6",
				children: /* @__PURE__ */ jsx(CvTemplateEditor, {
					profileCv: cv,
					language
				})
			}) : isLoading || isFetching ? /* @__PURE__ */ jsx("p", {
				className: "mt-8 text-sm text-muted-foreground",
				children: t.loading
			}) : /* @__PURE__ */ jsxs("div", {
				className: "mt-4 space-y-4",
				children: [
					/* @__PURE__ */ jsx(Section, {
						title: t.contact,
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-start gap-6",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex flex-col items-center gap-2",
								children: [
									/* @__PURE__ */ jsx("div", {
										className: "relative size-24 overflow-hidden rounded-full border border-border bg-muted",
										children: cv.photoUrl ? /* @__PURE__ */ jsx("img", {
											src: cv.photoUrl,
											alt: cv.fullName ? `${cv.fullName} profile photo` : "Profile photo",
											className: "size-full object-cover"
										}) : /* @__PURE__ */ jsx(UserRound, { className: "absolute inset-0 m-auto size-9 text-muted-foreground" })
									}),
									/* @__PURE__ */ jsx("input", {
										ref: photoRef,
										type: "file",
										accept: "image/*",
										className: "hidden",
										onChange: (event) => {
											const file = event.target.files?.[0];
											if (file) photoMutation.mutate(file);
											event.target.value = "";
										}
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex gap-1",
										children: [/* @__PURE__ */ jsxs(Button, {
											variant: "outline",
											size: "sm",
											onClick: () => photoRef.current?.click(),
											disabled: photoMutation.isPending,
											children: [photoMutation.isPending ? /* @__PURE__ */ jsx(Spinner, {}) : null, cv.photoUrl ? t.changePhoto : t.addPhoto]
										}), cv.photoUrl && /* @__PURE__ */ jsx(Button, {
											variant: "ghost",
											size: "icon-sm",
											"aria-label": t.removePhoto,
											onClick: () => set("photoUrl", ""),
											children: /* @__PURE__ */ jsx(X, { className: "size-4" })
										})]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "max-w-28 text-center text-[11px] leading-tight text-muted-foreground",
										children: t.photoOptional
									})
								]
							}), /* @__PURE__ */ jsxs("div", {
								className: "grid min-w-64 flex-1 gap-4 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsx(Label, { children: t.fullName }), /* @__PURE__ */ jsx(Input, {
											value: cv.fullName,
											onChange: (event) => set("fullName", event.target.value)
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsx(Label, { children: t.headline }), /* @__PURE__ */ jsx(Input, {
											value: cv.headline,
											onChange: (event) => set("headline", event.target.value),
											placeholder: t.headlinePlaceholder
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsx(Label, { children: t.email }), /* @__PURE__ */ jsx(Input, {
											value: cv.email,
											onChange: (event) => set("email", event.target.value)
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsx(Label, { children: t.phone }), /* @__PURE__ */ jsx(Input, {
											value: cv.phone,
											onChange: (event) => set("phone", event.target.value)
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-2 sm:col-span-2",
										children: [/* @__PURE__ */ jsx(Label, { children: t.location }), /* @__PURE__ */ jsx(Input, {
											value: cv.location,
											onChange: (event) => set("location", event.target.value)
										})]
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ jsxs(Section, {
						title: t.links,
						action: /* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => set("linkItems", [...cv.linkItems, { ...emptyLink }]),
							children: [
								/* @__PURE__ */ jsx(Plus, { className: "size-4" }),
								" ",
								t.addLink
							]
						}),
						children: [cv.linkItems.length === 0 && /* @__PURE__ */ jsx("p", {
							className: "text-sm text-muted-foreground",
							children: t.linksEmpty
						}), cv.linkItems.map((link, index) => /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ jsxs(Select, {
									value: LINK_PRESETS.includes(link.label) ? link.label : "Other",
									onValueChange: (value) => set("linkItems", cv.linkItems.map((item, i) => i === index ? {
										...item,
										label: value
									} : item)),
									children: [/* @__PURE__ */ jsx(SelectTrigger, {
										className: "w-36",
										children: /* @__PURE__ */ jsx(SelectValue, {})
									}), /* @__PURE__ */ jsx(SelectContent, { children: LINK_PRESETS.map((preset) => /* @__PURE__ */ jsx(SelectItem, {
										value: preset,
										children: preset
									}, preset)) })]
								}),
								!LINK_PRESETS.includes(link.label) || link.label === "Other" ? /* @__PURE__ */ jsx(Input, {
									className: "w-40",
									placeholder: t.label,
									value: link.label,
									onChange: (event) => set("linkItems", cv.linkItems.map((item, i) => i === index ? {
										...item,
										label: event.target.value
									} : item))
								}) : null,
								/* @__PURE__ */ jsx(Input, {
									className: "min-w-56 flex-1",
									placeholder: "https://linkedin.com/in/you",
									value: link.url,
									onChange: (event) => set("linkItems", cv.linkItems.map((item, i) => i === index ? {
										...item,
										url: event.target.value
									} : item))
								}),
								/* @__PURE__ */ jsx(Button, {
									variant: "ghost",
									size: "icon-sm",
									"aria-label": t.removeLink,
									className: "text-muted-foreground hover:text-destructive",
									onClick: () => set("linkItems", cv.linkItems.filter((_, i) => i !== index)),
									children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
								})
							]
						}, index))]
					}),
					/* @__PURE__ */ jsx(Section, {
						title: t.summary,
						children: /* @__PURE__ */ jsx(Textarea, {
							rows: 4,
							value: cv.summary,
							onChange: (event) => set("summary", event.target.value),
							placeholder: t.summaryPlaceholder
						})
					}),
					/* @__PURE__ */ jsxs(Section, {
						title: t.experience,
						children: [cv.experiences.map((experience, index) => /* @__PURE__ */ jsxs("div", {
							className: "rounded-lg border border-border p-4",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [
										/* @__PURE__ */ jsx(Input, {
											placeholder: t.jobTitle,
											value: experience.title,
											onChange: (event) => set("experiences", cv.experiences.map((item, i) => i === index ? {
												...item,
												title: event.target.value
											} : item))
										}),
										/* @__PURE__ */ jsx(Input, {
											placeholder: t.company,
											value: experience.company,
											onChange: (event) => set("experiences", cv.experiences.map((item, i) => i === index ? {
												...item,
												company: event.target.value
											} : item))
										}),
										/* @__PURE__ */ jsx(Input, {
											placeholder: t.location,
											value: experience.location,
											onChange: (event) => set("experiences", cv.experiences.map((item, i) => i === index ? {
												...item,
												location: event.target.value
											} : item))
										}),
										/* @__PURE__ */ jsxs("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ jsx(Input, {
												placeholder: t.start,
												value: experience.start,
												onChange: (event) => set("experiences", cv.experiences.map((item, i) => i === index ? {
													...item,
													start: event.target.value
												} : item))
											}), /* @__PURE__ */ jsx(Input, {
												placeholder: t.end,
												value: experience.end,
												onChange: (event) => set("experiences", cv.experiences.map((item, i) => i === index ? {
													...item,
													end: event.target.value
												} : item))
											})]
										})
									]
								}),
								/* @__PURE__ */ jsx(Textarea, {
									className: "mt-3",
									rows: 4,
									placeholder: t.bulletsPlaceholder,
									value: experience.bullets.join("\n"),
									onChange: (event) => set("experiences", cv.experiences.map((item, i) => i === index ? {
										...item,
										bullets: event.target.value.split("\n")
									} : item))
								}),
								/* @__PURE__ */ jsxs(Button, {
									variant: "ghost",
									size: "sm",
									className: "mt-2 text-muted-foreground hover:text-destructive",
									onClick: () => set("experiences", cv.experiences.filter((_, i) => i !== index)),
									children: [
										/* @__PURE__ */ jsx(Trash2, { className: "size-4" }),
										" ",
										t.removeRole
									]
								})
							]
						}, index)), /* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => set("experiences", [...cv.experiences, { ...emptyExperience }]),
							children: [
								/* @__PURE__ */ jsx(Plus, { className: "size-4" }),
								" ",
								t.addRole
							]
						})]
					}),
					/* @__PURE__ */ jsxs(Section, {
						title: t.education,
						children: [cv.education.map((education, index) => /* @__PURE__ */ jsxs("div", {
							className: "grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx(Input, {
									placeholder: t.degree,
									value: education.degree,
									onChange: (event) => set("education", cv.education.map((item, i) => i === index ? {
										...item,
										degree: event.target.value
									} : item))
								}),
								/* @__PURE__ */ jsx(Input, {
									placeholder: t.school,
									value: education.school,
									onChange: (event) => set("education", cv.education.map((item, i) => i === index ? {
										...item,
										school: event.target.value
									} : item))
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ jsx(Input, {
										placeholder: t.start,
										value: education.start,
										onChange: (event) => set("education", cv.education.map((item, i) => i === index ? {
											...item,
											start: event.target.value
										} : item))
									}), /* @__PURE__ */ jsx(Input, {
										placeholder: t.end,
										value: education.end,
										onChange: (event) => set("education", cv.education.map((item, i) => i === index ? {
											...item,
											end: event.target.value
										} : item))
									})]
								}),
								/* @__PURE__ */ jsx(Input, {
									placeholder: t.details,
									value: education.details,
									onChange: (event) => set("education", cv.education.map((item, i) => i === index ? {
										...item,
										details: event.target.value
									} : item))
								}),
								/* @__PURE__ */ jsxs(Button, {
									variant: "ghost",
									size: "sm",
									className: "justify-self-start text-muted-foreground hover:text-destructive",
									onClick: () => set("education", cv.education.filter((_, i) => i !== index)),
									children: [
										/* @__PURE__ */ jsx(Trash2, { className: "size-4" }),
										" ",
										t.remove
									]
								})
							]
						}, index)), /* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => set("education", [...cv.education, { ...emptyEducation }]),
							children: [
								/* @__PURE__ */ jsx(Plus, { className: "size-4" }),
								" ",
								t.addEducation
							]
						})]
					}),
					/* @__PURE__ */ jsx(Section, {
						title: t.skills,
						children: /* @__PURE__ */ jsx(Textarea, {
							rows: 3,
							value: cv.skills.join(", "),
							onChange: (event) => set("skills", event.target.value.split(",").map((skill) => skill.trim())),
							placeholder: t.skillsPlaceholder
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex justify-end pb-6",
						children: /* @__PURE__ */ jsx(Button, {
							onClick: () => saveMutation.mutate(),
							disabled: saveMutation.isPending,
							children: t.save
						})
					})
				]
			})
		]
	}) });
}
//#endregion
export { ProfilePage as component };
