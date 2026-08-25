/**
 * Interface copy for the app chrome and the settings screen, in the system
 * language the user picked (English by default).
 */
import { useEffect, useState } from "react";
import { normalizeUiLanguage, type UiLanguage } from "@/lib/user-settings";

export const UI_LANGUAGE_KEY = "tailorcv:ui-language";

export type UiStrings = {
  navApplications: string;
  navProfile: string;
  navTargets: string;
  navSettings: string;
  signOut: string;
  settingsTitle: string;
  settingsSubtitle: string;
  preferences: string;
  preferencesHint: string;
  systemLanguage: string;
  systemLanguageHint: string;
  cvLanguages: string;
  cvLanguagesHint: string;
  addLanguage: string;
  remove: string;
  defaultAppLanguage: string;
  defaultAppLanguageHint: string;
  coverLetterTone: string;
  coverLetterToneHint: string;
  interviewDepth: string;
  interviewDepthHint: string;
  aiGuard: string;
  aiGuardHint: string;
  messagesPerSession: string;
  retention: string;
  retentionHint: string;
  retentionMonths: string;
  emailTitle: string;
  emailHint: string;
  emailExpiry: string;
  emailFeatures: string;
  authenticatorTitle: string;
  authenticatorHint: string;
  authenticatorEnabled: string;
  authenticatorDisabled: string;
  authenticatorSetupButton: string;
  authenticatorVerifyButton: string;
  authenticatorCodeLabel: string;
  authenticatorScanQr: string;
  authenticatorManualKey: string;
  exportTitle: string;
  exportHint: string;
  exportDisabled: string;
  exportEnableButton: string;
  saved: string;
};

const EN: UiStrings = {
  navApplications: "Applications",
  navProfile: "Master profile",
  navTargets: "Role targets",
  navSettings: "Settings",
  signOut: "Sign out",
  settingsTitle: "Settings",
  settingsSubtitle: "Your privacy controls and how TailorCV keeps you posted.",
  preferences: "Defaults & languages",
  preferencesHint: "How new applications and generated documents start out.",
  systemLanguage: "System language",
  systemLanguageHint: "The language of the app interface itself.",
  cvLanguages: "CV languages",
  cvLanguagesHint: "Languages your master profile is kept in. English is always included.",
  addLanguage: "Add language",
  remove: "Remove",
  defaultAppLanguage: "Default application language",
  defaultAppLanguageHint: "Pre-selected when you start a new application.",
  coverLetterTone: "Default cover-letter tone",
  coverLetterToneHint: "Used unless you change it inside a workspace.",
  interviewDepth: "AI interview depth",
  interviewDepthHint: "How many questions the AI may ask per application.",
  aiGuard: "AI usage guard",
  aiGuardHint: "Caps how many AI messages a single session can spend, to keep costs down.",
  messagesPerSession: "Messages per session",
  retention: "Auto-delete my saved context",
  retentionHint:
    "When on, your career context is erased if you haven't added to it for this many months.",
  retentionMonths: "Delete after",
  emailTitle: "Email notifications",
  emailHint: "We only email you about your data and the product — never job listings.",
  emailExpiry: "Warn me before my saved context expires",
  emailFeatures: "Tell me about new features to try",
  authenticatorTitle: "Two-factor authentication",
  authenticatorHint:
    "Adds an extra layer of security to your account. Required before you can download all your data.",
  authenticatorEnabled: "Two-factor authentication is enabled",
  authenticatorDisabled: "Two-factor authentication is disabled",
  authenticatorSetupButton: "Set up two-factor authentication",
  authenticatorVerifyButton: "Verify and enable",
  authenticatorCodeLabel: "Authenticator code",
  authenticatorScanQr: "Scan this with your authenticator app, then enter the 6-digit code.",
  authenticatorManualKey: "Manual key",
  exportTitle: "Download all my data",
  exportHint:
    "A zip with your profiles, applications, cover letters, role targets and saved context. Protected by two-factor verification.",
  exportDisabled: "This is disabled unless you enable two-factor authentication.",
  exportEnableButton: "Enable two-factor authentication",
  saved: "Settings saved",
};

const ES: UiStrings = {
  navApplications: "Candidaturas",
  navProfile: "Perfil maestro",
  navTargets: "Objetivos de puesto",
  navSettings: "Ajustes",
  signOut: "Cerrar sesión",
  settingsTitle: "Ajustes",
  settingsSubtitle: "Tu privacidad y cómo TailorCV te mantiene al día.",
  preferences: "Valores por defecto e idiomas",
  preferencesHint: "Cómo empiezan las nuevas candidaturas y los documentos generados.",
  systemLanguage: "Idioma del sistema",
  systemLanguageHint: "El idioma de la interfaz de la aplicación.",
  cvLanguages: "Idiomas del CV",
  cvLanguagesHint: "Idiomas en los que mantienes tu perfil maestro. El inglés siempre está incluido.",
  addLanguage: "Añadir idioma",
  remove: "Quitar",
  defaultAppLanguage: "Idioma por defecto de la candidatura",
  defaultAppLanguageHint: "Preseleccionado al crear una candidatura nueva.",
  coverLetterTone: "Tono por defecto de la carta",
  coverLetterToneHint: "Se usa salvo que lo cambies dentro del espacio de trabajo.",
  interviewDepth: "Profundidad de la entrevista con IA",
  interviewDepthHint: "Cuántas preguntas puede hacer la IA por candidatura.",
  aiGuard: "Límite de uso de IA",
  aiGuardHint: "Limita cuántos mensajes de IA puede gastar una sesión, para controlar el coste.",
  messagesPerSession: "Mensajes por sesión",
  retention: "Borrar automáticamente mi contexto",
  retentionHint:
    "Si está activo, tu contexto se borra si no lo actualizas durante estos meses.",
  retentionMonths: "Borrar después de",
  emailTitle: "Notificaciones por correo",
  emailHint: "Solo te escribimos sobre tus datos y el producto, nunca ofertas de empleo.",
  emailExpiry: "Avisarme antes de que caduque mi contexto",
  emailFeatures: "Contarme las novedades que puedo probar",
  authenticatorTitle: "Verificación en dos pasos",
  authenticatorHint:
    "Añade una capa extra de seguridad a tu cuenta. Requerida para descargar todos tus datos.",
  authenticatorEnabled: "Verificación en dos pasos activada",
  authenticatorDisabled: "Verificación en dos pasos desactivada",
  authenticatorSetupButton: "Configurar verificación en dos pasos",
  authenticatorVerifyButton: "Verificar y activar",
  authenticatorCodeLabel: "Código de autenticación",
  authenticatorScanQr: "Escanea esto con tu app de autenticación y luego introduce el código de 6 dígitos.",
  authenticatorManualKey: "Clave manual",
  exportTitle: "Descargar todos mis datos",
  exportHint:
    "Un zip con tus perfiles, candidaturas, cartas, objetivos y contexto guardado. Protegido con verificación en dos pasos.",
  exportDisabled: "Esta opción está desactivada hasta que actives la verificación en dos pasos.",
  exportEnableButton: "Activar verificación en dos pasos",
  saved: "Ajustes guardados",
};

