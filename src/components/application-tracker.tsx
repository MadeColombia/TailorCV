import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Banknote,
  Bell,
  CalendarClock,
  ExternalLink,
  MapPin,
  RefreshCw,
  Sparkles,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  markFollowedUp,
  setInterviewDate,
  setNextAction,
  summariseOffer,
  updateApplicationStage,
} from "@/lib/applications.functions";
import { submitReview } from "@/lib/feedback.functions";
import {
  PIPELINE_STAGES,
  pipelineHealth,
  stageLabel,
  toneTextClass,
  type PipelineStage,
  type TrackingWindows,
} from "@/lib/pipeline";
import { isEmptySummary, normalizeOfferSummary } from "@/lib/offer-summary";
import { notify } from "@/lib/notifications";
import { cn } from "@/lib/utils";

type ApplicationRow = Record<string, unknown> & { id: string };

const OPEN_STAGES: PipelineStage[] = ["draft", "applied", "interview", "offer"];
const CLOSE_ACTIONS: Array<{ stage: PipelineStage; label: string }> = [
  { stage: "rejected", label: "Rejected" },
  { stage: "withdrawn", label: "No longer interested" },
  { stage: "ghosted", label: "Ghosted" },
];

/** Turn an ISO timestamp into the value an <input type="date"> expects. */
function toDateInput(value: unknown): string {
  if (typeof value !== "string") return "";
  const stamp = Date.parse(value);
  if (!Number.isFinite(stamp)) return "";
  return new Date(stamp).toISOString().slice(0, 10);
}

/**
 * Everything the user needs to remember what this application is and where it
 * stands: offer recap, pipeline stage, ghosting radar and reminders.
 */
