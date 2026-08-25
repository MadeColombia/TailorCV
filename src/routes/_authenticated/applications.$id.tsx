import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  Building2,
  Check,
  Copy,
  Download,
  FileText,
  Languages,
  MapPin,
  RefreshCw,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  changeApplicationLanguage,
  generateCoverLetter,
  generateInterviewPrep,
  getApplication,
  getCandidateDossier,
  rememberAnswer,
  saveChatTurn,
  summariseOffer,
  tailorCv,
  updateApplication,
} from "@/lib/applications.functions";
import { notify } from "@/lib/notifications";
import {
  CATEGORY_LABELS,
  normalizeInterviewPrep,
  prepToPlainText,
  type InterviewPrep,
} from "@/lib/interview-prep";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  LANGUAGES,
  languageNative,
  normalizeCv,
  normalizeLanguage,
  normalizeMatch,
  sectionLabels,
  type CvData,
  type MatchResult,
  type ProfileLanguage,
} from "@/lib/cv";
import {
  isEmptySummary,
  normalizeOfferSummary,
  type OfferSummary,
} from "@/lib/offer-summary";
import { getUserSettings } from "@/lib/user-settings.functions";
import { ApplicationTracker } from "@/components/application-tracker";
import { COVER_LETTER_TONES, normalizeTone } from "@/lib/user-settings";
import { downloadCvPdf, downloadLetterPdf } from "@/lib/cv-pdf";
import { getCvTemplate } from "@/lib/template.functions";
import { DEFAULT_TEMPLATE } from "@/lib/cv-template";