const PT: UiStrings = {
  navApplications: "Candidaturas",
  navProfile: "Perfil principal",
  navTargets: "Objetivos de função",
  navSettings: "Definições",
  signOut: "Terminar sessão",
  settingsTitle: "Definições",
  settingsSubtitle: "A tua privacidade e como o TailorCV te mantém informado.",
  preferences: "Predefinições e idiomas",
  preferencesHint: "Como começam as novas candidaturas e os documentos gerados.",
  systemLanguage: "Idioma do sistema",
  systemLanguageHint: "O idioma da interface da aplicação.",
  cvLanguages: "Idiomas do CV",
  cvLanguagesHint: "Idiomas em que manténs o teu perfil principal. O inglês está sempre incluído.",
  addLanguage: "Adicionar idioma",
  remove: "Remover",
  defaultAppLanguage: "Idioma predefinido da candidatura",
  defaultAppLanguageHint: "Pré-selecionado ao criar uma nova candidatura.",
  coverLetterTone: "Tom predefinido da carta",
  coverLetterToneHint: "Usado a menos que o mudes dentro do espaço de trabalho.",
  interviewDepth: "Profundidade da entrevista com IA",
  interviewDepthHint: "Quantas perguntas a IA pode fazer por candidatura.",
  aiGuard: "Limite de utilização de IA",
  aiGuardHint: "Limita quantas mensagens de IA uma sessão pode gastar, para controlar custos.",
  messagesPerSession: "Mensagens por sessão",
  retention: "Apagar automaticamente o meu contexto",
  retentionHint: "Se ativo, o teu contexto é apagado se não o atualizares durante estes meses.",
  retentionMonths: "Apagar após",
  emailTitle: "Notificações por email",
  emailHint: "Só te escrevemos sobre os teus dados e o produto, nunca ofertas de emprego.",
  emailExpiry: "Avisar-me antes de o meu contexto expirar",
  emailFeatures: "Contar-me as novidades para experimentar",
  authenticatorTitle: "Verificação em duas etapas",
  authenticatorHint:
    "Adiciona uma camada extra de segurança à tua conta. Necessária antes de descarregares todos os teus dados.",
  authenticatorEnabled: "Verificação em duas etapas ativada",
  authenticatorDisabled: "Verificação em duas etapas desativada",
  authenticatorSetupButton: "Configurar verificação em duas etapas",
  authenticatorVerifyButton: "Verificar e ativar",
  authenticatorCodeLabel: "Código de autenticação",
  authenticatorScanQr: "Escaneia isto com a tua app de autenticação e depois introduz o código de 6 dígitos.",
  authenticatorManualKey: "Chave manual",
  exportTitle: "Descarregar todos os meus dados",
  exportHint:
    "Um zip com os teus perfis, candidaturas, cartas, objetivos e contexto guardado. Protegido por verificação em duas etapas.",
  exportDisabled: "Esta opção está desativada até ativares a verificação em duas etapas.",
  exportEnableButton: "Ativar verificação em duas etapas",
  saved: "Definições guardadas",
};

const TABLE: Record<UiLanguage, UiStrings> = { en: EN, es: ES, pt: PT };

export function uiStrings(language: unknown): UiStrings {
  return TABLE[normalizeUiLanguage(language)];
}

export function readStoredUiLanguage(): UiLanguage {
  if (typeof window === "undefined") return "en";
  return normalizeUiLanguage(window.localStorage.getItem(UI_LANGUAGE_KEY));
}

export function storeUiLanguage(language: unknown): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(UI_LANGUAGE_KEY, normalizeUiLanguage(language));
  window.dispatchEvent(new Event("tailorcv:ui-language"));
}

/** Interface language, hydration-safe (reads storage only after mount). */
export function useUiLanguage(): UiLanguage {
  const [language, setLanguage] = useState<UiLanguage>("en");
  useEffect(() => {
    const sync = () => setLanguage(readStoredUiLanguage());
    sync();
    window.addEventListener("tailorcv:ui-language", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("tailorcv:ui-language", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return language;
}

export function useUiStrings(): UiStrings {
  return uiStrings(useUiLanguage());
}
