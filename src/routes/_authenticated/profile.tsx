import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Download,
  Languages,
  Plus,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CvTemplateEditor } from "@/components/cv-template-editor";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LANGUAGES,
  LINK_PRESETS,
  emptyCv,
  emptyEducation,
  emptyExperience,
  emptyLink,
  type CvData,
  type ProfileLanguage,
} from "@/lib/cv";
import {
  extractCvFromFile,
  getProfile,
  listProfileVersions,
  saveProfile,
  translateProfile,
} from "@/lib/profile.functions";
import { getCvTemplate } from "@/lib/template.functions";
import { downloadCvPdf } from "@/lib/cv-pdf";
import { DEFAULT_TEMPLATE } from "@/lib/cv-template";
import { profileStrings } from "@/lib/profile-strings";
import {
  getUserSettings,
  updateUserSettings,
} from "@/lib/user-settings.functions";
import { useUiStrings } from "@/lib/ui-strings";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Master profile — TailorCV" },
      {
        name: "description",
        content:
          "Your full career history in one place, ready to be tailored for any offer.",
      },
      { property: "og:title", content: "Master profile — TailorCV" },
      {
        property: "og:description",
        content: "Upload a CV or fill the fields once, per language.",
      },
    ],
  }),
  component: ProfilePage,
});

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

