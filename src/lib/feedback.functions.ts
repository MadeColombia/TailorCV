import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Sticky "Report an issue" button. */
export const submitIssue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      message: string;
      route?: string;
      userAgent?: string;
      screenshotPath?: string | null;
      clientInfo?: Record<string, unknown> | null;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const message = data.message.trim().slice(0, 4000);
    if (message.length < 5) throw new Error("Tell us a little more about what went wrong.");
    const screenshotPath =
      data.screenshotPath && data.screenshotPath.startsWith(`${context.userId}/`)
        ? data.screenshotPath.slice(0, 300)
        : null;
    const { error } = await context.supabase.from("issue_reports").insert({
      user_id: context.userId,
      message,
      route: (data.route ?? "").slice(0, 300),
      user_agent: (data.userAgent ?? "").slice(0, 300),
      screenshot_path: screenshotPath,
      client_info: data.clientInfo ?? null,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


/** Star rating + testimonial, either general or tied to a landed job. */
export const submitReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      rating: number;
      message?: string;
      source?: string;
      applicationId?: string | null;
      mayQuote?: boolean;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const rating = Math.min(5, Math.max(1, Math.round(data.rating)));
    const { error } = await context.supabase.from("feedback_reviews").insert({
      user_id: context.userId,
      rating,
      message: (data.message ?? "").trim().slice(0, 4000),
      source: data.source === "hired" ? "hired" : "general",
      application_id: data.applicationId ?? null,
      may_quote: data.mayQuote ?? false,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Has this user already left a review for this application? */
export const listMyReviews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("feedback_reviews")
      .select("id, rating, source, application_id, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return (data ?? []) as Array<{
      id: string;
      rating: number;
      source: string;
      application_id: string | null;
      created_at: string;
    }>;
  });
