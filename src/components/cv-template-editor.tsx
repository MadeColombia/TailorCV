import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Download, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  ACCENT_OPTIONS,
  DEFAULT_TEMPLATE,
  DENSITY_OPTIONS,
  FONT_OPTIONS,
  SECTION_LABELS_UI,
  TEMPLATE_OPTIONS,
  accentHex,
  densityFactor,
  fontCss,
  type TemplateSection,
  type TemplateSettings,
} from "@/lib/cv-template";
import { getCvTemplate, saveCvTemplate } from "@/lib/template.functions";
import { emptyCv, sectionLabels, type CvData } from "@/lib/cv";
import { downloadCvPdf } from "@/lib/cv-pdf";

const SAMPLE: CvData = {
  ...emptyCv,
  fullName: "Alex Moreno",
  email: "alex@example.com",
  phone: "+34 600 000 000",
  location: "Madrid, Spain",
  linkItems: [{ label: "LinkedIn", url: "linkedin.com/in/alex" }],
  links: "LinkedIn: linkedin.com/in/alex",
  headline: "Senior Product Engineer",
  summary:
    "Product engineer with 8 years building data-heavy web platforms, focused on measurable delivery and clean, testable systems.",
  experiences: [
    {
      company: "Northwind",
      title: "Senior Product Engineer",
      location: "Remote",
      start: "2022",
      end: "Present",
      bullets: [
        "Led the migration of the billing platform, cutting invoice errors by 38%.",
        "Shipped a self-serve analytics module used by 12k monthly accounts.",
      ],
    },
  ],
  education: [
    {
      school: "Universidad Politécnica",
      degree: "BSc Computer Science",
      start: "2013",
      end: "2017",
      details: "",
    },
  ],
  skills: ["TypeScript", "React", "PostgreSQL", "AWS"],
};

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Preview({
  cv,
  settings,
  language,
}: {
  cv: CvData;
  settings: TemplateSettings;
  language: string;
}) {
  const labels = sectionLabels(language);
  const accent = accentHex(settings.accent);
  const factor =
    densityFactor(settings.density) *
    (settings.template === "compact" ? 0.94 : 1);
  const base = 12 * factor;
  const heading = (label: string) => (
    <h4
      className="mb-2 border-b pb-1 font-semibold uppercase tracking-wide"
      style={{ color: accent, borderColor: accent, fontSize: base * 0.9 }}
    >
      {label}
    </h4>
  );

  const sections: Record<TemplateSection, React.ReactNode> = {
    summary: cv.summary ? (
      <div key="summary" className="mt-4">
        {heading(labels.summary)}
        <p>{cv.summary}</p>
      </div>
    ) : null,
    experience: cv.experiences.length ? (
      <div key="experience" className="mt-4">
        {heading(labels.experience)}
        {cv.experiences.map((exp, index) => (
          <div key={index} className="mb-3">
            <p className="font-semibold">
              {[exp.title, exp.company].filter(Boolean).join(" — ")}
            </p>
            <p style={{ fontSize: base * 0.85, opacity: 0.75 }}>
              {[exp.location, [exp.start, exp.end].filter(Boolean).join(" – ")]
                .filter(Boolean)
                .join("  |  ")}
            </p>
            <ul className="mt-1 list-disc pl-4">
              {exp.bullets.map((bullet, bulletIndex) => (
                <li key={bulletIndex}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ) : null,
    education: cv.education.length ? (
      <div key="education" className="mt-4">
        {heading(labels.education)}
        {cv.education.map((edu, index) => (
          <div key={index} className="mb-2">
            <p className="font-semibold">
              {[edu.degree, edu.school].filter(Boolean).join(" — ")}
            </p>
            <p style={{ fontSize: base * 0.85, opacity: 0.75 }}>
              {[edu.start, edu.end].filter(Boolean).join(" – ")}
            </p>
            {edu.details && <p>{edu.details}</p>}
          </div>
        ))}
      </div>
    ) : null,
    skills: cv.skills.length ? (
      <div key="skills" className="mt-4">
        {heading(labels.skills)}
        <p>{cv.skills.join(", ")}</p>
      </div>
    ) : null,
  };

  const links = cv.linkItems.length
    ? cv.linkItems
        .filter((item) => item.url.trim())
        .map((item) => (item.label ? `${item.label}: ${item.url}` : item.url))
        .join("  |  ")
    : cv.links;

  return (
    <div
      className="rounded-lg bg-white p-8 text-[#111] shadow-sm"
      style={{
        fontFamily: fontCss(settings.font),
        fontSize: base,
        lineHeight: 1.45,
      }}
    >
      <header
        className={cn(
          "flex items-start gap-4",
          settings.template === "band" && "-m-8 mb-0 bg-[#f4f5f7] p-8",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="font-bold" style={{ fontSize: base * 1.7 }}>
            {cv.fullName}
          </p>
          {cv.headline && (
            <p style={{ fontSize: base * 1.05 }}>{cv.headline}</p>
          )}
          <p style={{ fontSize: base * 0.85, opacity: 0.8 }}>
            {[cv.email, cv.phone, cv.location].filter(Boolean).join("  |  ")}
          </p>
          {links && (
            <p style={{ fontSize: base * 0.85, opacity: 0.8 }}>{links}</p>
          )}
        </div>
        {settings.showPhoto && cv.photoUrl && (
          <img
            src={cv.photoUrl}
            alt=""
            className="size-16 shrink-0 object-cover"
          />
        )}
      </header>
      {settings.template === "band" && <div className="h-4" />}
      {settings.sectionOrder.map((section) => sections[section])}
    </div>
  );
}

/** Purely visual CV template controls with a live preview of the master profile. */
export function CvTemplateEditor({
  profileCv,
  language = "en",
}: {
  profileCv?: CvData;
  language?: string;
}) {
  const fetchTemplate = useServerFn(getCvTemplate);
  const persistTemplate = useServerFn(saveCvTemplate);

  const templateQuery = useQuery({
    queryKey: ["cv-template"],
    queryFn: () => fetchTemplate(),
  });
  const [settings, setSettings] = useState<TemplateSettings>(DEFAULT_TEMPLATE);

  useEffect(() => {
    if (templateQuery.data) setSettings(templateQuery.data);
  }, [templateQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (next: TemplateSettings) =>
      persistTemplate({ data: { settings: next } }),
    onSuccess: () =>
      toast.success("Template saved — it will be used for every CV export."),
    onError: (error: Error) => toast.error(error.message),
  });

  const patch = (next: Partial<TemplateSettings>) =>
    setSettings((current) => ({ ...current, ...next }));

  const move = (index: number, direction: -1 | 1) => {
    setSettings((current) => {
      const order = [...current.sectionOrder];
      const target = index + direction;
      if (target < 0 || target >= order.length) return current;
      [order[index], order[target]] = [order[target]!, order[index]!];
      return { ...current, sectionOrder: order };
    });
  };

  const previewCv: CvData =
    profileCv && (profileCv.fullName || profileCv.experiences.length)
      ? profileCv
      : SAMPLE;

  if (templateQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="size-5" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setSettings(DEFAULT_TEMPLATE);
            saveMutation.mutate(DEFAULT_TEMPLATE);
          }}
        >
          <RotateCcw className="size-4" /> Default design
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            downloadCvPdf(
              previewCv,
              "cv-template-sample.pdf",
              language,
              settings,
            )
          }
        >
          <Download className="size-4" /> Sample PDF
        </Button>
        <Button
          onClick={() => saveMutation.mutate(settings)}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Spinner className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          Save template
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Panel title="Template">
            {TEMPLATE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => patch({ template: option.id })}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  settings.template === option.id
                    ? "border-primary bg-secondary"
                    : "border-border hover:border-muted-foreground/40",
                )}
              >
                <p className="text-sm font-medium">{option.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {option.description}
                </p>
              </button>
            ))}
          </Panel>

          <Panel title="Typography">
            <div className="grid grid-cols-3 gap-2">
              {FONT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => patch({ font: option.id })}
                  style={{ fontFamily: option.css }}
                  className={cn(
                    "rounded-md border px-2 py-2 text-xs",
                    settings.font === option.id
                      ? "border-primary bg-secondary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {option.label.split(" ")[0]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DENSITY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => patch({ density: option.id })}
                  className={cn(
                    "rounded-md border px-2 py-2 text-xs",
                    settings.density === option.id
                      ? "border-primary bg-secondary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Accent colour">
            <div className="flex flex-wrap gap-2">
              {ACCENT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  title={option.label}
                  onClick={() => patch({ accent: option.id })}
                  className={cn(
                    "size-8 rounded-full border-2",
                    settings.accent === option.id
                      ? "border-primary"
                      : "border-border",
                  )}
                  style={{ backgroundColor: option.hex }}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Photo">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="show-photo">Show profile photo</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Off by default — many parsers prefer a CV with no image.
                </p>
              </div>
              <Switch
                id="show-photo"
                checked={settings.showPhoto}
                onCheckedChange={(checked) => patch({ showPhoto: checked })}
              />
            </div>
          </Panel>

          <Panel title="Section order">
            {settings.sectionOrder.map((section, index) => (
              <div
                key={section}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
              >
                {SECTION_LABELS_UI[section]}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => move(index, -1)}
                    aria-label={`Move ${SECTION_LABELS_UI[section]} up`}
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => move(index, 1)}
                    aria-label={`Move ${SECTION_LABELS_UI[section]} down`}
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </Panel>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
            Preview — how your PDF will look
          </p>
          <Preview cv={previewCv} settings={settings} language={language} />
        </div>
      </div>
    </div>
  );
}
