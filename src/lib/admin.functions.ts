import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** The permanent owner account. Always admin; its role can never be revoked. */
const MASTER_ADMIN_EMAIL = "monnameestethan@gmail.com";

function isMasterEmail(email?: string | null) {
  return (email ?? "").trim().toLowerCase() === MASTER_ADMIN_EMAIL;
}

/**
 * Ensures the master account always holds the admin role, even if it signed up
 * after the role table was seeded. Returns true when the caller is the master.
 */
async function ensureMasterAdmin(context: { userId: string; claims: any }) {
  if (!isMasterEmail(context.claims?.email)) return false;
  const { supabaseAdmin } =
    await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: context.userId, role: "admin" } as never, {
      onConflict: "user_id,role",
    });
  return true;
}

/** Is the caller an admin? Answered through the caller's own RLS-scoped client. */
export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const isMaster = await ensureMasterAdmin(context as never);
    if (isMaster) return { isAdmin: true, isMaster: true };
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: data === true, isMaster: false };
  });

async function assertAdmin(context: {
  supabase: any;
  userId: string;
  claims?: any;
}) {
  if (isMasterEmail(context.claims?.email)) {
    await ensureMasterAdmin(context as never);
    return;
  }
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (data !== true) throw new Error("Forbidden");
}

/** Usage, signups, issues and reviews for the admin dashboard. */
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");

    const since = (days: number) =>
      new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const [usageRows, issues, reviews, applications, roles] = await Promise.all(
      [
        supabaseAdmin
          .from("ai_usage")
          .select(
            "feature, total_tokens, prompt_tokens, completion_tokens, created_at, user_id",
          )
          .gte("created_at", since(30))
          .order("created_at", { ascending: false })
          .limit(5000),
        supabaseAdmin
          .from("issue_reports")
          .select(
            "id, user_id, message, route, user_agent, status, created_at, screenshot_path, client_info",
          )

          .order("created_at", { ascending: false })
          .limit(200),
        supabaseAdmin
          .from("feedback_reviews")
          .select(
            "id, user_id, rating, message, source, may_quote, created_at, application_id",
          )
          .order("created_at", { ascending: false })
          .limit(200),
        supabaseAdmin
          .from("applications")
          .select("id, created_at, stage")
          .limit(5000),
        supabaseAdmin.from("user_roles").select("user_id, role"),
      ],
    );

    const rows = (usageRows.data ?? []) as Array<{
      feature: string;
      total_tokens: number;
      created_at: string;
      user_id: string | null;
    }>;

    const sumSince = (days: number) => {
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      return rows
        .filter((row) => Date.parse(row.created_at) >= cutoff)
        .reduce((total, row) => total + (row.total_tokens ?? 0), 0);
    };

    const byFeature: Record<string, number> = {};
    for (const row of rows) {
      byFeature[row.feature] =
        (byFeature[row.feature] ?? 0) + (row.total_tokens ?? 0);
    }
    const byUser: Record<string, number> = {};
    for (const row of rows) {
      if (!row.user_id) continue;
      byUser[row.user_id] =
        (byUser[row.user_id] ?? 0) + (row.total_tokens ?? 0);
    }

    const { data: userList } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    const adminIds = new Set(
      ((roles.data ?? []) as Array<{ user_id: string; role: string }>)
        .filter((row) => row.role === "admin")
        .map((row) => row.user_id),
    );
    const apps = (applications.data ?? []) as Array<{
      created_at: string;
      stage: string;
    }>;

    const users = (userList?.users ?? []).map((user) => ({
      id: user.id,
      email: user.email ?? "",
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
      isAdmin: adminIds.has(user.id) || isMasterEmail(user.email),
      isMaster: isMasterEmail(user.email),
      tokens: byUser[user.id] ?? 0,
    }));

    const signupsLast30 = users.filter(
      (user) =>
        Date.parse(user.createdAt) >= Date.now() - 30 * 24 * 60 * 60 * 1000,
    ).length;

    type IssueRow = {
      id: string;
      user_id: string | null;
      message: string;
      route: string | null;
      user_agent: string | null;
      status: string;
      created_at: string;
      screenshot_path: string | null;
      client_info: Record<string, string | number | boolean | null> | null;
    };
    const issueRows = (issues.data ?? []) as IssueRow[];
    const issuesWithShots = await Promise.all(
      issueRows.map(async (issue) => {
        if (!issue.screenshot_path)
          return { ...issue, screenshot_url: null as string | null };
        const { data: signed } = await supabaseAdmin.storage
          .from("issue-screenshots")
          .createSignedUrl(issue.screenshot_path, 60 * 60);
        return { ...issue, screenshot_url: signed?.signedUrl ?? null };
      }),
    );

    return {
      usage: {
        total30: sumSince(30),
        total7: sumSince(7),
        total1: sumSince(1),
        byFeature,
        calls30: rows.length,
      },
      users,
      viewerIsMaster: isMasterEmail(
        (context as never as { claims?: { email?: string } }).claims?.email,
      ),

      stats: {
        totalUsers: users.length,
        signupsLast30,
        totalApplications: apps.length,
        offers: apps.filter((app) => app.stage === "offer").length,
        interviewing: apps.filter((app) => app.stage === "interview").length,
      },
      issues: issuesWithShots,

      reviews: (reviews.data ?? []) as Array<{
        id: string;
        user_id: string | null;
        rating: number;
        message: string;
        source: string;
        may_quote: boolean;
        created_at: string;
        application_id: string | null;
      }>,
    };
  });

/** Promote or demote another account. Admins may not demote themselves. */
export const setAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; isAdmin: boolean }) => input)
  .handler(async ({ data, context }) => {
    if (
      !isMasterEmail(
        (context as never as { claims?: { email?: string } }).claims?.email,
      )
    ) {
      throw new Error("Only the master admin can change admin access.");
    }
    if (data.userId === context.userId) {
      throw new Error("The master admin role cannot be changed.");
    }
    const { supabaseAdmin } =
      await import("@/integrations/supabase/client.server");
    const { data: target } = await supabaseAdmin.auth.admin.getUserById(
      data.userId,
    );
    if (isMasterEmail(target?.user?.email)) {
      throw new Error("The master admin role cannot be changed.");
    }
    if (data.isAdmin) {
      const { error } = await supabaseAdmin

        .from("user_roles")
        .upsert({ user_id: data.userId, role: "admin" } as never, {
          onConflict: "user_id,role",
        });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", "admin");
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/** Move an issue through new → in_progress → resolved. */
export const setIssueStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const status = ["new", "in_progress", "resolved"].includes(data.status)
      ? data.status
      : "new";
    const { error } = await context.supabase
      .from("issue_reports")
      .update({ status } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, status };
  });
