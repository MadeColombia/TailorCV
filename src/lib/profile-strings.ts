/** UI copy for the master profile editor, shown in the language of the version being edited. */
export type ProfileStrings = {
  title: string;
  subtitle: string;
  importPdf: string;
  save: string;
  download: string;
  tabDetails: string;
  tabTemplate: string;
  languageHint: (other: string) => string;
  translateFrom: (other: string) => string;
  fillOtherFirst: (other: string) => string;
  loading: string;
  contact: string;
  photoOptional: string;
  addPhoto: string;
  changePhoto: string;
  removePhoto: string;
  fullName: string;
  headline: string;
  headlinePlaceholder: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  addLink: string;
  linksEmpty: string;
  label: string;
  removeLink: string;
  summary: string;
  summaryPlaceholder: string;
  experience: string;
  jobTitle: string;
  company: string;
  start: string;
  end: string;
  bulletsPlaceholder: string;
  removeRole: string;
  addRole: string;
  education: string;
  degree: string;
  school: string;
  details: string;
  remove: string;
  addEducation: string;
  skills: string;
  skillsPlaceholder: string;
  languageNames: Record<string, string>;
};

const EN: ProfileStrings = {
  title: "Master profile",
  subtitle: "Everything you have ever done — one version per language.",
  importPdf: "Import PDF",
  save: "Save profile",
  download: "Download CV",
  tabDetails: "Profile details",
  tabTemplate: "CV template",
  languageHint: (other) =>
    `Upload a CV in this language, fill it in by hand, or translate the ${other} one.`,
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
    ca: "Catalan",
  },
};

const ES: ProfileStrings = {
  title: "Perfil maestro",
  subtitle: "Todo lo que has hecho — una versión por idioma.",
  importPdf: "Importar PDF",
  save: "Guardar perfil",
  download: "Descargar CV",
  tabDetails: "Datos del perfil",
  tabTemplate: "Plantilla del CV",
  languageHint: (other) =>
    `Sube un CV en este idioma, rellénalo a mano o traduce el de ${other}.`,
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
    ca: "catalán",
  },
};

export function profileStrings(language: unknown): ProfileStrings {
  return language === "es" ? ES : EN;
}
