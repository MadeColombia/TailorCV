import { t as createServerFn } from "./createServerFn-BFFE07zL.js";
import { t as createServerRpc } from "./createServerRpc-MBa5GZ-L.js";
import { t as requireSupabaseAuth } from "./auth-middleware-ZGAJzz7F.js";
//#region src/lib/admin.functions.ts?tss-serverfn-split
/** The permanent owner account. Always admin; its role can never be revoked. */
var MASTER_ADMIN_EMAIL = "monnameestethan@gmail.com";
function isMasterEmail(email) {
	return (email ?? "").trim().toLowerCase() === MASTER_ADMIN_EMAIL;
}
/**
* Ensures the master account always holds the admin role, even if it signed up
* after the role table was seeded. Returns true when the caller is the master.
*/
async function ensureMasterAdmin(context) {
	if (!isMasterEmail(context.claims?.email)) return false;
	const { supabaseAdmin } = await import("./client.server-tihDb1Az.js");
	await supabaseAdmin.from("user_roles").upsert({
		user_id: context.userId,
		role: "admin"
	}, { onConflict: "user_id,role" });
	return true;
}
/** Is the caller an admin? Answered through the caller's own RLS-scoped client. */
var getAdminStatus_createServerFn_handler = createServerRpc({
	id: "77265b60422ccd3fca55e66689775b583f1f9a8f66bbea850c2c67d32fad8080",
	name: "getAdminStatus",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminStatus.__executeServer(opts));
var getAdminStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getAdminStatus_createServerFn_handler, async ({ context }) => {
	if (await ensureMasterAdmin(context)) return {
		isAdmin: true,
		isMaster: true
	};
	const { data } = await context.supabase.rpc("has_role", {
		_user_id: context.userId,
		_role: "admin"
	});
	return {
		isAdmin: data === true,
		isMaster: false
	};
});
async function assertAdmin(context) {
	if (isMasterEmail(context.claims?.email)) {
		await ensureMasterAdmin(context);
		return;
	}
	const { data } = await context.supabase.rpc("has_role", {
		_user_id: context.userId,
		_role: "admin"
	});
	if (data !== true) throw new Error("Forbidden");
}
/** Usage, signups, issues and reviews for the admin dashboard. */
var getAdminOverview_createServerFn_handler = createServerRpc({
	id: "98193c088815d6bbdd4155ffbad4b125116e51df7ef81d3d6aef43156e028e01",
	name: "getAdminOverview",
	filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminOverview.__executeServer(opts));
var getAdminOverview = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getAdminOverview_createServerFn_handler, async ({ context }) => {
	await assertAdmin(context);
	const { supabaseAdmin } = await import("./client.server-tihDb1Az.js");
	const since = (days) => (/* @__PURE__ */ new Date(Date.now() - days * 24 * 60 * 60 * 1e3)).toISOString();
	const [usageRows, issues, reviews, applications, roles] = await Promise.all([
		supabaseAdmin.from("ai_usage").select("feature, total_tokens, prompt_tokens, completion_tokens, created_at, user_id").gte("created_at", since(30)).order("created_at", { ascending: false }).limit(5e3),
		supabaseAdmin.from("issue_reports").select("id, user_id, message, route, user_agent, status, created_at, screenshot_path, client_info").order("created_at", { ascending: false }).limit(200),
		supabaseAdmin.from("feedback_reviews").select("id, user_id, rating, message, source, may_quote, created_at, application_id").order("created_at", { ascending: false }).limit(200),
		supabaseAdmin.from("applications").select("id, created_at, stage").limit(5e3),
		supabaseAdmin.from("user_roles").select("user_id, role")
	]);
	const rows = usageRows.data ?? [];
	const sumSince = (days) => {
		const cutoff = Date.now() - days * 24 * 60 * 60 * 1e3;
		return rows.filter((row) => Date.parse(row.created_at) >= cutoff).reduce((total, row) => total + (row.total_tokens ?? 0), 0);
	};
	const byFeature = {};
	for (const row of rows) byFeature[row.feature] = (byFeature[row.feature] ?? 0) + (row.total_tokens ?? 0);
	const byUser = {};
	for (const row of rows) {
		if (!row.user_id) continue;
		byUser[row.user_id] = (byUser[row.user_id] ?? 0) + (row.total_tokens ?? 0);
	}
	const { data: userList } = await supabaseAdmin.auth.admin.listUsers({
		page: 1,
		perPage: 200
	});
	const adminIds = new Set((roles.data ?? []).filter((row) => row.role === "admin").map((row) => row.user_id));
	const apps = applications.data ?? [];
	const users = (userList?.users ?? []).map((user) => ({
		id: user.id,
		email: user.email ?? "",
		createdAt: user.created_at,
		lastSignInAt: user.last_sign_in_at ?? null,
		isAdmin: adminIds.has(user.id) || isMasterEmail(user.email),
		isMaster: isMasterEmail(user.email),
		tokens: byUser[user.id] ?? 0
	}));
	const signupsLast30 = users.filter((user) => Date.parse(user.createdAt) >= Date.now() - 2592e6).length;
	const issueRows = issues.data ?? [];
	const issuesWithShots = await Promise.all(issueRows.map(async (issue) => {
		if (!issue.screenshot_path) return {
			...issue,
			screenshot_url: null
		};
		const { data: signed } = await supabaseAdmin.storage.from("issue-screenshots").createSignedUrl(issue.screenshot_path, 3600);
		return {
			...issue,
			screenshot_url: signed?.signedUrl ?? null
		};
	}));
	return {
		usage: {
			total30: sumSince(30),
			total7: sumSince(7),
			total1: sumSince(1),
			byFeature,
			calls30: rows.length
		},
		users,
		viewerIsMaster: isMasterEmail(context.claims?.email),
		stats: {
			totalUsers: users.length,
			signupsLast30,
			totalApplications: apps.length,
			offers: apps.filter((app) => app.stage === "offer").length,
			interviewing: apps.filter((app) => app.stage === "interview").length
		},
		issues: issuesWithShots,
		reviews: reviews.data ?? []
	};
});
var setAdminRole_createServerFn_handler = createServerRpc({
	id: "187914f9251ed9244b70b0dd4cad9ddd430053b8a038071b8d1807b7fc91e2e2",
	name: "setAdminRole",
	filename: "src/lib/admin.functions.ts"
}, (opts) => setAdminRole.__executeServer(opts));
var setAdminRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(setAdminRole_createServerFn_handler, async ({ data, context }) => {
	if (!isMasterEmail(context.claims?.email)) throw new Error("Only the master admin can change admin access.");
	if (data.userId === context.userId) throw new Error("The master admin role cannot be changed.");
	const { supabaseAdmin } = await import("./client.server-tihDb1Az.js");
	const { data: target } = await supabaseAdmin.auth.admin.getUserById(data.userId);
	if (isMasterEmail(target?.user?.email)) throw new Error("The master admin role cannot be changed.");
	if (data.isAdmin) {
		const { error } = await supabaseAdmin.from("user_roles").upsert({
			user_id: data.userId,
			role: "admin"
		}, { onConflict: "user_id,role" });
		if (error) throw new Error(error.message);
	} else {
		const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
		if (error) throw new Error(error.message);
	}
	return { ok: true };
});
var setIssueStatus_createServerFn_handler = createServerRpc({
	id: "1fd219f3a3f4c9a53b82097eb48d01c23516a99e48e1e22ee5dced54e754333b",
	name: "setIssueStatus",
	filename: "src/lib/admin.functions.ts"
}, (opts) => setIssueStatus.__executeServer(opts));
var setIssueStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(setIssueStatus_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context);
	const status = [
		"new",
		"in_progress",
		"resolved"
	].includes(data.status) ? data.status : "new";
	const { error } = await context.supabase.from("issue_reports").update({ status }).eq("id", data.id);
	if (error) throw new Error(error.message);
	return {
		ok: true,
		status
	};
});
//#endregion
export { getAdminOverview_createServerFn_handler, getAdminStatus_createServerFn_handler, setAdminRole_createServerFn_handler, setIssueStatus_createServerFn_handler };
