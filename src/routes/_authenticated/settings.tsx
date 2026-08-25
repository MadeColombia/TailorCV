import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Bell, Download, FileUp, Globe, LogOut, Lock, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  NOTIFICATION_EVENTS,
  defaultNotificationPrefs,
  loadNotificationPrefs,
  notificationsSupported,
  notify,
  requestNotificationPermission,
  saveNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/notifications";
import {
  eraseCandidateContext,
  exportCandidateContext,
  getPrivacySnapshot,
  removeUploadedContext,
  uploadCandidateContext,
} from "@/lib/settings.functions";
import { supabase } from "@/integrations/supabase/client";
import { TwoFactorExport } from "@/components/two-factor-export";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES, type ProfileLanguage } from "@/lib/cv";
import {
  AUTO_DELETE_MAX_MONTHS,
  AUTO_DELETE_MIN_MONTHS,
  COVER_LETTER_TONES,
  INTERVIEW_DEPTHS,
  SESSION_CAP_MAX,
  SESSION_CAP_MIN,
  TRACKING_BOUNDS,
  UI_LANGUAGES,
  type UserSettings,
} from "@/lib/user-settings";
import {
  enforceContextRetention,
  getUserSettings,
  updateUserSettings,
} from "@/lib/user-settings.functions";
import { storeUiLanguage, useUiStrings } from "@/lib/ui-strings";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TailorCV" },
      {
        name: "description",
        content:
          "Control your saved career context, export or erase it, and choose which browser notifications TailorCV sends you.",
      },
      { property: "og:title", content: "Settings — TailorCV" },
      {
        property: "og:description",
        content: "Privacy controls and notification preferences for your TailorCV account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const fetchSnapshot = useServerFn(getPrivacySnapshot);
  const exportContext = useServerFn(exportCandidateContext);
  const erase = useServerFn(eraseCandidateContext);
  const uploadContext = useServerFn(uploadCandidateContext);
  const removeUpload = useServerFn(removeUploadedContext);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [email, setEmail] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);

  const snapshot = useQuery({ queryKey: ["privacy-snapshot"], queryFn: () => fetchSnapshot() });

  const t = useUiStrings();
  const fetchSettings = useServerFn(getUserSettings);
  const saveSettings = useServerFn(updateUserSettings);
  const enforceRetention = useServerFn(enforceContextRetention);
  const settingsQuery = useQuery({ queryKey: ["user-settings"], queryFn: () => fetchSettings() });
  const settings = settingsQuery.data;

  // Applying retention on visit means no scheduler is needed.
  useEffect(() => {
    void enforceRetention().then((result) => {
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
    mutationFn: (patch: Partial<UserSettings>) => saveSettings({ data: patch }),
    onSuccess: (result) => {
      queryClient.setQueryData(["user-settings"], result);
      storeUiLanguage(result.uiLanguage);
      toast.success(t.saved);
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const patch = (next: Partial<UserSettings>) => settingsMutation.mutate(next);

  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultNotificationPrefs);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    setPrefs(loadNotificationPrefs());
    setPermission(notificationsSupported() ? Notification.permission : "unsupported");
  }, []);

  const update = (next: Partial<NotificationPrefs>) => {
    const merged = { ...prefs, ...next };
    setPrefs(merged);
    saveNotificationPrefs(merged);
  };

  const toggleEnabled = async (value: boolean) => {
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
      a.download = `tailorcv-context-${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Context downloaded");
    },
    onError: () => toast.error("Couldn't export your context. Try again."),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Couldn't read that file"));
        reader.readAsDataURL(file);
      });
      return uploadContext({ data: { filename: file.name, dataUrl } });
    },
    onSuccess: () => {
      setPendingFile(null);
      setReplaceDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["privacy-snapshot"] });
      queryClient.invalidateQueries({ queryKey: ["dossier"] });
      toast.success("Your context document was added");
    },
    onError: (error: Error) => {
      setPendingFile(null);
      setReplaceDialogOpen(false);
      toast.error(error.message || "Couldn't read that file.");
    },
  });

  const handleFileSelect = (file: File) => {
    if (snapshot.data?.uploaded) {
      setPendingFile(file);
      setReplaceDialogOpen(true);
    } else {
      uploadMutation.mutate(file);
    }
  };

  const removeUploadMutation = useMutation({
    mutationFn: () => removeUpload(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy-snapshot"] });
      queryClient.invalidateQueries({ queryKey: ["dossier"] });
      toast.success("Uploaded context removed");
    },
    onError: () => toast.error("Couldn't remove that. Try again."),
  });

  const eraseMutation = useMutation({
    mutationFn: () => erase(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy-snapshot"] });
      queryClient.invalidateQueries({ queryKey: ["dossier"] });
      toast.success("Your saved context has been erased");
    },
    onError: () => toast.error("Couldn't erase your context. Try again."),
  });

  return (
    <AppShell>
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        <header>
          <h1 className="font-display text-2xl font-bold">{t.settingsTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.settingsSubtitle}
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <Globe className="mt-0.5 size-5 text-primary" />
            <div className="flex-1">
              <h2 className="font-medium">{t.preferences}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.preferencesHint}</p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t.systemLanguage}</Label>
                  <Select
                    value={settings?.uiLanguage ?? "en"}
                    onValueChange={(value) => patch({ uiLanguage: value as UserSettings["uiLanguage"] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {UI_LANGUAGES.map((item) => (
                        <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{t.systemLanguageHint}</p>
                </div>

                <div className="space-y-1.5">
                  <Label>{t.defaultAppLanguage}</Label>
                  <Select
                    value={settings?.defaultAppLanguage ?? "en"}
                    onValueChange={(value) =>
                      patch({ defaultAppLanguage: value as ProfileLanguage })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.filter((item) =>
                        (settings?.cvLanguages ?? ["en"]).includes(item.code),
                      ).map((item) => (
                        <SelectItem key={item.code} value={item.code}>{item.native}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{t.defaultAppLanguageHint}</p>
                </div>

                <div className="space-y-1.5">
                  <Label>{t.coverLetterTone}</Label>
                  <Select
                    value={settings?.coverLetterTone ?? "professional"}
                    onValueChange={(value) =>
                      patch({ coverLetterTone: value as UserSettings["coverLetterTone"] })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COVER_LETTER_TONES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {COVER_LETTER_TONES.find((item) => item.value === settings?.coverLetterTone)
                      ?.hint ?? t.coverLetterToneHint}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label>{t.interviewDepth}</Label>
                  <Select
                    value={settings?.interviewDepth ?? "standard"}
                    onValueChange={(value) =>
                      patch({ interviewDepth: value as UserSettings["interviewDepth"] })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {INTERVIEW_DEPTHS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {INTERVIEW_DEPTHS.find((item) => item.value === settings?.interviewDepth)?.hint ??
                      t.interviewDepthHint}
                  </p>
                </div>
              </div>

              <Separator className="my-5" />

              <div>
                <Label>{t.cvLanguages}</Label>
                <p className="mt-1 text-xs text-muted-foreground">{t.cvLanguagesHint}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {LANGUAGES.filter((item) =>
                    (settings?.cvLanguages ?? ["en"]).includes(item.code),
                  ).map((item) => (
                    <span
                      key={item.code}
                      className="inline-flex items-center gap-2 rounded-md bg-secondary px-2.5 py-1 text-sm"
                    >
                      {item.native}
                      {item.code !== "en" ? (
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`${t.remove} ${item.native}`}
                          onClick={() =>
                            patch({
                              cvLanguages: (settings?.cvLanguages ?? ["en"]).filter(
                                (code) => code !== item.code,
                              ),
                            })
                          }
                        >
                          <X className="size-3.5" />
                        </button>
                      ) : null}
                    </span>
                  ))}
                  {LANGUAGES.some(
                    (item) => !(settings?.cvLanguages ?? ["en"]).includes(item.code),
                  ) ? (
                    <Select
                      value=""
                      onValueChange={(value) =>
                        patch({
                          cvLanguages: [
                            ...(settings?.cvLanguages ?? ["en"]),
                            value as ProfileLanguage,
                          ],
                        })
                      }
                    >
                      <SelectTrigger className="w-44">
                        <span className="text-sm">{t.addLanguage}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.filter(
                          (item) => !(settings?.cvLanguages ?? ["en"]).includes(item.code),
                        ).map((item) => (
                          <SelectItem key={item.code} value={item.code}>{item.native}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
              </div>

              <Separator className="my-5" />

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">Application tracking</h3>
                  <p className="text-xs text-muted-foreground">
                    Controls the ghosting radar, follow-up reminders and how long archived
                    applications are kept.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {(
                    [
                      [
                        "responseWindowDays",
                        "Usual reply window (days)",
                        "How long companies normally take to answer.",
                      ],
                      [
                        "ghostAfterDays",
                        "Consider ghosted after (days)",
                        "Past this, we mark the role as likely ghosted.",
                      ],
                      [
                        "followupOffsetDays",
                        "Follow-up reminder (days)",
                        "Days after applying we nudge you to follow up.",
                      ],
                      [
                        "archiveRetentionDays",
                        "Keep archived roles (days)",
                        "Archived applications are deleted after this.",
                      ],
                    ] as Array<[keyof typeof TRACKING_BOUNDS, string, string]>
                  ).map(([key, label, hint]) => (
                    <div key={key} className="space-y-1.5">
                      <Label htmlFor={`tracking-${key}`}>{label}</Label>
                      <Input
                        id={`tracking-${key}`}
                        type="number"
                        min={TRACKING_BOUNDS[key].min}
                        max={TRACKING_BOUNDS[key].max}
                        className="w-28"
                        key={settings?.[key]}
                        defaultValue={settings?.[key] ?? TRACKING_BOUNDS[key].fallback}
                        onBlur={(event) => {
                          const value = Number(event.target.value);
                          if (Number.isFinite(value) && value !== settings?.[key]) {
                            patch({ [key]: value } as Partial<UserSettings>);
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">{hint}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
                  <div>
                    <Label htmlFor="deep-prep">Deep prep once an interview is booked</Label>
                    <p className="text-xs text-muted-foreground">
                      Moving an application to the interview stage switches its AI coach and prep
                      questions to deep mode.
                    </p>
                  </div>
                  <Switch
                    id="deep-prep"
                    checked={settings?.deepPrepOnInterview ?? true}
                    onCheckedChange={(value) => patch({ deepPrepOnInterview: value })}
                  />
                </div>
              </div>

              <Separator className="my-5" />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="session-cap">{t.messagesPerSession}</Label>
                  <Input
                    id="session-cap"
                    type="number"
                    min={SESSION_CAP_MIN}
                    max={SESSION_CAP_MAX}
                    className="w-32"
                    defaultValue={settings?.sessionMessageCap ?? 30}
                    key={settings?.sessionMessageCap}
                    onBlur={(event) => {
                      const value = Number(event.target.value);
                      if (value !== settings?.sessionMessageCap) patch({ sessionMessageCap: value });
                    }}
                  />
                  <p className="text-xs text-muted-foreground">{t.aiGuardHint}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <Label htmlFor="auto-delete">{t.retention}</Label>
                    <Switch
                      id="auto-delete"
                      checked={settings?.autoDeleteEnabled ?? false}
                      onCheckedChange={(value) => patch({ autoDeleteEnabled: value })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{t.retentionHint}</p>
                  {settings?.autoDeleteEnabled ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{t.retentionMonths}</span>
                      <Input
                        type="number"
                        min={AUTO_DELETE_MIN_MONTHS}
                        max={AUTO_DELETE_MAX_MONTHS}
                        className="w-24"
                        key={settings.autoDeleteMonths}
                        defaultValue={settings.autoDeleteMonths}
                        onBlur={(event) => {
                          const value = Number(event.target.value);
                          if (value !== settings.autoDeleteMonths) patch({ autoDeleteMonths: value });
                        }}
                      />
                      <span className="text-sm text-muted-foreground">months</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <Separator className="my-5" />

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">{t.emailTitle}</h3>
                  <p className="text-xs text-muted-foreground">{t.emailHint}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="email-expiry" className="text-sm font-normal">
                    {t.emailExpiry}
                  </Label>
                  <Switch
                    id="email-expiry"
                    checked={settings?.emailContextExpiry ?? true}
                    onCheckedChange={(value) => patch({ emailContextExpiry: value })}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="email-features" className="text-sm font-normal">
                    {t.emailFeatures}
                  </Label>
                  <Switch
                    id="email-features"
                    checked={settings?.emailNewFeatures ?? false}
                    onCheckedChange={(value) => patch({ emailNewFeatures: value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 text-primary" />
            <div className="flex-1">
              <h2 className="font-medium">Your saved career context</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Everything you tell the AI is folded into one private document used to tailor future
                CVs. It is stored encrypted and only ever readable by your account.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1">
                  <Lock className="size-3.5" />
                  {snapshot.data?.encrypted ? "Encrypted at rest (AES-256)" : "Encryption key missing"}
                </span>
                <span className="rounded-md bg-secondary px-2.5 py-1">
                  {snapshot.data?.answers ?? 0} answers recorded
                </span>
                <span className="rounded-md bg-secondary px-2.5 py-1">
                  {(snapshot.data?.dossier?.length ?? 0).toLocaleString()} characters of context
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportMutation.mutate()}
                  disabled={exportMutation.isPending}
                >
                  <Download className="size-4" /> Download my context
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={eraseMutation.isPending}>
                      <Trash2 className="size-4" /> Erase everything
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Erase your saved context?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently deletes your dossier and every answer you've given the AI.
                        Your master profile, applications and role targets are not affected. This
                        can't be undone — download a copy first if you want to keep it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => eraseMutation.mutate()}>
                        Erase permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {snapshot.data?.dossier ? (
                <details className="mt-5 rounded-lg border border-border bg-muted/40 p-4">
                  <summary className="cursor-pointer text-sm font-medium">Preview context</summary>
                  <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                    {snapshot.data.dossier}
                  </pre>
                </details>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <FileUp className="mt-0.5 size-5 text-primary" />
            <div className="flex-1">
              <h2 className="font-medium">Upload your own context</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a PDF, TXT or Markdown file (an old CV, a brag document, notes about your
                projects). It becomes its own section of your context — uploading again replaces
                only that section, and everything learned from your answers stays untouched.
              </p>

              {snapshot.data?.uploaded ? (
                <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm">
                      <span className="font-medium">{snapshot.data.uploadedName ?? "Uploaded document"}</span>
                      {snapshot.data.uploadedAt ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · added {new Date(snapshot.data.uploadedAt).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUploadMutation.mutate()}
                      disabled={removeUploadMutation.isPending}
                    >
                      <Trash2 className="size-4" /> Remove
                    </Button>
                  </div>
                  <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                    {snapshot.data.uploaded}
                  </pre>
                </div>
              ) : null}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.markdown,application/pdf,text/plain,text/markdown"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) handleFileSelect(file);
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="size-4" />
                {uploadMutation.isPending
                  ? "Reading your file…"
                  : snapshot.data?.uploaded
                    ? "Replace uploaded context"
                    : "Upload a context file"}
              </Button>

              <AlertDialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Replace uploaded context?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You already have a context file uploaded. Uploading a new file will replace it
                      completely. The AI learns from your answers will stay untouched.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => {
                        setPendingFile(null);
                        setReplaceDialogOpen(false);
                      }}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (pendingFile) uploadMutation.mutate(pendingFile);
                      }}
                    >
                      Replace file
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <Bell className="mt-0.5 size-5 text-primary" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-medium">Browser notifications</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get pinged when a long job finishes, even if you switched tabs.
                  </p>
                </div>
                <Switch
                  checked={prefs.enabled}
                  onCheckedChange={(value) => void toggleEnabled(value)}
                  aria-label="Enable browser notifications"
                />
              </div>

              {permission === "denied" ? (
                <p className="mt-3 text-sm text-destructive">
                  Notifications are blocked for this site. Allow them in your browser settings first.
                </p>
              ) : null}

              <Separator className="my-5" />

              <div className="space-y-4">
                {NOTIFICATION_EVENTS.map((event) => (
                  <div key={event.key} className="flex items-start justify-between gap-4">
                    <div>
                      <Label htmlFor={`notif-${event.key}`} className="text-sm font-medium">
                        {event.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                    <Switch
                      id={`notif-${event.key}`}
                      checked={prefs[event.key]}
                      disabled={!prefs.enabled}
                      onCheckedChange={(value) => update({ [event.key]: value })}
                    />
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                disabled={!prefs.enabled}
                onClick={() =>
                  notify("cv_tailored", "TailorCV", "This is what a notification looks like.")
                }
              >
                Send a test notification
              </Button>
            </div>
          </div>
        </section>
        <TwoFactorExport title={t.exportTitle} hint={t.exportHint} />

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 size-5 text-primary" />
            <div className="flex-1">
              <h2 className="font-medium">Account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Signed in as {email || "…"}. Signing out everywhere ends every active session on all
                your devices.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={async () => {
                  await supabase.auth.signOut({ scope: "global" });
                  window.location.href = "/auth";
                }}
              >
                <LogOut className="size-4" /> Sign out everywhere
              </Button>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
