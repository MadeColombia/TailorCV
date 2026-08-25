import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, MessagesSquare, ScanLine, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TailorCV — ATS résumés tailored to each job offer" },
      {
        name: "description",
        content:
          "Upload your CV once. TailorCV interviews you, rewrites an ATS-approved résumé for each offer, and drafts the matching cover letter.",
      },
      { property: "og:title", content: "TailorCV — ATS résumés tailored to each job offer" },
      {
        property: "og:description",
        content:
          "One master profile. A tailored, ATS-safe CV and cover letter for every role you apply to.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    icon: FileText,
    title: "Drop in your CV",
    body: "Upload a PDF or fill the fields. We turn it into one structured master profile you never retype.",
  },
  {
    icon: MessagesSquare,
    title: "Answer the interview",
    body: "The AI reads the offer, spots the gaps, and asks only the questions that would make your CV land.",
  },
  {
    icon: ScanLine,
    title: "Get an ATS-safe PDF",
    body: "Single column, real text, offer keywords mirrored truthfully. Plus a cover letter in the same voice.",
  },
];

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-bold tracking-tight">
          Tailor<span className="text-primary">CV</span>
        </span>
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <section className="grain relative mx-auto max-w-6xl px-6 pb-20 pt-10 md:pt-20">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Target className="size-3.5 text-primary" />
          Built for applicant tracking systems
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] md:text-6xl">
          One profile in.
          <br />
          <span className="text-primary">A tailored CV</span> out, for every offer.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          Paste the job description. TailorCV rewrites your résumé around it — same facts, the
          right words — scores the keyword match, and writes the cover letter to send with it.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/auth">
              Build my CV <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <step.icon className="size-5 text-primary" />
                <span className="font-display text-xs text-muted-foreground">0{index + 1}</span>
              </div>
              <h2 className="mt-5 text-lg font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-muted-foreground">
          TailorCV — your experience, phrased for the machine that reads it first.
        </div>
      </footer>
    </main>
  );
}