export function ApplicationTracker({
  application,
  windows,
}: {
  application: ApplicationRow;
  windows: TrackingWindows;
}) {
  const queryClient = useQueryClient();
  const id = application.id;

  const stageFn = useServerFn(updateApplicationStage);
  const interviewFn = useServerFn(setInterviewDate);
  const nextActionFn = useServerFn(setNextAction);
  const followUpFn = useServerFn(markFollowedUp);
  const summariseFn = useServerFn(summariseOffer);
  const reviewFn = useServerFn(submitReview);

  const summary = normalizeOfferSummary(application['offer_summary']);
  const health = pipelineHealth(application as never, windows);
  const stage = health.stage;

  const [interviewAt, setInterviewAt] = useState(toDateInput(application['interview_at']));
  const [nextActionAt, setNextActionAt] = useState(toDateInput(application['next_action_at']));
  const [celebrate, setCelebrate] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    setInterviewAt(toDateInput(application['interview_at']));
    setNextActionAt(toDateInput(application['next_action_at']));
  }, [application['interview_at'], application['next_action_at']]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["application", id] });
    queryClient.invalidateQueries({ queryKey: ["applications"] });
  };

  const stageMutation = useMutation({
    mutationFn: (next: PipelineStage) =>
      stageFn({
        data: {
          id,
          stage: next,
          ...(next === "interview" && interviewAt
            ? { interviewAt: new Date(`${interviewAt}T09:00:00`).toISOString() }
            : {}),
        },
      }),
    onSuccess: (_result, next) => {
      refresh();
      if (next === "interview") {
        toast.success("Interview stage — prep questions switch to deep mode.");
      } else if (next === "offer") {
        setCelebrate(true);
      } else {
        toast.success(`Moved to ${stageLabel(next)}`);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const interviewMutation = useMutation({
    mutationFn: (value: string) =>
      interviewFn({
        data: { id, interviewAt: value ? new Date(`${value}T09:00:00`).toISOString() : null },
      }),
    onSuccess: () => {
      refresh();
      toast.success("Interview date updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const nextActionMutation = useMutation({
    mutationFn: (value: string) =>
      nextActionFn({
        data: { id, nextActionAt: value ? new Date(`${value}T09:00:00`).toISOString() : null },
      }),
    onSuccess: () => refresh(),
    onError: (error: Error) => toast.error(error.message),
  });

  const followUpMutation = useMutation({
    mutationFn: () => followUpFn({ data: { id } }),
    onSuccess: () => {
      refresh();
      toast.success("Logged — we pushed your reminder forward.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const summaryMutation = useMutation({
    mutationFn: () => summariseFn({ data: { id } }),
    onSuccess: () => {
      refresh();
      notify("offer_analyzed", "Offer summary ready", "We condensed the job description for you.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      reviewFn({
        data: { rating, message: reviewText, source: "hired", applicationId: id, mayQuote: true },
      }),
    onSuccess: () => {
      setCelebrate(false);
      toast.success("Thank you — and congratulations!");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const appliedOn = typeof application['applied_at'] === "string"
    ? new Date(application['applied_at'] as string).toLocaleDateString()
    : null;

  return (
    <section className="mt-4 rounded-xl border border-border bg-card">
      {/* Row 1 — pipeline */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {OPEN_STAGES.map((item, index) => {
            const currentIndex = OPEN_STAGES.indexOf(stage);
            const done = currentIndex >= 0 && index <= currentIndex;
            return (
              <Button
                key={item}
                size="sm"
                variant={stage === item ? "default" : done ? "secondary" : "outline"}
                onClick={() => stageMutation.mutate(item)}
                disabled={stageMutation.isPending}
              >
                {item === "offer" ? "Got the job" : stageLabel(item)}
              </Button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {CLOSE_ACTIONS.map((item) => (
            <Button
              key={item.stage}
              size="sm"
              variant={stage === item.stage ? "destructive" : "ghost"}
              className="text-xs text-muted-foreground"
              onClick={() => stageMutation.mutate(item.stage)}
              disabled={stageMutation.isPending}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Row 2 — status left, offer recap right */}
      <div className="grid gap-5 p-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className={cn("text-sm font-medium", toneTextClass(health.tone))}>{health.sentence}</p>
            {health.likelihood !== null && (
              <div className="space-y-1">
                <Progress value={health.likelihood} />
                <p className="text-xs text-muted-foreground">
                  {health.likelihood}% of companies that reply have replied by this point.
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="interview-date" className="text-xs">
                <CalendarClock className="mr-1 inline size-3" /> Interview date
              </Label>
              <Input
                id="interview-date"
                type="date"
                value={interviewAt}
                onChange={(event) => {
                  setInterviewAt(event.target.value);
                  interviewMutation.mutate(event.target.value);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next-action" className="text-xs">
                <Bell className="mr-1 inline size-3" /> Next action
              </Label>
              <Input
                id="next-action"
                type="date"
                value={nextActionAt}
                onChange={(event) => {
                  setNextActionAt(event.target.value);
                  nextActionMutation.mutate(event.target.value);
                }}
              />
            </div>
          </div>

          {stage === "applied" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => followUpMutation.mutate()}
              disabled={followUpMutation.isPending}
            >
              I followed up today
            </Button>
          )}
        </div>

        {/* Offer recap */}
        <div className="rounded-lg border border-border/70 bg-background/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold leading-tight">
                {(application["role_title"] as string) || "Untitled role"}
              </h3>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {(application["company"] as string) || "Unknown company"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {typeof application["offer_url"] === "string" && application["offer_url"] ? (
                <a
                  href={application["offer_url"] as string}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-primary hover:bg-accent hover:underline"
                >
                  <ExternalLink className="size-3.5" /> Job post
                </a>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => summaryMutation.mutate()}
                disabled={summaryMutation.isPending}
              >
                {summaryMutation.isPending ? <Spinner /> : <RefreshCw className="size-3.5" />}
                {isEmptySummary(summary) ? "Summarize offer" : "Refresh"}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {appliedOn && <Badge variant="secondary">Applied {appliedOn}</Badge>}
            {summary.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" /> {summary.location}
              </span>
            )}
            {(summary.seniority || summary.employmentType) && (
              <span>{[summary.seniority, summary.employmentType].filter(Boolean).join(" · ")}</span>
            )}
            {summary.salaryText && (
              <span className="inline-flex items-center gap-1">
                <Banknote className="size-3" /> {summary.salaryText}
              </span>
            )}
          </div>

          {summary.summary ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{summary.summary}</p>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-3.5" /> No recap yet — summarise the offer to get a two-line
              reminder of what this role is about.
            </p>
          )}

          {summary.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {summary.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>


      <Dialog open={celebrate} onOpenChange={setCelebrate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>You got the job 🎉</DialogTitle>
            <DialogDescription>
              Congratulations! If TailorCV helped, a short review means a lot.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} stars`}
                onClick={() => setRating(value)}
                className="p-1"
              >
                <Star
                  className={cn(
                    "size-6",
                    value <= rating ? "fill-primary text-primary" : "text-muted-foreground/40",
                  )}
                />
              </button>
            ))}
          </div>
          <Textarea
            rows={4}
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder="What made the difference for you?"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCelebrate(false)}>
              Maybe later
            </Button>
            <Button onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending}>
              Send review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export { PIPELINE_STAGES };
