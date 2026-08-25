import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Bell,
  Building2,
  CheckCircle2,
  Link2,
  ListChecks,
  Plus,
  Trash2,
  X,
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createApplication,
  deleteApplication,
  listApplications,
  restoreApplication,
  updateApplicationStage,
} from "@/lib/applications.functions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  matchesFilter,
  pipelineHealth,
  stageLabel,
  toneEdgeClass,
  toneTextClass,
  daysUntil,
  PIPELINE_STAGES,
  CLOSED_STAGES,
  type PipelineFilter,
} from "@/lib/pipeline";

import { listRoleTargets } from "@/lib/targets.functions";
import { analyzeOfferUrl, type OfferAnalysis } from "@/lib/offer.functions";
import { notify } from "@/lib/notifications";
import { LANGUAGES, normalizeMatch, type ProfileLanguage } from "@/lib/cv";
import { getUserSettings } from "@/lib/user-settings.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Applications — TailorCV" },
      { name: "description", content: "Track every company and role you have tailored a CV for." },
      { property: "og:title", content: "Applications — TailorCV" },
      { property: "og:description", content: "Your tailored CVs and cover letters, per company." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchApplications = useServerFn(listApplications);
  const create = useServerFn(createApplication);
  const remove = useServerFn(deleteApplication);
  const analyze = useServerFn(analyzeOfferUrl);
  const restore = useServerFn(restoreApplication);
  const [filter, setFilter] = useState<PipelineFilter>("all");

  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [offerText, setOfferText] = useState("");
  const [offerUrl, setOfferUrl] = useState("");
  const [language, setLanguage] = useState<ProfileLanguage | null>(null);
  const [targetId, setTargetId] = useState("none");
  const [analysis, setAnalysis] = useState<OfferAnalysis | null>(null);

  const fetchSettings = useServerFn(getUserSettings);
  const settingsQuery = useQuery({ queryKey: ["user-settings"], queryFn: () => fetchSettings() });
  const cvLanguages = settingsQuery.data?.cvLanguages ?? ["en"];
  // Falls back to the account default until the user picks something else.
  const effectiveLanguage = language ?? settingsQuery.data?.defaultAppLanguage ?? "en";

  const fetchTargets = useServerFn(listRoleTargets);
  const { data: targets = [] } = useQuery({
    queryKey: ["role-targets"],
    queryFn: () => fetchTargets(),
  });
  const readyTargets = (targets as Array<Record<string, any>>)
    .filter((target) => Boolean(target['generated_cv']))
    .map((target) => ({ id: target['id'] as string, title: (target['title'] as string) || "Untitled role" }));


  const analyzeRunRef = useRef(0);

  const resetForm = () => {
    setTargetId("none");
    setCompany("");
    setRoleTitle("");
    setOfferText("");
    setOfferUrl("");
    setAnalysis(null);
  };

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => fetchApplications(),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => {
      const run = ++analyzeRunRef.current;
      return analyze({ data: { url: offerUrl.trim() } }).then((result) => ({ run, result }));
    },
    onSuccess: ({ run, result }) => {
      if (run !== analyzeRunRef.current) return;
      setAnalysis(result);
      if (result.ok) {
        setCompany(result.company);
        setRoleTitle(result.roleTitle);
        setOfferText(result.offerText);
        toast.success("Offer found — check the details below");
        notify("offer_analyzed", "Job offer analysed", `${result.roleTitle || "Role"} at ${result.company || "company"}.`);
      } else {
        toast.error("We couldn't read that offer");
        notify("errors", "We couldn't read that job link", "Fill in the offer details manually to continue.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
      notify("errors", "Job link analysis failed", error.message);
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      create({
        data: {
          company,
          roleTitle,
          offerText,
          offerUrl: offerUrl.trim(),
          language: effectiveLanguage,
          ...(targetId !== "none" ? { targetId } : {}),
          ...(analysis?.ok
            ? {
                offerSummary: {
                  summary: analysis.summary,
                  location: analysis.location,
                  employmentType: analysis.employmentType,
                  seniority: analysis.seniority,
                  salaryText: analysis.salaryText,
                  skills: analysis.skills,
                  companyUrl: offerUrl.trim(),
                },
              }
            : {}),
        },
      }),

    onSuccess: ({ id }) => {
      setOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      navigate({ to: "/applications/$id", params: { id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const windows = {
    responseWindowDays: settingsQuery.data?.responseWindowDays ?? 21,
    ghostAfterDays: settingsQuery.data?.ghostAfterDays ?? 45,
    archiveRetentionDays: settingsQuery.data?.archiveRetentionDays ?? 30,
    followupOffsetDays: settingsQuery.data?.followupOffsetDays ?? 10,
  };
  const visible = applications.filter((application) =>
    matchesFilter(application as never, filter, windows),
  );

  const [selected, setSelected] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const visibleIds = visible.map((item) => item.id);
  const selectedVisible = selected.filter((id) => visibleIds.includes(id));
  const allVisibleSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
  const toggleSelected = (id: string, checked: boolean) =>
    setSelected((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
  const exitBulkMode = () => {
    setIsBulkMode(false);
    setSelected([]);
  };

  const changeStage = useServerFn(updateApplicationStage);
  const bulkStageMutation = useMutation({
    mutationFn: async (stage: string) => {
      for (const id of selectedVisible) {
        await changeStage({ data: { id, stage } });
      }
      return selectedVisible.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} application${count === 1 ? "" : "s"} updated`);
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      for (const id of selectedVisible) {
        await remove({ data: { id } });
      }
      return selectedVisible.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} application${count === 1 ? "" : "s"} deleted`);
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restore({ data: { id } }),
    onSuccess: () => {
      toast.success("Application reclaimed");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applications"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Applications</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              One workspace per offer — tailored CV, interview and cover letter.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => (isBulkMode ? exitBulkMode() : setIsBulkMode(true))}
              aria-pressed={isBulkMode}
            >
              {isBulkMode ? <X className="size-4" /> : <ListChecks className="size-4" />}
              {isBulkMode ? "Cancel" : "Multiple"}
            </Button>
            <Dialog
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) {
                  analyzeRunRef.current += 1;
                  analyzeMutation.reset();
                  resetForm();
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" /> New application
                </Button>
              </DialogTrigger>
            <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New application</DialogTitle>
                <DialogDescription>
                  Paste the link to the offer and we'll read it for you — or fill it in by hand.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="offer-url">Job offer link</Label>
                  <div className="flex gap-2">
                    <Input
                      id="offer-url"
                      value={offerUrl}
                      onChange={(event) => setOfferUrl(event.target.value)}
                      placeholder="https://company.com/careers/senior-data-analyst"
                    />
                    <Button
                      variant="outline"
                      onClick={() => analyzeMutation.mutate()}
                      disabled={analyzeMutation.isPending || offerUrl.trim().length < 8}
                    >
                      {analyzeMutation.isPending ? <Spinner /> : <Link2 className="size-4" />}
                      Analyze
                    </Button>
                  </div>
                </div>

                {analysis?.ok && (
                  <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle2 className="size-4 text-primary" /> Is this the right offer?
                    </p>
                    <dl className="mt-3 grid gap-1 text-sm">
                      <div className="flex gap-2">
                        <dt className="w-24 shrink-0 text-muted-foreground">Role</dt>
                        <dd>{analysis.roleTitle || "—"}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-24 shrink-0 text-muted-foreground">Company</dt>
                        <dd>{analysis.company || "—"}</dd>
                      </div>
                      {analysis.location && (
                        <div className="flex gap-2">
                          <dt className="w-24 shrink-0 text-muted-foreground">Location</dt>
                          <dd>{analysis.location}</dd>
                        </div>
                      )}
                      {(analysis.employmentType || analysis.seniority) && (
                        <div className="flex gap-2">
                          <dt className="w-24 shrink-0 text-muted-foreground">Type</dt>
                          <dd>
                            {[analysis.seniority, analysis.employmentType].filter(Boolean).join(" · ")}
                          </dd>
                        </div>
                      )}
                    </dl>
                    {analysis.highlights.length > 0 && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {analysis.highlights.map((highlight, index) => (
                          <li key={index}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">
                      Anything off? Edit the fields below before creating the workspace.
                    </p>
                  </div>
                )}

                {analysis && !analysis.ok && (
                  <div className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                    <p>{analysis.reason}</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                      placeholder="Acme Ltd"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={roleTitle}
                      onChange={(event) => setRoleTitle(event.target.value)}
                      placeholder="Senior Data Analyst"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>CV language</Label>
                  <Select
                    value={effectiveLanguage}
                    onValueChange={(value) => setLanguage(value as ProfileLanguage)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.filter((item) => cvLanguages.includes(item.code)).map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.native}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {readyTargets.length > 0 && (
                  <div className="space-y-2">
                    <Label>Start from a role target (optional)</Label>
                    <Select value={targetId} onValueChange={setTargetId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Master profile" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Master profile</SelectItem>
                        {readyTargets.map((target) => (
                          <SelectItem key={target.id} value={target.id}>
                            {target.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Tailoring will start from that role's CV instead of the raw master profile.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="offer">Job offer</Label>
                  <Textarea
                    id="offer"
                    value={offerText}
                    onChange={(event) => setOfferText(event.target.value)}
                    rows={10}
                    placeholder="Paste the job description here…"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || offerText.trim().length < 30}
                >
                  Create workspace
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        </div>
        <nav className="mt-8 flex flex-wrap gap-2">
          {(
            [
              ["active", "Active"],
              ["draft", "Drafts"],
              ["interviewing", "Interviewing"],
              ["risk", "Needs attention"],
              ["archive", "Archived"],
              ["all", "All applications"],
            ] as Array<[PipelineFilter, string]>
          ).map(([value, label]) => {
            const count = applications.filter((application) =>
              matchesFilter(application as never, value, windows),
            ).length;
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setFilter(value);
                  setSelected([]);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  filter === value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
                <span className="ml-1.5 text-xs text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </nav>

        {isBulkMode && visible.length > 0 && (
          <div className="animate-fade-in mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={(checked) =>
                  setSelected(checked ? visible.map((item) => item.id) : [])
                }
                aria-label="Select all applications in this view"
              />
              {selected.length > 0 ? `${selected.length} selected` : "Select all"}
            </label>
            {selected.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value=""
                  onValueChange={(value) => bulkStageMutation.mutate(value)}
                  disabled={bulkStageMutation.isPending}
                >
                  <SelectTrigger className="h-9 w-56">
                    <SelectValue placeholder="Change status to…" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...PIPELINE_STAGES, ...CLOSED_STAGES].map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {bulkStageMutation.isPending && <Spinner className="size-4" />}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => bulkDeleteMutation.mutate()}
                  disabled={bulkDeleteMutation.isPending}
                >
                  {bulkDeleteMutation.isPending ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                  Clear
                </Button>
              </div>
            )}
          </div>
        )}


        <div className="mt-4 grid gap-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && applications.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <Building2 className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No applications yet. Add your first job offer to tailor a CV for it.
              </p>
            </div>
          )}
          {!isLoading && applications.length > 0 && visible.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              {filter === "archive"
                ? "Nothing archived. Rejected or ghosted roles land here for 30 days."
                : "No applications in this view."}
            </div>
          )}
          {visible.map((application) => {
            const match = application.match_result ? normalizeMatch(application.match_result) : null;
            const health = pipelineHealth(application as never, windows);
            const archived = Boolean(application.archived_at);
            const reminderInDays = application.next_action_at
              ? daysUntil(application.next_action_at)
              : null;
            return (
              <div
                key={application.id}
                className={cn(
                  "group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40",
                  toneEdgeClass(health.tone),
                )}
              >
                {isBulkMode && (
                  <div className="animate-fade-in">
                    <Checkbox
                      checked={selected.includes(application.id)}
                      onCheckedChange={(checked) => toggleSelected(application.id, checked === true)}
                      aria-label={`Select ${application.role_title || "application"}`}
                    />
                  </div>
                )}
                <Link
                  to="/applications/$id"
                  params={{ id: application.id }}
                  className="min-w-0 flex-1"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-display text-base font-semibold">
                      {application.role_title || "Untitled role"}
                    </p>
                    <Badge variant="secondary">{stageLabel(application.stage)}</Badge>
                    <span className="text-xs uppercase text-muted-foreground">
                      {application.language ?? "en"}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {application.company || "Unknown company"}
                  </p>
                  <p className={cn("mt-1 truncate text-sm", toneTextClass(health.tone))}>
                    {health.sentence}
                  </p>
                  {reminderInDays !== null && !archived && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Bell className="size-3" />
                      {reminderInDays > 0
                        ? `Follow up in ${reminderInDays} day${reminderInDays === 1 ? "" : "s"}`
                        : reminderInDays === 0
                          ? "Follow up today"
                          : `Follow-up overdue by ${Math.abs(reminderInDays)} day${reminderInDays === -1 ? "" : "s"}`}
                    </p>
                  )}
                </Link>
                {match && (
                  <div className="text-right">
                    <p className="font-display text-xl font-bold text-primary">{match.score}%</p>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      match
                    </p>
                  </div>
                )}
                {archived ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => restoreMutation.mutate(application.id)}
                  >
                    <ArchiveRestore className="size-4" /> Reclaim
                  </Button>
                ) : (
                  <Archive className="size-4 text-transparent" aria-hidden />
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => deleteMutation.mutate(application.id)}
                  aria-label="Delete application"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>

      </main>
    </AppShell>
  );
}
