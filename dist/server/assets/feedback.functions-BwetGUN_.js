import { t as createServerFn } from "./createServerFn-BFFE07zL.js";
import { t as createServerRpc } from "./createServerRpc-MBa5GZ-L.js";
import { t as requireSupabaseAuth } from "./auth-middleware-ZGAJzz7F.js";
//#region src/lib/feedback.functions.ts?tss-serverfn-split
/** Sticky "Report an issue" button. */
var submitIssue_createServerFn_handler = createServerRpc({
	id: "104a666e36aedd4a8b20c788963037e4749599095d73b0d9d68fae0979c2dda7",
	name: "submitIssue",
	filename: "src/lib/feedback.functions.ts"
}, (opts) => submitIssue.__executeServer(opts));
var submitIssue = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(submitIssue_createServerFn_handler, async ({ data, context }) => {
	const message = data.message.trim().slice(0, 4e3);
	if (message.length < 5) throw new Error("Tell us a little more about what went wrong.");
	const screenshotPath = data.screenshotPath && data.screenshotPath.startsWith(`${context.userId}/`) ? data.screenshotPath.slice(0, 300) : null;
	const { error } = await context.supabase.from("issue_reports").insert({
		user_id: context.userId,
		message,
		route: (data.route ?? "").slice(0, 300),
		user_agent: (data.userAgent ?? "").slice(0, 300),
		screenshot_path: screenshotPath,
		client_info: data.clientInfo ?? null
	});
	if (error) throw new Error(error.message);
	return { ok: true };
});
var submitReview_createServerFn_handler = createServerRpc({
	id: "40ee1b47d52a3b4fb0cf444dc986217be844c2a1f4d7390aa15116d8416d4193",
	name: "submitReview",
	filename: "src/lib/feedback.functions.ts"
}, (opts) => submitReview.__executeServer(opts));
var submitReview = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(submitReview_createServerFn_handler, async ({ data, context }) => {
	const rating = Math.min(5, Math.max(1, Math.round(data.rating)));
	const { error } = await context.supabase.from("feedback_reviews").insert({
		user_id: context.userId,
		rating,
		message: (data.message ?? "").trim().slice(0, 4e3),
		source: data.source === "hired" ? "hired" : "general",
		application_id: data.applicationId ?? null,
		may_quote: data.mayQuote ?? false
	});
	if (error) throw new Error(error.message);
	return { ok: true };
});
var listMyReviews_createServerFn_handler = createServerRpc({
	id: "8c97463d1a886f6139c38d47478f071064102ae25938aa46ef1888296c1446fc",
	name: "listMyReviews",
	filename: "src/lib/feedback.functions.ts"
}, (opts) => listMyReviews.__executeServer(opts));
var listMyReviews = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listMyReviews_createServerFn_handler, async ({ context }) => {
	const { data } = await context.supabase.from("feedback_reviews").select("id, rating, source, application_id, created_at").eq("user_id", context.userId).order("created_at", { ascending: false });
	return data ?? [];
});
//#endregion
export { listMyReviews_createServerFn_handler, submitIssue_createServerFn_handler, submitReview_createServerFn_handler };
