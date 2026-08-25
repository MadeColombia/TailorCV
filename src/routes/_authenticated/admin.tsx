import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ShieldCheck, Star } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  getAdminOverview,
  setAdminRole,
  setIssueStatus,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin · TailorCV" },
      {
        name: "description",
        content: "Usage, users, issues and reviews for TailorCV operators.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const numberFormat = new Intl.NumberFormat("en-US");

function formatDate(value: unknown) {
  if (typeof value !== "string") return "—";
  const stamp = Date.parse(value);
  return Number.isFinite(stamp) ? new Date(stamp).toLocaleDateString() : "—";
}

function AdminPage() {
  const overviewFn = useServerFn(getAdminOverview);
  const roleFn = useServerFn(setAdminRole);
  const statusFn = useServerFn(setIssueStatus);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => overviewFn({}),
    retry: false,
  });

  const roleMutation = useMutation({
    mutationFn: (input: { userId: string; isAdmin: boolean }) =>
      roleFn({ data: input }),
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: string }) =>
      statusFn({ data: input }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const users = useMemo(() => {
    const list = data?.users ?? [];
    const term = search.trim().toLowerCase();
    const filtered = term
      ? list.filter((user) => user.email.toLowerCase().includes(term))
      : list;
    return [...filtered].sort((a, b) => b.tokens - a.tokens);
  }, [data?.users, search]);

  if (error) {
    return (
      <AppShell>
        <main className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="font-display text-2xl font-bold">Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is restricted to TailorCV operators.
          </p>
        </main>
      </AppShell>
    );
  }

  const usage = data?.usage;
  const stats = data?.stats;
  const featureRows = Object.entries(usage?.byFeature ?? {}).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <header className="flex items-center gap-3">
          <ShieldCheck className="size-5 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold">Admin dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Token spend, accounts, reported issues and reviews.
            </p>
          </div>
        </header>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Tokens (24h)", value: usage?.total1 ?? 0 },
                { label: "Tokens (7d)", value: usage?.total7 ?? 0 },
                { label: "Tokens (30d)", value: usage?.total30 ?? 0 },
                { label: "AI calls (30d)", value: usage?.calls30 ?? 0 },
              ].map((item) => (
                <Card key={item.label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="font-display text-2xl font-bold">
                    {numberFormat.format(item.value)}
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: "Users", value: stats?.totalUsers ?? 0 },
                { label: "New (30d)", value: stats?.signupsLast30 ?? 0 },
                { label: "Applications", value: stats?.totalApplications ?? 0 },
                { label: "Interviewing", value: stats?.interviewing ?? 0 },
                { label: "Offers", value: stats?.offers ?? 0 },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="py-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="font-display text-xl font-bold">
                      {numberFormat.format(item.value)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </section>

            <Tabs defaultValue="users">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="usage">Usage by feature</TabsTrigger>
                <TabsTrigger value="issues">
                  Issues
                  {data?.issues.some((issue) => issue.status === "new") ? (
                    <span className="ml-2 size-2 rounded-full bg-destructive" />
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-3 pt-4">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by email"
                  className="max-w-xs"
                />
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Joined</th>
                        <th className="px-4 py-2">Last sign-in</th>
                        <th className="px-4 py-2 text-right">Tokens (30d)</th>
                        <th className="px-4 py-2 text-right">Admin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t border-border">
                          <td className="px-4 py-2">{user.email || user.id}</td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {formatDate(user.lastSignInAt)}
                          </td>
                          <td className="px-4 py-2 text-right tabular-nums">
                            {numberFormat.format(user.tokens)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {user.isMaster ? (
                              <span className="text-xs font-medium text-primary">
                                Owner
                              </span>
                            ) : (
                              <Switch
                                checked={user.isAdmin}
                                disabled={!data?.viewerIsMaster}
                                onCheckedChange={(checked) =>
                                  roleMutation.mutate({
                                    userId: user.id,
                                    isAdmin: checked,
                                  })
                                }
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="usage" className="pt-4">
                <div className="space-y-2">
                  {featureRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No AI usage recorded yet.
                    </p>
                  ) : (
                    featureRows.map(([feature, tokens]) => {
                      const max = featureRows[0]?.[1] || 1;
                      return (
                        <div key={feature} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">
                              {feature.replace(/_/g, " ")}
                            </span>
                            <span className="tabular-nums text-muted-foreground">
                              {numberFormat.format(tokens)}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{
                                width: `${Math.round((tokens / max) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              <TabsContent value="issues" className="space-y-3 pt-4">
                {(data?.issues ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No issues reported. Nice.
                  </p>
                ) : (
                  (data?.issues ?? []).map((issue) => (
                    <Card key={issue.id}>
                      <CardContent className="space-y-2 py-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge
                            variant={
                              issue.status === "resolved"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {issue.status.replace("_", " ")}
                          </Badge>
                          <span>{formatDate(issue.created_at)}</span>
                          {issue.route ? <span>· {issue.route}</span> : null}
                        </div>
                        <p className="whitespace-pre-wrap text-sm">
                          {issue.message}
                        </p>
                        {issue.client_info ? (
                          <div className="flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                            {(
                              [
                                [
                                  "App",
                                  `v${issue.client_info["appVersion"] ?? "?"} (${issue.client_info["appBuild"] ?? "?"})`,
                                ],
                                [
                                  "Browser",
                                  `${issue.client_info["browser"] ?? "?"} ${issue.client_info["browserVersion"] ?? ""}`,
                                ],
                                ["OS", issue.client_info["os"]],
                                ["Device", issue.client_info["deviceType"]],
                                ["Screen", issue.client_info["screen"]],
                                ["Viewport", issue.client_info["viewport"]],
                                ["DPR", issue.client_info["pixelRatio"]],
                                ["Lang", issue.client_info["language"]],
                                ["TZ", issue.client_info["timezone"]],
                              ] as Array<[string, unknown]>
                            )
                              .filter(
                                ([, value]) =>
                                  value !== null &&
                                  value !== undefined &&
                                  value !== "",
                              )
                              .map(([label, value]) => (
                                <span
                                  key={label}
                                  className="rounded border border-border px-1.5 py-0.5"
                                >
                                  {label}: {String(value)}
                                </span>
                              ))}
                          </div>
                        ) : null}
                        {issue.screenshot_url ? (
                          <a
                            href={issue.screenshot_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-fit overflow-hidden rounded-lg border border-border"
                          >
                            <img
                              src={issue.screenshot_url}
                              alt="User-submitted screenshot"
                              className="max-h-56 object-contain bg-muted"
                            />
                          </a>
                        ) : null}
                        <div className="flex gap-2">
                          {["new", "in_progress", "resolved"].map((status) => (
                            <Button
                              key={status}
                              size="sm"
                              variant={
                                issue.status === status ? "secondary" : "ghost"
                              }
                              onClick={() =>
                                statusMutation.mutate({ id: issue.id, status })
                              }
                            >
                              {status.replace("_", " ")}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-3 pt-4">
                {(data?.reviews ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No reviews yet.
                  </p>
                ) : (
                  (data?.reviews ?? []).map((review) => (
                    <Card key={review.id}>
                      <CardContent className="space-y-2 py-4">
                        <div className="flex items-center gap-2">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={
                                index < review.rating
                                  ? "size-4 fill-primary text-primary"
                                  : "size-4 text-muted-foreground/40"
                              }
                            />
                          ))}
                          <Badge variant="secondary">{review.source}</Badge>
                          {review.may_quote ? <Badge>quotable</Badge> : null}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                        {review.message ? (
                          <p className="whitespace-pre-wrap text-sm">
                            {review.message}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </AppShell>
  );
}