import {
  KICKOFF_MESSAGE,
  chatMessageText,
  createChatMessage,
  type ChatMessage,
  type ChatStatus,
} from "@/lib/chat-client";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/_authenticated/applications/$id")({
  beforeLoad: ({ params }) => {
    if (!UUID_RE.test(params.id)) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Tailoring workspace — TailorCV" },
      {
        name: "description",
        content:
          "Tailor your CV to this job offer, answer the AI interview and export the PDF.",
      },
      { property: "og:title", content: "Tailoring workspace — TailorCV" },
      {
        property: "og:description",
        content: "Tailored CV, ATS match score and cover letter.",
      },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const fetchApplication = useServerFn(getApplication);
  const update = useServerFn(updateApplication);
  const tailor = useServerFn(tailorCv);
  const coverLetter = useServerFn(generateCoverLetter);
  const persistTurn = useServerFn(saveChatTurn);
  const remember = useServerFn(rememberAnswer);
  const fetchTemplate = useServerFn(getCvTemplate);
  const makePrep = useServerFn(generateInterviewPrep);
  const fetchDossier = useServerFn(getCandidateDossier);
  const switchLanguage = useServerFn(changeApplicationLanguage);
  const summarise = useServerFn(summariseOffer);

  const { data, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: () => fetchApplication({ data: { id } }),
  });

  const templateQuery = useQuery({
    queryKey: ["cv-template"],
    queryFn: () => fetchTemplate(),
  });

  const fetchSettings = useServerFn(getUserSettings);
  const settingsQuery = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => fetchSettings(),
  });
  const cvLanguages = settingsQuery.data?.cvLanguages ?? ["en"];

  // The saved knowledge document, re-read here (and server-side on every AI
  // call) so an old application always uses the latest context.
  const dossierQuery = useQuery({
    queryKey: ["dossier"],
    queryFn: () => fetchDossier(),
  });
  const [showDossier, setShowDossier] = useState(false);

  const [copied, setCopied] = useState(false);
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [offerText, setOfferText] = useState("");
  const [cv, setCv] = useState<CvData | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [letter, setLetter] = useState("");
  const [tone, setTone] = useState<string | null>(null);
  const [prep, setPrep] = useState<InterviewPrep | null>(null);
  const [prepCopied, setPrepCopied] = useState(false);
  const [language, setLanguage] = useState<ProfileLanguage>("en");
  const [summary, setSummary] = useState<OfferSummary | null>(null);
  const effectiveTone =
    tone ?? settingsQuery.data?.coverLetterTone ?? "professional";

  useEffect(() => {
    if (!data) return;
    setCompany(data.application.company ?? "");
    setRoleTitle(data.application.role_title ?? "");
    setOfferText(data.application.offer_text ?? "");
    setLetter(data.application.cover_letter ?? "");
    setCv(
      data.application.tailored_cv
        ? normalizeCv(data.application.tailored_cv)
        : null,
    );
    setMatch(
      data.application.match_result
        ? normalizeMatch(data.application.match_result)
        : null,
    );
    const storedPrep = (data.application as { interview_prep?: unknown })
      .interview_prep;
    setPrep(storedPrep ? normalizeInterviewPrep(storedPrep) : null);
    setLanguage(
      normalizeLanguage((data.application as { language?: string }).language),
    );
    const storedSummary = (data.application as { offer_summary?: unknown })
      .offer_summary;
    setSummary(storedSummary ? normalizeOfferSummary(storedSummary) : null);
  }, [data]);

  const templateSettings = templateQuery.data ?? DEFAULT_TEMPLATE;

  const initialMessages = useMemo<ChatMessage[]>(
    () =>
      (data?.messages ?? []).map((message) => ({
        id: message.id,
        role: message.role === "assistant" ? "assistant" : "user",
        parts: [{ type: "text", text: message.content }],
      })) as ChatMessage[],
    [data?.messages],
  );

  const activeCv = cv ?? data?.profile ?? null;
  const labels = sectionLabels(language);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<ChatStatus>("ready");

  useEffect(() => {
    if (messages.length === 0 && initialMessages.length > 0)
      setMessages(initialMessages);
  }, [initialMessages, messages.length]);

  const sendMessage = async (text: string) => {
    const userMessage = createChatMessage("user", text);
    const outgoingMessages = [...messages, userMessage];
    setMessages(outgoingMessages);
    setStatus("submitted");

    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      if (!accessToken)
        throw new Error("Your session expired. Please sign in again.");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        // The offer, CV and prior answers are loaded server-side from your own
        // records; only the conversation itself travels with the request.
        body: JSON.stringify({ messages: outgoingMessages, applicationId: id }),
      });

      if (!response.ok)
        throw new Error(
          (await response.text()) || "The interview could not continue.",
        );
      if (!response.body)
        throw new Error("The interview returned an empty response.");

      const assistantMessage = createChatMessage("assistant", "");
      setMessages((current) => [...current, assistantMessage]);
      setStatus("streaming");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, parts: [{ type: "text", text: assistantText }] }
              : message,
          ),
        );
      }
      assistantText += decoder.decode();
      if (assistantText.trim()) {
        void persistTurn({
          data: {
            applicationId: id,
            turns: [{ role: "assistant", content: assistantText.trim() }],
          },
        });
      }
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      toast.error(
        error instanceof Error
          ? error.message
          : "The interview could not continue.",
      );
    }
  };

  const busy = status === "submitted" || status === "streaming";

  // The AI opens the conversation: it reviews the master CV against this offer
  // and only asks something if there is a real gap.
  const kickedOff = useRef(false);
  useEffect(() => {
    if (kickedOff.current) return;
    if (!data || isLoading) return;
    if (initialMessages.length > 0 || messages.length > 0) return;
    if (busy) return;
    // Nothing to interview about until a job description exists.
    if (!(data.application.offer_text ?? "").trim()) return;
    kickedOff.current = true;
    void sendMessage(KICKOFF_MESSAGE);
  }, [
    data,
    isLoading,
    initialMessages.length,
    messages.length,
    busy,
    sendMessage,
  ]);

  const visibleMessages = useMemo(
    () =>
      messages.filter(
        (message) => chatMessageText(message) !== KICKOFF_MESSAGE,
      ),
    [messages],
  );

  const saveMutation = useMutation({
    mutationFn: () => update({ data: { id, company, roleTitle, offerText } }),
    onSuccess: () => toast.success("Application saved"),
    onError: (error: Error) => toast.error(error.message),
  });

  const tailorMutation = useMutation({
    mutationFn: () => tailor({ data: { id } }),
    onSuccess: (result) => {
      setCv(result.cv);
      setMatch(result.match);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success(`Tailored — ${result.match.score}% keyword match`);
      notify(
        "cv_tailored",
        "Your tailored CV is ready",
        `${result.match.score}% keyword match for ${roleTitle || "this role"}.`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
      notify("errors", "Tailoring failed", error.message);
    },
  });

  const letterMutation = useMutation({
    mutationFn: () =>
      coverLetter({
        data: {
          id,
          tone:
            COVER_LETTER_TONES.find(
              (item) => item.value === normalizeTone(effectiveTone),
            )?.label ?? "Professional",
        },
      }),
    onSuccess: (result) => {
      setLetter(result.letter);
      toast.success("Cover letter ready");
      notify(
        "cover_letter",
        "Your cover letter is ready",
        `${company || "Application"} — ${roleTitle || "role"}.`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
      notify("errors", "Cover letter failed", error.message);
    },
  });

  const prepMutation = useMutation({
    mutationFn: () => makePrep({ data: { id } }),
    onSuccess: (result) => {
      setPrep(normalizeInterviewPrep(result));
      toast.success("Interview questions ready");
      notify(
        "interview_prep",
        "Interview prep is ready",
        `Screening questions drafted for ${company || "your application"}.`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
      notify("errors", "Interview prep failed", error.message);
    },
  });

  const summaryMutation = useMutation({
    mutationFn: () => summarise({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Offer summarized");
      notify(
        "offer_analyzed",
        "Offer summary ready",
        "We condensed the job description for you.",
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
      notify("errors", "Offer summary failed", error.message);
    },
  });
  const languageMutation = useMutation({
    mutationFn: (next: ProfileLanguage) =>
      switchLanguage({ data: { id, language: next } }),
    onSuccess: (result) => {
      setLanguage(normalizeLanguage(result.language));
      if (result.cv) setCv(normalizeCv(result.cv));
      if (result.coverLetter) setLetter(result.coverLetter);
      if (result.prep) setPrep(normalizeInterviewPrep(result.prep));
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success(
        result.translated
          ? `Application switched to ${languageNative(result.language)}`
          : "Language unchanged",
      );
    },
    onError: (error: Error, next) => {
      setLanguage(next === "es" ? "en" : "es");
      toast.error(error.message);
    },
  });

  const handleSend = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const lastQuestion = [...messages]
      .reverse()
      .find((message) => message.role === "assistant");
    void sendMessage(text);
    void persistTurn({
      data: { applicationId: id, turns: [{ role: "user", content: text }] },
    });
    // Remember the answer so future workspaces never ask this again.
    void remember({
      data: {
        applicationId: id,
        question: lastQuestion ? chatMessageText(lastQuestion) : "",
        answer: text,
      },
    }).then(() => queryClient.invalidateQueries({ queryKey: ["dossier"] }));
  };

  if (isLoading || !data) {
    return (
      <AppShell>
        <p className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
          Loading…
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All applications
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
            <Input
              className="font-display text-lg font-semibold"
              value={roleTitle}
              onChange={(event) => setRoleTitle(event.target.value)}
              placeholder="Role"
            />
            <Input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Company"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={language}
              onValueChange={(next) => {
                if (next === language || languageMutation.isPending) return;
                setLanguage(next as ProfileLanguage);
                languageMutation.mutate(next as ProfileLanguage);
              }}
            >
              <SelectTrigger className="w-40" aria-label="Application language">
                {languageMutation.isPending ? (
                  <Spinner />
                ) : (
                  <Languages className="size-4" />
                )}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.filter((item) =>
                  cvLanguages.includes(item.code),
                ).map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    {item.native}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={() => saveMutation.mutate()}>
              Save
            </Button>
            <Button
              onClick={() => tailorMutation.mutate()}
              disabled={tailorMutation.isPending}
            >
              {tailorMutation.isPending ? (
                <Spinner />
              ) : (
                <Wand2 className="size-4" />
              )}
              Tailor CV
            </Button>
          </div>
        </div>

        {data?.application && (
          <ApplicationTracker
            application={data.application as never}
            windows={{
              responseWindowDays: settingsQuery.data?.responseWindowDays ?? 21,
              ghostAfterDays: settingsQuery.data?.ghostAfterDays ?? 45,
              archiveRetentionDays:
                settingsQuery.data?.archiveRetentionDays ?? 30,
              followupOffsetDays: settingsQuery.data?.followupOffsetDays ?? 10,
            }}
          />
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="min-w-0">
            {match && (
              <div className="mb-5 rounded-xl border border-border bg-card p-5">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-3xl font-bold text-primary">
                    {match.score}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ATS keyword match
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
                      Not covered yet
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

            <Tabs defaultValue="cv">
              <TabsList>
                <TabsTrigger value="cv">Tailored CV</TabsTrigger>
                <TabsTrigger value="letter">Cover letter</TabsTrigger>
                <TabsTrigger value="prep">Interview prep</TabsTrigger>
                <TabsTrigger value="offer">Job offer</TabsTrigger>
              </TabsList>

              <TabsContent value="cv" className="mt-4">
                {cv ? (
                  <div className="rounded-xl border border-border bg-card">
                    <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadCvPdf(
                            cv,
                            `${(cv.fullName || "CV").replace(/\s+/g, "-")}-${(company || "role").replace(/\s+/g, "-")}.pdf`,
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
                            <p className="text-muted-foreground">
                              {cv.headline}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {[cv.email, cv.phone, cv.location]
                              .filter(Boolean)
                              .join("  •  ")}
                          </p>
                          {cv.linkItems.length > 0 && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {cv.linkItems
                                .filter((link) => link.url)
                                .map((link) => `${link.label}: ${link.url}`)
                                .join("  •  ")}
                            </p>
                          )}
                        </div>
                      </header>
                      {cv.summary && (
                        <section>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
                            {labels.summary}
                          </h3>
                          <p className="mt-2">{cv.summary}</p>
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
                                  {experience.bullets.map(
                                    (bullet, bulletIndex) => (
                                      <li key={bulletIndex}>{bullet}</li>
                                    ),
                                  )}
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
                                  {education.school
                                    ? ` — ${education.school}`
                                    : ""}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {[education.start, education.end]
                                    .filter(Boolean)
                                    .join(" – ")}
                                </p>
                                {education.details && (
                                  <p>{education.details}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                      <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {labels.skills}
                        </h3>
                        <p className="mt-2">
                          {cv.skills.length > 0
                            ? cv.skills.join(", ")
                            : "No skills listed yet."}
                        </p>
                      </section>
                    </article>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-12 text-center">
                    <Sparkles className="mx-auto size-6 text-primary" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No tailored CV yet. Answer a few interview questions, then
                      hit “Tailor CV”.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="letter" className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={normalizeTone(effectiveTone)}
                    onValueChange={setTone}
                  >
                    <SelectTrigger className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COVER_LETTER_TONES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => letterMutation.mutate()}
                    disabled={letterMutation.isPending}
                  >
                    {letterMutation.isPending ? (
                      <Spinner />
                    ) : (
                      <Wand2 className="size-4" />
                    )}
                    Generate
                  </Button>
                  {letter && (
                    <>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(letter);
                            setCopied(true);
                            toast.success("Cover letter copied");
                            setTimeout(() => setCopied(false), 2000);
                          } catch {
                            toast.error(
                              "Couldn't copy — select the text and copy manually",
                            );
                          }
                        }}
                      >
                        {copied ? (
                          <Check className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          downloadLetterPdf(
                            letter,
                            activeCv?.fullName ?? "",
                            `Cover-Letter-${(company || "role").replace(/\s+/g, "-")}.pdf`,
                          )
                        }
                      >
                        <Download className="size-4" /> PDF
                      </Button>
                    </>
                  )}
                </div>
                <Textarea
                  rows={20}
                  value={letter}
                  onChange={(event) => setLetter(event.target.value)}
                  onBlur={() => update({ data: { id, coverLetter: letter } })}
                  placeholder="Your cover letter will appear here."
                />
              </TabsContent>

              <TabsContent value="prep" className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => prepMutation.mutate()}
                    disabled={prepMutation.isPending}
                  >
                    {prepMutation.isPending ? (
                      <Spinner />
                    ) : (
                      <Wand2 className="size-4" />
                    )}
                    {prep ? "Regenerate questions" : "Generate questions"}
                  </Button>
                  {prep && prep.questions.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            prepToPlainText(prep),
                          );
                          setPrepCopied(true);
                          toast.success("Prep sheet copied");
                          setTimeout(() => setPrepCopied(false), 2000);
                        } catch {
                          toast.error(
                            "Couldn't copy — select the text and copy manually",
                          );
                        }
                      }}
                    >
                      {prepCopied ? (
                        <Check className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                      {prepCopied ? "Copied" : "Copy all"}
                    </Button>
                  )}
                </div>

                {prep && prep.questions.length > 0 ? (
                  <Accordion
                    type="multiple"
                    className="rounded-xl border border-border bg-card px-4"
                  >
                    {prep.questions.map((item, index) => (
                      <AccordionItem
                        key={`${index}-${item.question}`}
                        value={`q-${index}`}
                      >
                        <AccordionTrigger className="text-left">
                          <span className="flex flex-1 items-start gap-3 pr-3">
                            <span className="mt-0.5 shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                              {CATEGORY_LABELS[item.category]}
                            </span>
                            <span className="text-sm font-medium">
                              {item.question}
                            </span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 text-sm leading-relaxed">
                          {item.why && (
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">
                                Why they ask:{" "}
                              </span>
                              {item.why}
                            </p>
                          )}
                          {item.answer && (
                            <p className="whitespace-pre-wrap rounded-lg bg-muted/40 p-3">
                              {item.answer}
                            </p>
                          )}
                          {item.isGap && (
                            <p className="text-xs text-muted-foreground">
                              This is a gap versus the offer — the answer
                              bridges it honestly.
                            </p>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(
                                  `${item.question}\n\n${item.answer}`,
                                );
                                toast.success("Question and answer copied");
                              } catch {
                                toast.error(
                                  "Couldn't copy — select the text and copy manually",
                                );
                              }
                            }}
                          >
                            <Copy className="size-4" /> Copy
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-12 text-center">
                    <Sparkles className="mx-auto size-6 text-primary" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No interview questions yet. Generate the likely screening
                      questions for this role, each with a draft answer from
                      your own CV.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="offer" className="mt-4">
                <div className="space-y-5">
                  {/* Summary card */}
                  <div className="relative flex min-h-[320px] flex-col rounded-xl border border-border bg-card">
                    {(!summary || isEmptySummary(summary)) && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-card/80 p-6 text-center backdrop-blur-sm">
                        <Sparkles className="size-8 text-primary" />
                        <p className="mt-3 max-w-xs text-sm font-medium">
                          Summarize offer
                        </p>
                        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                          Let AI read the job description and extract the key
                          details so you can review them at a glance.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => summaryMutation.mutate()}
                          disabled={
                            summaryMutation.isPending || !offerText.trim()
                          }
                        >
                          {summaryMutation.isPending ? (
                            <Spinner />
                          ) : (
                            <Sparkles className="size-4" />
                          )}
                          Summarize offer
                        </Button>
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex-1",
                        !summary || isEmptySummary(summary) ? "opacity-50" : "",
                      )}
                    >
                      <div className="space-y-6 p-6">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-display text-lg font-semibold">
                            Offer summary
                          </h3>
                          {summary && !isEmptySummary(summary) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => summaryMutation.mutate()}
                              disabled={summaryMutation.isPending}
                            >
                              {summaryMutation.isPending ? (
                                <Spinner />
                              ) : (
                                <RefreshCw className="size-4" />
                              )}
                              Refresh
                            </Button>
                          )}
                        </div>

                        <div className="space-y-5">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Building2 className="size-3.5" /> Company
                              </p>
                              <p className="text-sm font-medium">
                                {company || "—"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Briefcase className="size-3.5" /> Role
                              </p>
                              <p className="text-sm font-medium">
                                {roleTitle || "—"}
                              </p>
                            </div>
                            {summary?.salaryText ? (
                              <div className="space-y-1">
                                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Banknote className="size-3.5" /> Salary
                                </p>
                                <p className="text-sm font-medium">
                                  {summary.salaryText}
                                </p>
                              </div>
                            ) : null}
                            {summary?.location ? (
                              <div className="space-y-1">
                                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="size-3.5" /> Location
                                </p>
                                <p className="text-sm font-medium">
                                  {summary.location}
                                </p>
                              </div>
                            ) : null}
                          </div>

                          {summary?.summary ? (
                            <div className="space-y-1">
                              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                <FileText className="size-3.5" /> Brief
                                description
                              </p>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {summary.summary}
                              </p>
                            </div>
                          ) : null}

                          {summary && summary.skills.length > 0 ? (
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">
                                Skills
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {summary.skills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Raw offer text */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">
                      Raw offer description
                    </h4>
                    <Textarea
                      rows={12}
                      value={offerText}
                      onChange={(event) => setOfferText(event.target.value)}
                      onBlur={() => update({ data: { id, offerText } })}
                      placeholder="Paste the full job description here. The AI will use it to tailor your CV and draft questions."
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="flex h-[calc(100vh-11rem)] flex-col overflow-hidden rounded-xl border border-border bg-card lg:sticky lg:top-20">
            <div className="border-b border-border px-5 py-3">
              <p className="font-display text-sm font-semibold">
                Tailoring interview
              </p>
              <p className="text-xs text-muted-foreground">
                Answer the questions, then re-run “Tailor CV”.
              </p>
              <button
                type="button"
                onClick={() => setShowDossier((open) => !open)}
                className="mt-2 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {showDossier ? "Hide" : "Show"} what we already know about you
              </button>
              {showDossier && (
                <div className="mt-2 max-h-56 overflow-y-auto rounded-lg bg-muted/50 p-3 text-xs whitespace-pre-wrap text-muted-foreground">
                  {dossierQuery.data?.content?.trim()
                    ? dossierQuery.data.content
                    : "Nothing recorded yet — your answers below build this up."}
                </div>
              )}
            </div>

            <Conversation className="flex-1">
              <ConversationContent>
                {visibleMessages.length === 0 && !busy && (
                  <ConversationEmptyState
                    title="Let's find the gaps"
                    description="The coach is reviewing this offer against your profile."
                  />
                )}
                {visibleMessages.map((message) => (
                  <Message key={message.id} from={message.role}>
                    <MessageContent>
                      <MessageResponse>
                        {chatMessageText(message)}
                      </MessageResponse>
                    </MessageContent>
                  </Message>
                ))}
                {status === "submitted" && (
                  <Shimmer>Reviewing your CV…</Shimmer>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="border-t border-border p-3">
              <PromptInput onSubmit={handleSend}>
                <PromptInputTextarea
                  autoFocus
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Answer, or ask what's missing…"
                />
                <PromptInputFooter className="justify-end">
                  <PromptInputSubmit status={status} disabled={!input.trim()} />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
