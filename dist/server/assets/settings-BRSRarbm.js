import { t as createServerFn } from "./createServerFn-BFFE07zL.js";
import { S as useServerFn, b as storeUiLanguage, o as createSsrRpc, s as Switch, t as AppShell, x as useUiStrings } from "./app-shell-bjwPVDLq.js";
import { t as requireSupabaseAuth } from "./auth-middleware-ZGAJzz7F.js";
import { t as LANGUAGES } from "./cv-DMqvWRdG.js";
import { a as UI_LANGUAGES, i as TRACKING_BOUNDS, r as INTERVIEW_DEPTHS, t as COVER_LETTER_TONES } from "./user-settings-BzcLPF0g.js";
import { t as supabase } from "./client-CWFfskMz.js";
import { n as buttonVariants, r as cn, t as Button } from "./button-DyZVOtWw.js";
import { n as Label, t as Input } from "./input-Cl4UdChK.js";
import { t as Spinner } from "./spinner-iFQhnBJc.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Bub4Crhq.js";
import { a as notify, i as notificationsSupported, n as defaultNotificationPrefs, o as requestNotificationPermission, r as loadNotificationPrefs, s as saveNotificationPrefs, t as NOTIFICATION_EVENTS } from "./notifications-_1kSfE6U.js";
import { i as updateUserSettings, n as exportAccountArchive, r as getUserSettings, t as enforceContextRetention } from "./user-settings.functions-Hdzanu9i.js";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Archive, Bell, CheckCircle2, Download, FileUp, Globe, Lock, LogOut, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
//#region src/components/ui/separator.tsx
var Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(SeparatorPrimitive.Root, {
	ref,
	decorative,
	orientation,
	className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
	...props
}));
Separator.displayName = SeparatorPrimitive.Root.displayName;
//#endregion
//#region src/components/ui/alert-dialog.tsx
var AlertDialog = AlertDialogPrimitive.Root;
var AlertDialogTrigger = AlertDialogPrimitive.Trigger;
var AlertDialogPortal = AlertDialogPrimitive.Portal;
var AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Overlay, {
	className: cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
var AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [/* @__PURE__ */ jsx(AlertDialogOverlay, {}), /* @__PURE__ */ jsx(AlertDialogPrimitive.Content, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props
})] }));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
var AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Title, {
	ref,
	className: cn("text-lg font-semibold", className),
	...props
}));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
var AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
var AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Action, {
	ref,
	className: cn(buttonVariants(), className),
	...props
}));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
var AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Cancel, {
	ref,
	className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
	...props
}));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
//#endregion
//#region src/lib/settings.functions.ts
/** Summary of the private context we store about the candidate. */
var getPrivacySnapshot = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("b1029d796e9ba0a4e023d526fe5f62325bcc5d5a474627708a978ad5bcd82e29"));
/** Full export of the stored context so the user can keep their own copy. */
var exportCandidateContext = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("037dea65ad26b9c21b354ad91a777c9d1abc2d96ea7809fdab69cf335f1ed80b"));
/** Permanently erase the dossier and the raw answer log. */
var eraseCandidateContext = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("805e6a28f46d1b8613414d640152499db78a27840daaa8673266f9fc0ef0f104"));
/**
* Upload a document (PDF, text or markdown) whose contents become the
* candidate-provided section of the context. Replaces only that section.
*/
var uploadCandidateContext = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("86d2f80392ec58f9d9dda36a2efdf3d6de9e86a8cfbc3286acaedf68b5a4d428"));
/** Remove only the uploaded section, keeping everything learned from answers. */
var removeUploadedContext = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("937fbbed62c063b0b261352c494e43d8edca5352ac911f7defa66b0af2365f24"));
//#endregion
//#region src/components/two-factor-export.tsx
/**
* Two-factor authentication setup and full-account zip export. The sections are
* kept separate: the export is locked behind an overlay until 2FA is verified.
*/
function TwoFactorExport({ title, hint }) {
	const t = useUiStrings();
	const runExport = useServerFn(exportAccountArchive);
	const [factor, setFactor] = useState(null);
	const [enrolling, setEnrolling] = useState(null);
	const [enrollCode, setEnrollCode] = useState("");
	const [exportCode, setExportCode] = useState("");
	const [loading, setLoading] = useState(true);
	const refreshFactors = async () => {
		const { data } = await supabase.auth.mfa.listFactors();
		const totp = data?.totp?.find((item) => item.status === "verified") ?? null;
		setFactor(totp ? {
			id: totp.id,
			status: totp.status
		} : null);
		setLoading(false);
	};
	useEffect(() => {
		refreshFactors();
	}, []);
	const startEnroll = async () => {
		const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
		if (error || !data) {
			toast.error(error?.message ?? "Couldn't start two-factor setup.");
			return;
		}
		setEnrolling({
			id: data.id,
			qr: data.totp.qr_code,
			secret: data.totp.secret
		});
	};
	const verifyEnrollMutation = useMutation({
		mutationFn: async () => {
			if (!enrolling?.id) throw new Error("Set up two-factor authentication first.");
			const { error } = await supabase.auth.mfa.challengeAndVerify({
				factorId: enrolling.id,
				code: enrollCode.trim()
			});
			if (error) throw new Error(error.message);
		},
		onSuccess: () => {
			setEnrolling(null);
			setEnrollCode("");
			refreshFactors();
			toast.success("Two-factor authentication enabled");
		},
		onError: (error) => toast.error(error.message)
	});
	const exportMutation = useMutation({
		mutationFn: async () => {
			if (!factor?.id) throw new Error("Enable two-factor authentication first.");
			const { error } = await supabase.auth.mfa.challengeAndVerify({
				factorId: factor.id,
				code: exportCode.trim()
			});
			if (error) throw new Error(error.message);
			return runExport();
		},
		onSuccess: (result) => {
			setExportCode("");
			const bytes = Uint8Array.from(atob(result.base64), (char) => char.charCodeAt(0));
			const url = URL.createObjectURL(new Blob([bytes], { type: "application/zip" }));
			const link = document.createElement("a");
			link.href = url;
			link.download = result.filename;
			link.click();
			URL.revokeObjectURL(url);
			toast.success("Your archive is downloading");
		},
		onError: (error) => toast.error(error.message)
	});
	const isEnabled = !loading && factor !== null && enrolling === null;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("section", {
		className: "rounded-xl border border-border bg-card p-6",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "mt-0.5 size-5 text-primary" }), /* @__PURE__ */ jsxs("div", {
				className: "flex-1",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "font-medium",
						children: t.authenticatorTitle
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: t.authenticatorHint
					}),
					loading ? /* @__PURE__ */ jsx("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: "Checking your security setup…"
					}) : factor ? /* @__PURE__ */ jsxs("div", {
						className: "mt-4 flex items-center gap-2 text-sm text-emerald-600",
						children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "size-4" }), t.authenticatorEnabled]
					}) : enrolling ? /* @__PURE__ */ jsxs("div", {
						className: "mt-4 space-y-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "rounded-lg border border-border bg-muted/40 p-4",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "text-sm",
									children: t.authenticatorScanQr
								}),
								/* @__PURE__ */ jsx("img", {
									src: enrolling.qr,
									alt: "Two-factor authentication QR code",
									className: "mt-3 size-40 rounded bg-white p-2"
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "mt-2 text-xs text-muted-foreground",
									children: [
										t.authenticatorManualKey,
										": ",
										enrolling.secret
									]
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-end gap-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "enroll-mfa-code",
									children: t.authenticatorCodeLabel
								}), /* @__PURE__ */ jsx(Input, {
									id: "enroll-mfa-code",
									inputMode: "numeric",
									autoComplete: "one-time-code",
									maxLength: 6,
									className: "w-36 tracking-[0.3em]",
									value: enrollCode,
									onChange: (event) => setEnrollCode(event.target.value.replace(/\D/g, "")),
									placeholder: "000000"
								})]
							}), /* @__PURE__ */ jsxs(Button, {
								size: "sm",
								disabled: enrollCode.trim().length !== 6 || verifyEnrollMutation.isPending,
								onClick: () => verifyEnrollMutation.mutate(),
								children: [verifyEnrollMutation.isPending ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsx(ShieldCheck, { className: "size-4" }), t.authenticatorVerifyButton]
							})]
						})]
					}) : /* @__PURE__ */ jsxs("div", {
						className: "mt-4 space-y-3",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-sm text-muted-foreground",
							children: t.authenticatorDisabled
						}), /* @__PURE__ */ jsxs(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => void startEnroll(),
							children: [
								/* @__PURE__ */ jsx(ShieldCheck, { className: "size-4" }),
								" ",
								t.authenticatorSetupButton
							]
						})]
					})
				]
			})]
		})
	}), /* @__PURE__ */ jsxs("section", {
		className: "relative rounded-xl border border-border bg-card p-6",
		children: [!isEnabled ? /* @__PURE__ */ jsxs("div", {
			className: "absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-card/80 p-6 text-center backdrop-blur-sm",
			children: [
				/* @__PURE__ */ jsx(AlertTriangle, { className: "size-8 text-amber-500" }),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 max-w-xs text-sm font-medium",
					children: t.exportDisabled
				}),
				/* @__PURE__ */ jsxs(Button, {
					variant: "outline",
					size: "sm",
					className: "mt-4",
					onClick: () => {
						window.scrollTo({
							top: 0,
							behavior: "smooth"
						});
						if (!enrolling) startEnroll();
					},
					children: [
						/* @__PURE__ */ jsx(ShieldCheck, { className: "size-4" }),
						" ",
						t.exportEnableButton
					]
				})
			]
		}) : null, /* @__PURE__ */ jsx("div", {
			className: isEnabled ? "" : "opacity-50",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ jsx(Archive, { className: "mt-0.5 size-5 text-primary" }), /* @__PURE__ */ jsxs("div", {
					className: "flex-1",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "font-medium",
							children: title
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: hint
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-4 flex flex-wrap items-end gap-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "export-mfa-code",
									children: t.authenticatorCodeLabel
								}), /* @__PURE__ */ jsx(Input, {
									id: "export-mfa-code",
									inputMode: "numeric",
									autoComplete: "one-time-code",
									maxLength: 6,
									className: "w-36 tracking-[0.3em]",
									value: exportCode,
									onChange: (event) => setExportCode(event.target.value.replace(/\D/g, "")),
									placeholder: "000000",
									disabled: !isEnabled
								})]
							}), /* @__PURE__ */ jsxs(Button, {
								size: "sm",
								disabled: !isEnabled || exportCode.trim().length !== 6 || exportMutation.isPending,
								onClick: () => exportMutation.mutate(),
								children: [exportMutation.isPending ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsx(Archive, { className: "size-4" }), "Verify and download"]
							})]
						})
					]
				})]
			})
		})]
	})] });
}
//#endregion
//#region src/routes/_authenticated/settings.tsx?tsr-split=component
function SettingsPage() {
	const queryClient = useQueryClient();
	const fetchSnapshot = useServerFn(getPrivacySnapshot);
	const exportContext = useServerFn(exportCandidateContext);
	const erase = useServerFn(eraseCandidateContext);
	const uploadContext = useServerFn(uploadCandidateContext);
	const removeUpload = useServerFn(removeUploadedContext);
	const fileInputRef = useRef(null);
	const [email, setEmail] = useState("");
	const [pendingFile, setPendingFile] = useState(null);
	const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
	const snapshot = useQuery({
		queryKey: ["privacy-snapshot"],
		queryFn: () => fetchSnapshot()
	});
	const t = useUiStrings();
	const fetchSettings = useServerFn(getUserSettings);
	const saveSettings = useServerFn(updateUserSettings);
	const enforceRetention = useServerFn(enforceContextRetention);
	const settings = useQuery({
		queryKey: ["user-settings"],
		queryFn: () => fetchSettings()
	}).data;
	useEffect(() => {
		enforceRetention().then((result) => {
			if (result.erased) {
				queryClient.invalidateQueries({ queryKey: ["privacy-snapshot"] });
				toast.info("Your saved context passed its retention window and was erased.");
			}
		});
	}, []);
	useEffect(() => {
		if (settings) storeUiLanguage(settings.uiLanguage);
	}, [settings?.uiLanguage]);
	const settingsMutation = useMutation({
		mutationFn: (patch) => saveSettings({ data: patch }),
		onSuccess: (result) => {
			queryClient.setQueryData(["user-settings"], result);
			storeUiLanguage(result.uiLanguage);
			toast.success(t.saved);
		},
		onError: (error) => toast.error(error.message)
	});
	const patch = (next) => settingsMutation.mutate(next);
	const [prefs, setPrefs] = useState(defaultNotificationPrefs);
	const [permission, setPermission] = useState("default");
	useEffect(() => {
		supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
		setPrefs(loadNotificationPrefs());
		setPermission(notificationsSupported() ? Notification.permission : "unsupported");
	}, []);
	const update = (next) => {
		const merged = {
			...prefs,
			...next
		};
		setPrefs(merged);
		saveNotificationPrefs(merged);
	};
	const toggleEnabled = async (value) => {
		if (!value) {
			update({ enabled: false });
			return;
		}
		if (!notificationsSupported()) {
			toast.error("This browser doesn't support notifications.");
			return;
		}
		const result = await requestNotificationPermission();
		setPermission(result);
		if (result !== "granted") {
			toast.error("Notifications blocked. Allow them in your browser settings to turn this on.");
			return;
		}
		update({ enabled: true });
		toast.success("Notifications enabled");
	};
	const exportMutation = useMutation({
		mutationFn: () => exportContext(),
		onSuccess: (data) => {
			const blob = new Blob([data.markdown], { type: "text/markdown;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `tailorcv-context-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.md`;
			a.click();
			URL.revokeObjectURL(url);
			toast.success("Context downloaded");
		},
		onError: () => toast.error("Couldn't export your context. Try again.")
	});
	const uploadMutation = useMutation({
		mutationFn: async (file) => {
			const dataUrl = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(String(reader.result));
				reader.onerror = () => reject(/* @__PURE__ */ new Error("Couldn't read that file"));
				reader.readAsDataURL(file);
			});
			return uploadContext({ data: {
				filename: file.name,
				dataUrl
			} });
		},
		onSuccess: () => {
			setPendingFile(null);
			setReplaceDialogOpen(false);
			queryClient.invalidateQueries({ queryKey: ["privacy-snapshot"] });
			queryClient.invalidateQueries({ queryKey: ["dossier"] });
			toast.success("Your context document was added");
		},
		onError: (error) => {
			setPendingFile(null);
			setReplaceDialogOpen(false);
			toast.error(error.message || "Couldn't read that file.");
		}
	});
	const handleFileSelect = (file) => {
		if (snapshot.data?.uploaded) {
			setPendingFile(file);
			setReplaceDialogOpen(true);
		} else uploadMutation.mutate(file);
	};
	const removeUploadMutation = useMutation({
		mutationFn: () => removeUpload(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["privacy-snapshot"] });
			queryClient.invalidateQueries({ queryKey: ["dossier"] });
			toast.success("Uploaded context removed");
		},
		onError: () => toast.error("Couldn't remove that. Try again.")
	});
	const eraseMutation = useMutation({
		mutationFn: () => erase(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["privacy-snapshot"] });
			queryClient.invalidateQueries({ queryKey: ["dossier"] });
			toast.success("Your saved context has been erased");
		},
		onError: () => toast.error("Couldn't erase your context. Try again.")
	});
	return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("main", {
		className: "mx-auto max-w-3xl space-y-8 px-6 py-10",
		children: [
			/* @__PURE__ */ jsxs("header", { children: [/* @__PURE__ */ jsx("h1", {
				className: "font-display text-2xl font-bold",
				children: t.settingsTitle
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: t.settingsSubtitle
			})] }),
			/* @__PURE__ */ jsx("section", {
				className: "rounded-xl border border-border bg-card p-6",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ jsx(Globe, { className: "mt-0.5 size-5 text-primary" }), /* @__PURE__ */ jsxs("div", {
						className: "flex-1",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "font-medium",
								children: t.preferences
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: t.preferencesHint
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-5 grid gap-5 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5",
										children: [
											/* @__PURE__ */ jsx(Label, { children: t.systemLanguage }),
											/* @__PURE__ */ jsxs(Select, {
												value: settings?.uiLanguage ?? "en",
												onValueChange: (value) => patch({ uiLanguage: value }),
												children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsx(SelectContent, { children: UI_LANGUAGES.map((item) => /* @__PURE__ */ jsx(SelectItem, {
													value: item.code,
													children: item.label
												}, item.code)) })]
											}),
											/* @__PURE__ */ jsx("p", {
												className: "text-xs text-muted-foreground",
												children: t.systemLanguageHint
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5",
										children: [
											/* @__PURE__ */ jsx(Label, { children: t.defaultAppLanguage }),
											/* @__PURE__ */ jsxs(Select, {
												value: settings?.defaultAppLanguage ?? "en",
												onValueChange: (value) => patch({ defaultAppLanguage: value }),
												children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsx(SelectContent, { children: LANGUAGES.filter((item) => (settings?.cvLanguages ?? ["en"]).includes(item.code)).map((item) => /* @__PURE__ */ jsx(SelectItem, {
													value: item.code,
													children: item.native
												}, item.code)) })]
											}),
											/* @__PURE__ */ jsx("p", {
												className: "text-xs text-muted-foreground",
												children: t.defaultAppLanguageHint
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5",
										children: [
											/* @__PURE__ */ jsx(Label, { children: t.coverLetterTone }),
											/* @__PURE__ */ jsxs(Select, {
												value: settings?.coverLetterTone ?? "professional",
												onValueChange: (value) => patch({ coverLetterTone: value }),
												children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsx(SelectContent, { children: COVER_LETTER_TONES.map((item) => /* @__PURE__ */ jsx(SelectItem, {
													value: item.value,
													children: item.label
												}, item.value)) })]
											}),
											/* @__PURE__ */ jsx("p", {
												className: "text-xs text-muted-foreground",
												children: COVER_LETTER_TONES.find((item) => item.value === settings?.coverLetterTone)?.hint ?? t.coverLetterToneHint
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "space-y-1.5",
										children: [
											/* @__PURE__ */ jsx(Label, { children: t.interviewDepth }),
											/* @__PURE__ */ jsxs(Select, {
												value: settings?.interviewDepth ?? "standard",
												onValueChange: (value) => patch({ interviewDepth: value }),
												children: [/* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }), /* @__PURE__ */ jsx(SelectContent, { children: INTERVIEW_DEPTHS.map((item) => /* @__PURE__ */ jsx(SelectItem, {
													value: item.value,
													children: item.label
												}, item.value)) })]
											}),
											/* @__PURE__ */ jsx("p", {
												className: "text-xs text-muted-foreground",
												children: INTERVIEW_DEPTHS.find((item) => item.value === settings?.interviewDepth)?.hint ?? t.interviewDepthHint
											})
										]
									})
								]
							}),
							/* @__PURE__ */ jsx(Separator, { className: "my-5" }),
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx(Label, { children: t.cvLanguages }),
								/* @__PURE__ */ jsx("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: t.cvLanguagesHint
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-3 flex flex-wrap items-center gap-2",
									children: [LANGUAGES.filter((item) => (settings?.cvLanguages ?? ["en"]).includes(item.code)).map((item) => /* @__PURE__ */ jsxs("span", {
										className: "inline-flex items-center gap-2 rounded-md bg-secondary px-2.5 py-1 text-sm",
										children: [item.native, item.code !== "en" ? /* @__PURE__ */ jsx("button", {
											type: "button",
											className: "text-muted-foreground hover:text-destructive",
											"aria-label": `${t.remove} ${item.native}`,
											onClick: () => patch({ cvLanguages: (settings?.cvLanguages ?? ["en"]).filter((code) => code !== item.code) }),
											children: /* @__PURE__ */ jsx(X, { className: "size-3.5" })
										}) : null]
									}, item.code)), LANGUAGES.some((item) => !(settings?.cvLanguages ?? ["en"]).includes(item.code)) ? /* @__PURE__ */ jsxs(Select, {
										value: "",
										onValueChange: (value) => patch({ cvLanguages: [...settings?.cvLanguages ?? ["en"], value] }),
										children: [/* @__PURE__ */ jsx(SelectTrigger, {
											className: "w-44",
											children: /* @__PURE__ */ jsx("span", {
												className: "text-sm",
												children: t.addLanguage
											})
										}), /* @__PURE__ */ jsx(SelectContent, { children: LANGUAGES.filter((item) => !(settings?.cvLanguages ?? ["en"]).includes(item.code)).map((item) => /* @__PURE__ */ jsx(SelectItem, {
											value: item.code,
											children: item.native
										}, item.code)) })]
									}) : null]
								})
							] }),
							/* @__PURE__ */ jsx(Separator, { className: "my-5" }),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
										className: "text-sm font-semibold",
										children: "Application tracking"
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-muted-foreground",
										children: "Controls the ghosting radar, follow-up reminders and how long archived applications are kept."
									})] }),
									/* @__PURE__ */ jsx("div", {
										className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
										children: [
											[
												"responseWindowDays",
												"Usual reply window (days)",
												"How long companies normally take to answer."
											],
											[
												"ghostAfterDays",
												"Consider ghosted after (days)",
												"Past this, we mark the role as likely ghosted."
											],
											[
												"followupOffsetDays",
												"Follow-up reminder (days)",
												"Days after applying we nudge you to follow up."
											],
											[
												"archiveRetentionDays",
												"Keep archived roles (days)",
												"Archived applications are deleted after this."
											]
										].map(([key, label, hint]) => /* @__PURE__ */ jsxs("div", {
											className: "space-y-1.5",
											children: [
												/* @__PURE__ */ jsx(Label, {
													htmlFor: `tracking-${key}`,
													children: label
												}),
												/* @__PURE__ */ jsx(Input, {
													id: `tracking-${key}`,
													type: "number",
													min: TRACKING_BOUNDS[key].min,
													max: TRACKING_BOUNDS[key].max,
													className: "w-28",
													defaultValue: settings?.[key] ?? TRACKING_BOUNDS[key].fallback,
													onBlur: (event) => {
														const value = Number(event.target.value);
														if (Number.isFinite(value) && value !== settings?.[key]) patch({ [key]: value });
													}
												}, settings?.[key]),
												/* @__PURE__ */ jsx("p", {
													className: "text-xs text-muted-foreground",
													children: hint
												})
											]
										}, key))
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-start justify-between gap-4 rounded-lg border border-border p-3",
										children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "deep-prep",
											children: "Deep prep once an interview is booked"
										}), /* @__PURE__ */ jsx("p", {
											className: "text-xs text-muted-foreground",
											children: "Moving an application to the interview stage switches its AI coach and prep questions to deep mode."
										})] }), /* @__PURE__ */ jsx(Switch, {
											id: "deep-prep",
											checked: settings?.deepPrepOnInterview ?? true,
											onCheckedChange: (value) => patch({ deepPrepOnInterview: value })
										})]
									})
								]
							}),
							/* @__PURE__ */ jsx(Separator, { className: "my-5" }),
							/* @__PURE__ */ jsxs("div", {
								className: "grid gap-5 sm:grid-cols-2",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "space-y-1.5",
									children: [
										/* @__PURE__ */ jsx(Label, {
											htmlFor: "session-cap",
											children: t.messagesPerSession
										}),
										/* @__PURE__ */ jsx(Input, {
											id: "session-cap",
											type: "number",
											min: 5,
											max: 200,
											className: "w-32",
											defaultValue: settings?.sessionMessageCap ?? 30,
											onBlur: (event) => {
												const value = Number(event.target.value);
												if (value !== settings?.sessionMessageCap) patch({ sessionMessageCap: value });
											}
										}, settings?.sessionMessageCap),
										/* @__PURE__ */ jsx("p", {
											className: "text-xs text-muted-foreground",
											children: t.aiGuardHint
										})
									]
								}), /* @__PURE__ */ jsxs("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-start justify-between gap-4",
											children: [/* @__PURE__ */ jsx(Label, {
												htmlFor: "auto-delete",
												children: t.retention
											}), /* @__PURE__ */ jsx(Switch, {
												id: "auto-delete",
												checked: settings?.autoDeleteEnabled ?? false,
												onCheckedChange: (value) => patch({ autoDeleteEnabled: value })
											})]
										}),
										/* @__PURE__ */ jsx("p", {
											className: "text-xs text-muted-foreground",
											children: t.retentionHint
										}),
										settings?.autoDeleteEnabled ? /* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ jsx("span", {
													className: "text-sm",
													children: t.retentionMonths
												}),
												/* @__PURE__ */ jsx(Input, {
													type: "number",
													min: 1,
													max: 36,
													className: "w-24",
													defaultValue: settings.autoDeleteMonths,
													onBlur: (event) => {
														const value = Number(event.target.value);
														if (value !== settings.autoDeleteMonths) patch({ autoDeleteMonths: value });
													}
												}, settings.autoDeleteMonths),
												/* @__PURE__ */ jsx("span", {
													className: "text-sm text-muted-foreground",
													children: "months"
												})
											]
										}) : null
									]
								})]
							}),
							/* @__PURE__ */ jsx(Separator, { className: "my-5" }),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
										className: "text-sm font-medium",
										children: t.emailTitle
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-muted-foreground",
										children: t.emailHint
									})] }),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between gap-4",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "email-expiry",
											className: "text-sm font-normal",
											children: t.emailExpiry
										}), /* @__PURE__ */ jsx(Switch, {
											id: "email-expiry",
											checked: settings?.emailContextExpiry ?? true,
											onCheckedChange: (value) => patch({ emailContextExpiry: value })
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "flex items-center justify-between gap-4",
										children: [/* @__PURE__ */ jsx(Label, {
											htmlFor: "email-features",
											className: "text-sm font-normal",
											children: t.emailFeatures
										}), /* @__PURE__ */ jsx(Switch, {
											id: "email-features",
											checked: settings?.emailNewFeatures ?? false,
											onCheckedChange: (value) => patch({ emailNewFeatures: value })
										})]
									})
								]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ jsx("section", {
				className: "rounded-xl border border-border bg-card p-6",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "mt-0.5 size-5 text-primary" }), /* @__PURE__ */ jsxs("div", {
						className: "flex-1",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "font-medium",
								children: "Your saved career context"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Everything you tell the AI is folded into one private document used to tailor future CVs. It is stored encrypted and only ever readable by your account."
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-4 flex flex-wrap gap-4 text-sm",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1",
										children: [/* @__PURE__ */ jsx(Lock, { className: "size-3.5" }), snapshot.data?.encrypted ? "Encrypted at rest (AES-256)" : "Encryption key missing"]
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "rounded-md bg-secondary px-2.5 py-1",
										children: [snapshot.data?.answers ?? 0, " answers recorded"]
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "rounded-md bg-secondary px-2.5 py-1",
										children: [(snapshot.data?.dossier?.length ?? 0).toLocaleString(), " characters of context"]
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-5 flex flex-wrap gap-3",
								children: [/* @__PURE__ */ jsxs(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => exportMutation.mutate(),
									disabled: exportMutation.isPending,
									children: [/* @__PURE__ */ jsx(Download, { className: "size-4" }), " Download my context"]
								}), /* @__PURE__ */ jsxs(AlertDialog, { children: [/* @__PURE__ */ jsx(AlertDialogTrigger, {
									asChild: true,
									children: /* @__PURE__ */ jsxs(Button, {
										variant: "destructive",
										size: "sm",
										disabled: eraseMutation.isPending,
										children: [/* @__PURE__ */ jsx(Trash2, { className: "size-4" }), " Erase everything"]
									})
								}), /* @__PURE__ */ jsxs(AlertDialogContent, { children: [/* @__PURE__ */ jsxs(AlertDialogHeader, { children: [/* @__PURE__ */ jsx(AlertDialogTitle, { children: "Erase your saved context?" }), /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This permanently deletes your dossier and every answer you've given the AI. Your master profile, applications and role targets are not affected. This can't be undone — download a copy first if you want to keep it." })] }), /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [/* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ jsx(AlertDialogAction, {
									onClick: () => eraseMutation.mutate(),
									children: "Erase permanently"
								})] })] })] })]
							}),
							snapshot.data?.dossier ? /* @__PURE__ */ jsxs("details", {
								className: "mt-5 rounded-lg border border-border bg-muted/40 p-4",
								children: [/* @__PURE__ */ jsx("summary", {
									className: "cursor-pointer text-sm font-medium",
									children: "Preview context"
								}), /* @__PURE__ */ jsx("pre", {
									className: "mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground",
									children: snapshot.data.dossier
								})]
							}) : null
						]
					})]
				})
			}),
			/* @__PURE__ */ jsx("section", {
				className: "rounded-xl border border-border bg-card p-6",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ jsx(FileUp, { className: "mt-0.5 size-5 text-primary" }), /* @__PURE__ */ jsxs("div", {
						className: "flex-1",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "font-medium",
								children: "Upload your own context"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Add a PDF, TXT or Markdown file (an old CV, a brag document, notes about your projects). It becomes its own section of your context — uploading again replaces only that section, and everything learned from your answers stays untouched."
							}),
							snapshot.data?.uploaded ? /* @__PURE__ */ jsxs("div", {
								className: "mt-4 rounded-lg border border-border bg-muted/40 p-4",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center justify-between gap-3",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "text-sm",
										children: [/* @__PURE__ */ jsx("span", {
											className: "font-medium",
											children: snapshot.data.uploadedName ?? "Uploaded document"
										}), snapshot.data.uploadedAt ? /* @__PURE__ */ jsxs("span", {
											className: "text-muted-foreground",
											children: [
												" ",
												"· added ",
												new Date(snapshot.data.uploadedAt).toLocaleDateString()
											]
										}) : null]
									}), /* @__PURE__ */ jsxs(Button, {
										variant: "ghost",
										size: "sm",
										onClick: () => removeUploadMutation.mutate(),
										disabled: removeUploadMutation.isPending,
										children: [/* @__PURE__ */ jsx(Trash2, { className: "size-4" }), " Remove"]
									})]
								}), /* @__PURE__ */ jsx("pre", {
									className: "mt-3 max-h-56 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground",
									children: snapshot.data.uploaded
								})]
							}) : null,
							/* @__PURE__ */ jsx("input", {
								ref: fileInputRef,
								type: "file",
								accept: ".pdf,.txt,.md,.markdown,application/pdf,text/plain,text/markdown",
								className: "hidden",
								onChange: (event) => {
									const file = event.target.files?.[0];
									event.target.value = "";
									if (file) handleFileSelect(file);
								}
							}),
							/* @__PURE__ */ jsxs(Button, {
								variant: "outline",
								size: "sm",
								className: "mt-4",
								disabled: uploadMutation.isPending,
								onClick: () => fileInputRef.current?.click(),
								children: [/* @__PURE__ */ jsx(FileUp, { className: "size-4" }), uploadMutation.isPending ? "Reading your file…" : snapshot.data?.uploaded ? "Replace uploaded context" : "Upload a context file"]
							}),
							/* @__PURE__ */ jsx(AlertDialog, {
								open: replaceDialogOpen,
								onOpenChange: setReplaceDialogOpen,
								children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [/* @__PURE__ */ jsxs(AlertDialogHeader, { children: [/* @__PURE__ */ jsx(AlertDialogTitle, { children: "Replace uploaded context?" }), /* @__PURE__ */ jsx(AlertDialogDescription, { children: "You already have a context file uploaded. Uploading a new file will replace it completely. The AI learns from your answers will stay untouched." })] }), /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [/* @__PURE__ */ jsx(AlertDialogCancel, {
									onClick: () => {
										setPendingFile(null);
										setReplaceDialogOpen(false);
									},
									children: "Cancel"
								}), /* @__PURE__ */ jsx(AlertDialogAction, {
									onClick: () => {
										if (pendingFile) uploadMutation.mutate(pendingFile);
									},
									children: "Replace file"
								})] })] })
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ jsx("section", {
				className: "rounded-xl border border-border bg-card p-6",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ jsx(Bell, { className: "mt-0.5 size-5 text-primary" }), /* @__PURE__ */ jsxs("div", {
						className: "flex-1",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between gap-4",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
									className: "font-medium",
									children: "Browser notifications"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Get pinged when a long job finishes, even if you switched tabs."
								})] }), /* @__PURE__ */ jsx(Switch, {
									checked: prefs.enabled,
									onCheckedChange: (value) => void toggleEnabled(value),
									"aria-label": "Enable browser notifications"
								})]
							}),
							permission === "denied" ? /* @__PURE__ */ jsx("p", {
								className: "mt-3 text-sm text-destructive",
								children: "Notifications are blocked for this site. Allow them in your browser settings first."
							}) : null,
							/* @__PURE__ */ jsx(Separator, { className: "my-5" }),
							/* @__PURE__ */ jsx("div", {
								className: "space-y-4",
								children: NOTIFICATION_EVENTS.map((event) => /* @__PURE__ */ jsxs("div", {
									className: "flex items-start justify-between gap-4",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Label, {
										htmlFor: `notif-${event.key}`,
										className: "text-sm font-medium",
										children: event.label
									}), /* @__PURE__ */ jsx("p", {
										className: "text-xs text-muted-foreground",
										children: event.description
									})] }), /* @__PURE__ */ jsx(Switch, {
										id: `notif-${event.key}`,
										checked: prefs[event.key],
										disabled: !prefs.enabled,
										onCheckedChange: (value) => update({ [event.key]: value })
									})]
								}, event.key))
							}),
							/* @__PURE__ */ jsx(Button, {
								variant: "outline",
								size: "sm",
								className: "mt-5",
								disabled: !prefs.enabled,
								onClick: () => notify("cv_tailored", "TailorCV", "This is what a notification looks like."),
								children: "Send a test notification"
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ jsx(TwoFactorExport, {
				title: t.exportTitle,
				hint: t.exportHint
			}),
			/* @__PURE__ */ jsx("section", {
				className: "rounded-xl border border-border bg-card p-6",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ jsx(UserRound, { className: "mt-0.5 size-5 text-primary" }), /* @__PURE__ */ jsxs("div", {
						className: "flex-1",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "font-medium",
								children: "Account"
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: [
									"Signed in as ",
									email || "…",
									". Signing out everywhere ends every active session on all your devices."
								]
							}),
							/* @__PURE__ */ jsxs(Button, {
								variant: "outline",
								size: "sm",
								className: "mt-4",
								onClick: async () => {
									await supabase.auth.signOut({ scope: "global" });
									window.location.href = "/auth";
								},
								children: [/* @__PURE__ */ jsx(LogOut, { className: "size-4" }), " Sign out everywhere"]
							})
						]
					})]
				})
			})
		]
	}) });
}
//#endregion
export { SettingsPage as component };
