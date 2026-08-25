import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Target, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MAX_TARGETS } from "@/lib/targets";
import {
  createRoleTarget,
  deleteRoleTarget,
  listRoleTargets,
} from "@/lib/targets.functions";
import { LANGUAGES, normalizeMatch, type ProfileLanguage } from "@/lib/cv";

export const Route = createFileRoute("/_authenticated/targets/")({
  head: () => ({
    meta: [
      { title: "Role targets — TailorCV" },
      {
        name: "description",
        content: "Save up to five roles you're hunting for and get a general ATS CV for each one.",
      },
      { property: "og:title", content: "Role targets — TailorCV" },
      {
        property: "og:description",
        content: "General-purpose CVs tuned to a role, not to a single job ad.",
      },
    ],
  }),
  component: TargetsPage,
});

function TargetsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchTargets = useServerFn(listRoleTargets);
  const create = useServerFn(createRoleTarget);
  const remove = useServerFn(deleteRoleTarget);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<ProfileLanguage>("en");

  const { data: targets = [], isLoading } = useQuery({
    queryKey: ["role-targets"],
    queryFn: () => fetchTargets(),
  });

  const createMutation = useMutation({
    mutationFn: () => create({ data: { title: title.trim(), language } }),
    onSuccess: ({ id }) => {
      setOpen(false);
      setTitle("");
      queryClient.invalidateQueries({ queryKey: ["role-targets"] });
      navigate({ to: "/targets/$id", params: { id } });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["role-targets"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const atLimit = targets.length >= MAX_TARGETS;

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Role targets</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Up to {MAX_TARGETS} roles you're hunting for — one general, ATS-ready CV each, reusable
              across every posting for that role.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button disabled={atLimit}>
                <Plus className="size-4" /> New target
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>New role target</DialogTitle>
                <DialogDescription>
                  Name the role you want to be found for. You can refine it on the next screen.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target-title">Role title</Label>
                  <Input
                    id="target-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Senior Backend Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CV language</Label>
                  <Select
                    value={language}
                    onValueChange={(value) => setLanguage(value as ProfileLanguage)}
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
              <DialogFooter>
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || title.trim().length < 2}
                >
                  Create target
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {atLimit && (
          <p className="mt-3 text-xs text-muted-foreground">
            You've reached the {MAX_TARGETS}-target limit. Delete one to add another.
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && targets.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
              <Target className="mx-auto size-6 text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">
                No targets yet. Add the roles you're aiming for and we'll shape a CV around each.
              </p>
            </div>
          )}
          {targets.map((target) => {
            const row = target as Record<string, any>;
            const match = row['match_result'] ? normalizeMatch(row['match_result']) : null;
            return (
              <div
                key={row['id']}
                className="group relative rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <Link
                  to="/targets/$id"
                  params={{ id: row['id'] }}
                  className="block"
                >
                  <p className="font-display text-base font-semibold">{row['title'] || "Untitled role"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[row['seniority'], row['industry'], row['location']].filter(Boolean).join(" · ") ||
                      "No extra details yet"}
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border px-2 py-0.5 uppercase">
                      {row['language'] === "es" ? "Español" : "English"}
                    </span>
                    {match ? (
                      <span className="text-primary">{match.score}% role readiness</span>
                    ) : (
                      <span>Not generated yet</span>
                    )}
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => deleteMutation.mutate(row['id'])}
                  aria-label="Delete target"
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
