import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Download, Sparkle, Wand2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getRoleTarget,
  generateTargetCv,
  updateRoleTarget,
} from "@/lib/targets.functions";
import { getCvTemplate } from "@/lib/template.functions";
import { DEFAULT_TEMPLATE } from "@/lib/cv-template";
import { downloadCvPdf } from "@/lib/cv-pdf";
import {
  LANGUAGES,
  normalizeCv,
  normalizeMatch,
  sectionLabels,
  type CvData,
  type MatchResult,
  type ProfileLanguage,
} from "@/lib/cv";

export const Route = createFileRoute("/_authenticated/targets/$id")({
  head: () => ({
    meta: [
      { title: "Role target — TailorCV" },
      {
        name: "description",
        content:
          "Shape a general ATS CV around one role you're targeting, then download the PDF.",
      },
      { property: "og:title", content: "Role target — TailorCV" },
      {
        property: "og:description",
        content:
          "A reusable, role-focused CV with a readiness score and missing keywords.",
      },
    ],
  }),
  component: TargetWorkspace,
});

function TargetWorkspace() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const fetchTarget = useServerFn(getRoleTarget);
  const update = useServerFn(updateRoleTarget);
  const generate = useServerFn(generateTargetCv);
  const fetchTemplate = useServerFn(getCvTemplate);

  const { data, isLoading } = useQuery({
    queryKey: ["role-target", id],
    queryFn: () => fetchTarget({ data: { id } }),
  });
  const templateQuery = useQuery({
    queryKey: ["cv-template"],
    queryFn: () => fetchTemplate(),
  });
  const templateSettings = templateQuery.data ?? DEFAULT_TEMPLATE;

  const [title, setTitle] = useState("");
  const [seniority, setSeniority] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [keywords, setKeywords] = useState("");
  const [sampleOffers, setSampleOffers] = useState("");
  const [language, setLanguage] = useState<ProfileLanguage>("en");
  const [cv, setCv] = useState<CvData | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);

  useEffect(() => {
    if (!data) return;
    const row = data as Record<string, any>;
    setTitle(row["title"] ?? "");
    setSeniority(row["seniority"] ?? "");
    setLocation(row["location"] ?? "");
    setIndustry(row["industry"] ?? "");
    setKeywords(
      Array.isArray(row["keywords"]) ? row["keywords"].join(", ") : "",
    );
    setSampleOffers(row["sample_offers"] ?? "");
    setLanguage(row["language"] === "es" ? "es" : "en");
    setCv(row["generated_cv"] ? normalizeCv(row["generated_cv"]) : null);
    setMatch(row["match_result"] ? normalizeMatch(row["match_result"]) : null);
  }, [data]);

  const labels = sectionLabels(language);

  const payload = () => ({
    id,
    title,
    seniority,
    location,
    industry,
    keywords: keywords
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    sampleOffers,
    language,
  });

  const saveMutation = useMutation({
    mutationFn: () => update({ data: payload() }),
    onSuccess: () => {
      toast.success("Target saved");
      queryClient.invalidateQueries({ queryKey: ["role-targets"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      await update({ data: payload() });
      return generate({ data: { id } });
    },
    onSuccess: (result) => {
      setCv(result.cv);
      setMatch(result.match);
      queryClient.invalidateQueries({ queryKey: ["role-targets"] });
      toast.success("Role CV generated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading || !data) {
    return (
      <AppShell>
        <main className="mx-auto max-w-6xl px-6 py-16 text-sm text-muted-foreground">
          Loading…
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link
          to="/targets"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All targets
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <Input
            className="max-w-md font-display text-lg font-semibold"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Senior Backend Engineer"
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => saveMutation.mutate()}>
              Save
            </Button>
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <Spinner />
              ) : (
                <Wand2 className="size-4" />
              )}
              {cv ? "Regenerate CV" : "Generate CV"}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.3fr]">
          <section className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="seniority">Seniority</Label>
                <Input
                  id="seniority"
                  value={seniority}
                  onChange={(event) => setSeniority(event.target.value)}
                  placeholder="Senior / Lead"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  placeholder="Fintech, SaaS…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location / work mode</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Madrid · Remote"
                />
              </div>
              <div className="space-y-2">
                <Label>CV language</Label>
                <Select
                  value={language}
                  onValueChange={(value) =>
                    setLanguage(value as ProfileLanguage)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((item) => (
                      <SelectItem key={item.code} value={item.code}>
                        {item.native}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords to emphasise</Label>
              <Input
                id="keywords"
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                placeholder="Go, Kubernetes, event-driven, PostgreSQL"
              />
              <p className="text-xs text-muted-foreground">Comma separated.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="samples">Sample job ads (optional)</Label>
              <Textarea
                id="samples"
                rows={12}
                value={sampleOffers}
                onChange={(event) => setSampleOffers(event.target.value)}
                placeholder="Paste 1-3 job ads you'd realistically apply to. The AI uses them as the market description for this role."
              />
            </div>
          </section>

          <section className="min-w-0">
            {match && (
              <div className="mb-5 rounded-xl border border-border bg-card p-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-bold text-primary">
                    {match.score}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    role readiness
                  </span>
                </div>
                {match.notes && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {match.notes}
                  </p>
                )}
                {match.missing.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Usually asked, not covered yet
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {match.missing.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {cv ? (
              <div className="rounded-xl border border-border bg-card">
                <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadCvPdf(
                        cv,
                        `${(cv.fullName || "CV").replace(/\s+/g, "-")}-${(title || "role").replace(/\s+/g, "-")}.pdf`,
                        language,
                        templateSettings,
                      )
                    }
                  >
                    <Download className="size-4" /> Download PDF
                  </Button>
                </div>
                <article className="space-y-6 p-7 text-sm leading-relaxed">
                  <header className="flex items-start gap-4">
                    {cv.photoUrl && (
                      <img
                        src={cv.photoUrl}
                        alt={`${cv.fullName} profile photo`}
                        className="size-16 shrink-0 rounded-full object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <h2 className="font-display text-xl font-bold">
                        {cv.fullName}
                      </h2>
                      {cv.headline && (
                        <p className="text-muted-foreground">{cv.headline}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[cv.email, cv.phone, cv.location]
                          .filter(Boolean)
                          .join("  •  ")}
                      </p>
                    </div>
                  </header>
                  {cv.summary && (
                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {labels.summary}
                      </h3>
                      <Textarea
                        className="mt-2"
                        rows={4}
                        value={cv.summary}
                        onChange={(event) =>
                          setCv({ ...cv, summary: event.target.value })
                        }
                        onBlur={() => update({ data: { id, generatedCv: cv } })}
                      />
                    </section>
                  )}
                  {cv.experiences.length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {labels.experience}
                      </h3>
                      <div className="mt-3 space-y-4">
                        {cv.experiences.map((experience, index) => (
                          <div key={index}>
                            <p className="font-semibold">
                              {experience.title}
                              {experience.company
                                ? ` — ${experience.company}`
                                : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {[
                                experience.location,
                                [experience.start, experience.end]
                                  .filter(Boolean)
                                  .join(" – "),
                              ]
                                .filter(Boolean)
                                .join("  |  ")}
                            </p>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                              {experience.bullets.map((bullet, bulletIndex) => (
                                <li key={bulletIndex}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                  {cv.education.length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {labels.education}
                      </h3>
                      <div className="mt-3 space-y-3">
                        {cv.education.map((education, index) => (
                          <div key={index}>
                            <p className="font-semibold">
                              {education.degree}
                              {education.school ? ` — ${education.school}` : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {[education.start, education.end]
                                .filter(Boolean)
                                .join(" – ")}
                            </p>
                            {education.details && <p>{education.details}</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                  {cv.skills.length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {labels.skills}
                      </h3>
                      <Input
                        className="mt-2"
                        value={cv.skills.join(", ")}
                        onChange={(event) =>
                          setCv({
                            ...cv,
                            skills: event.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          })
                        }
                        onBlur={() => update({ data: { id, generatedCv: cv } })}
                      />
                    </section>
                  )}
                </article>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <Sparkle className="mx-auto size-6 text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No role CV yet. Fill in the details on the left, then hit
                  “Generate CV”.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}