/** Downscale to a small square JPEG data URL so it fits comfortably in the profile row. */
async function toCompactDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that image"));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("That image could not be opened"));
    element.src = dataUrl;
  });
  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;
  const side = Math.min(image.width, image.height);
  context.drawImage(
    image,
    (image.width - side) / 2,
    (image.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  return canvas.toDataURL("image/jpeg", 0.82);
}

function ProfilePage() {
  const queryClient = useQueryClient();
  const fetchProfile = useServerFn(getProfile);
  const fetchVersions = useServerFn(listProfileVersions);
  const persist = useServerFn(saveProfile);
  const extract = useServerFn(extractCvFromFile);
  const translate = useServerFn(translateProfile);
  const fetchTemplate = useServerFn(getCvTemplate);

  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const [language, setLanguage] = useState<ProfileLanguage>("en");
  const fetchSettings = useServerFn(getUserSettings);
  const saveSettings = useServerFn(updateUserSettings);
  const settingsQuery = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => fetchSettings(),
  });
  const cvLanguages = settingsQuery.data?.cvLanguages ?? ["en"];
  const [view, setView] = useState<"details" | "design">("details");
  const [cv, setCv] = useState<CvData>(emptyCv);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["profile", language],
    queryFn: () => fetchProfile({ data: { language } }),
  });

  const { data: versions = [] } = useQuery({
    queryKey: ["profile-versions"],
    queryFn: () => fetchVersions(),
  });

  useEffect(() => {
    if (data) setCv(data.cv);
  }, [data]);

  const filled = new Set(
    versions
      .filter((version) => (version.full_name ?? "").trim().length > 0)
      .map((version) => version.language),
  );

  const saveMutation = useMutation({
    mutationFn: () => persist({ data: { language, cv } }),
    onSuccess: () => {
      toast.success(
        `${LANGUAGES.find((item) => item.code === language)?.label} profile saved`,
      );
      queryClient.invalidateQueries({ queryKey: ["profile-versions"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const extractMutation = useMutation({
    mutationFn: async (file: File) => {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read that file"));
        reader.readAsDataURL(file);
      });
      return extract({ data: { filename: file.name, dataUrl } });
    },
    onSuccess: (result) => {
      setCv((current) => ({
        ...result,
        photoUrl: result.photoUrl || current.photoUrl,
      }));
      toast.success("CV imported — review it and save");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const translateMutation = useMutation({
    mutationFn: () =>
      translate({
        data: { from: language === "en" ? "es" : "en", to: language },
      }),
    onSuccess: (result) => {
      setCv(result);
      queryClient.invalidateQueries({ queryKey: ["profile-versions"] });
      toast.success("Translated — review the wording and save");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const photoMutation = useMutation({
    mutationFn: toCompactDataUrl,
    onSuccess: (dataUrl) => set("photoUrl", dataUrl),
    onError: (error: Error) => toast.error(error.message),
  });

  const set = <K extends keyof CvData>(key: K, value: CvData[K]) =>
    setCv((current) => ({ ...current, [key]: value }));

  // Translate from whichever other language already has content (English first).
  const otherLanguage =
    LANGUAGES.find(
      (item) =>
        item.code !== language &&
        cvLanguages.includes(item.code) &&
        filled.has(item.code),
    ) ??
    LANGUAGES.find(
      (item) => item.code !== language && cvLanguages.includes(item.code),
    ) ??
    LANGUAGES[0];

  const addLanguageMutation = useMutation({
    mutationFn: (code: ProfileLanguage) =>
      saveSettings({ data: { cvLanguages: [...cvLanguages, code] } }),
    onSuccess: (result, code) => {
      queryClient.setQueryData(["user-settings"], result);
      setLanguage(code);
      toast.success(
        `${LANGUAGES.find((item) => item.code === code)?.native} version added`,
      );
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const t = profileStrings(language);
  const ui = useUiStrings();
  const otherName = t.languageNames[otherLanguage.code] ?? otherLanguage.label;

  const { data: templateSettings } = useQuery({
    queryKey: ["cv-template"],
    queryFn: () => fetchTemplate(),
  });

  const downloadMaster = () => {
    const name = (cv.fullName || "master-profile")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    downloadCvPdf(
      cv,
      `${name}-${language}.pdf`,
      language,
      templateSettings ?? DEFAULT_TEMPLATE,
    );
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) extractMutation.mutate(file);
                event.target.value = "";
              }}
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={extractMutation.isPending}
            >
              {extractMutation.isPending ? (
                <Spinner />
              ) : (
                <Upload className="size-4" />
              )}
              {t.importPdf}
            </Button>
            <Button variant="outline" onClick={downloadMaster}>
              <Download className="size-4" />
              {t.download}
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {t.save}
            </Button>
          </div>
        </div>

        <Tabs
          value={view}
          onValueChange={(value) => setView(value as "details" | "design")}
        >
          <TabsList className="mt-6">
            <TabsTrigger value="details">{t.tabDetails}</TabsTrigger>
            <TabsTrigger value="design">{t.tabTemplate}</TabsTrigger>
          </TabsList>
        </Tabs>

        {view === "details" && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
            <Tabs
              value={language}
              onValueChange={(value) => setLanguage(value as ProfileLanguage)}
            >
              <TabsList>
                {LANGUAGES.filter((item) =>
                  cvLanguages.includes(item.code),
                ).map((item) => (
                  <TabsTrigger key={item.code} value={item.code}>
                    {item.native}
                    {filled.has(item.code) && (
                      <span className="ml-1.5 text-primary">•</span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            {LANGUAGES.some((item) => !cvLanguages.includes(item.code)) && (
              <Select
                value=""
                onValueChange={(value) =>
                  addLanguageMutation.mutate(value as ProfileLanguage)
                }
              >
                <SelectTrigger className="w-44" aria-label="Add a CV language">
                  <Plus className="size-4" />
                  <span className="text-sm">{ui.addLanguage}</span>
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.filter(
                    (item) => !cvLanguages.includes(item.code),
                  ).map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.native}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="flex-1 text-xs text-muted-foreground">
              {t.languageHint(otherName)}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => translateMutation.mutate()}
              disabled={
                translateMutation.isPending || !filled.has(otherLanguage.code)
              }
              title={
                filled.has(otherLanguage.code)
                  ? undefined
                  : t.fillOtherFirst(otherName)
              }
            >
              {translateMutation.isPending ? (
                <Spinner />
              ) : (
                <Languages className="size-4" />
              )}
              {t.translateFrom(otherName)}
            </Button>
          </div>
        )}

        {view === "design" ? (
          <div className="mt-6">
            <CvTemplateEditor profileCv={cv} language={language} />
          </div>
        ) : isLoading || isFetching ? (
          <p className="mt-8 text-sm text-muted-foreground">{t.loading}</p>
        ) : (
          <div className="mt-4 space-y-4">
            <Section title={t.contact}>
              <div className="flex flex-wrap items-start gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative size-24 overflow-hidden rounded-full border border-border bg-muted">
                    {cv.photoUrl ? (
                      <img
                        src={cv.photoUrl}
                        alt={
                          cv.fullName
                            ? `${cv.fullName} profile photo`
                            : "Profile photo"
                        }
                        className="size-full object-cover"
                      />
                    ) : (
                      <UserRound className="absolute inset-0 m-auto size-9 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    ref={photoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) photoMutation.mutate(file);
                      event.target.value = "";
                    }}
                  />
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => photoRef.current?.click()}
                      disabled={photoMutation.isPending}
                    >
                      {photoMutation.isPending ? <Spinner /> : null}
                      {cv.photoUrl ? t.changePhoto : t.addPhoto}
                    </Button>
                    {cv.photoUrl && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t.removePhoto}
                        onClick={() => set("photoUrl", "")}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                  <p className="max-w-28 text-center text-[11px] leading-tight text-muted-foreground">
                    {t.photoOptional}
                  </p>
                </div>

                <div className="grid min-w-64 flex-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t.fullName}</Label>
                    <Input
                      value={cv.fullName}
                      onChange={(event) => set("fullName", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.headline}</Label>
                    <Input
                      value={cv.headline}
                      onChange={(event) => set("headline", event.target.value)}
                      placeholder={t.headlinePlaceholder}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.email}</Label>
                    <Input
                      value={cv.email}
                      onChange={(event) => set("email", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.phone}</Label>
                    <Input
                      value={cv.phone}
                      onChange={(event) => set("phone", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>{t.location}</Label>
                    <Input
                      value={cv.location}
                      onChange={(event) => set("location", event.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title={t.links}
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    set("linkItems", [...cv.linkItems, { ...emptyLink }])
                  }
                >
                  <Plus className="size-4" /> {t.addLink}
                </Button>
              }
            >
              {cv.linkItems.length === 0 && (
                <p className="text-sm text-muted-foreground">{t.linksEmpty}</p>
              )}
              {cv.linkItems.map((link, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2">
                  <Select
                    value={
                      LINK_PRESETS.includes(link.label) ? link.label : "Other"
                    }
                    onValueChange={(value) =>
                      set(
                        "linkItems",
                        cv.linkItems.map((item, i) =>
                          i === index ? { ...item, label: value } : item,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LINK_PRESETS.map((preset) => (
                        <SelectItem key={preset} value={preset}>
                          {preset}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!LINK_PRESETS.includes(link.label) ||
                  link.label === "Other" ? (
                    <Input
                      className="w-40"
                      placeholder={t.label}
                      value={link.label}
                      onChange={(event) =>
                        set(
                          "linkItems",
                          cv.linkItems.map((item, i) =>
                            i === index
                              ? { ...item, label: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  ) : null}
                  <Input
                    className="min-w-56 flex-1"
                    placeholder="https://linkedin.com/in/you"
                    value={link.url}
                    onChange={(event) =>
                      set(
                        "linkItems",
                        cv.linkItems.map((item, i) =>
                          i === index
                            ? { ...item, url: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t.removeLink}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      set(
                        "linkItems",
                        cv.linkItems.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </Section>

            <Section title={t.summary}>
              <Textarea
                rows={4}
                value={cv.summary}
                onChange={(event) => set("summary", event.target.value)}
                placeholder={t.summaryPlaceholder}
              />
            </Section>

            <Section title={t.experience}>
              {cv.experiences.map((experience, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder={t.jobTitle}
                      value={experience.title}
                      onChange={(event) =>
                        set(
                          "experiences",
                          cv.experiences.map((item, i) =>
                            i === index
                              ? { ...item, title: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder={t.company}
                      value={experience.company}
                      onChange={(event) =>
                        set(
                          "experiences",
                          cv.experiences.map((item, i) =>
                            i === index
                              ? { ...item, company: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder={t.location}
                      value={experience.location}
                      onChange={(event) =>
                        set(
                          "experiences",
                          cv.experiences.map((item, i) =>
                            i === index
                              ? { ...item, location: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder={t.start}
                        value={experience.start}
                        onChange={(event) =>
                          set(
                            "experiences",
                            cv.experiences.map((item, i) =>
                              i === index
                                ? { ...item, start: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                      <Input
                        placeholder={t.end}
                        value={experience.end}
                        onChange={(event) =>
                          set(
                            "experiences",
                            cv.experiences.map((item, i) =>
                              i === index
                                ? { ...item, end: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>
                  <Textarea
                    className="mt-3"
                    rows={4}
                    placeholder={t.bulletsPlaceholder}
                    value={experience.bullets.join("\n")}
                    onChange={(event) =>
                      set(
                        "experiences",
                        cv.experiences.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                bullets: event.target.value.split("\n"),
                              }
                            : item,
                        ),
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      set(
                        "experiences",
                        cv.experiences.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 className="size-4" /> {t.removeRole}
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  set("experiences", [
                    ...cv.experiences,
                    { ...emptyExperience },
                  ])
                }
              >
                <Plus className="size-4" /> {t.addRole}
              </Button>
            </Section>

            <Section title={t.education}>
              {cv.education.map((education, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2"
                >
                  <Input
                    placeholder={t.degree}
                    value={education.degree}
                    onChange={(event) =>
                      set(
                        "education",
                        cv.education.map((item, i) =>
                          i === index
                            ? { ...item, degree: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder={t.school}
                    value={education.school}
                    onChange={(event) =>
                      set(
                        "education",
                        cv.education.map((item, i) =>
                          i === index
                            ? { ...item, school: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder={t.start}
                      value={education.start}
                      onChange={(event) =>
                        set(
                          "education",
                          cv.education.map((item, i) =>
                            i === index
                              ? { ...item, start: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder={t.end}
                      value={education.end}
                      onChange={(event) =>
                        set(
                          "education",
                          cv.education.map((item, i) =>
                            i === index
                              ? { ...item, end: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                  <Input
                    placeholder={t.details}
                    value={education.details}
                    onChange={(event) =>
                      set(
                        "education",
                        cv.education.map((item, i) =>
                          i === index
                            ? { ...item, details: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-self-start text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      set(
                        "education",
                        cv.education.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 className="size-4" /> {t.remove}
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  set("education", [...cv.education, { ...emptyEducation }])
                }
              >
                <Plus className="size-4" /> {t.addEducation}
              </Button>
            </Section>

            <Section title={t.skills}>
              <Textarea
                rows={3}
                value={cv.skills.join(", ")}
                onChange={(event) =>
                  set(
                    "skills",
                    event.target.value.split(",").map((skill) => skill.trim()),
                  )
                }
                placeholder={t.skillsPlaceholder}
              />
            </Section>

            <div className="flex justify-end pb-6">
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {t.save}
              </Button>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
