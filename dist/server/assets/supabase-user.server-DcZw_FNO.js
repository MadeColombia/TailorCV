import { createClient } from "@supabase/supabase-js";
//#region src/lib/supabase-user.server.ts
/**
* Build a Supabase client that acts as the caller (row-level security applies)
* from a raw bearer token. Used by public server routes that must authenticate
* the caller themselves. Returns null when the token is not a valid session.
*/
async function createUserScopedClient(token) {
	const url = process.env["SUPABASE_URL"];
	const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
	if (!url || !key) throw new Error("Supabase is not configured.");
	const supabase = createClient(url, key, {
		global: {
			headers: { Authorization: `Bearer ${token}` },
			fetch: (input, init) => {
				const headers = new Headers(init?.headers);
				if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
				headers.set("apikey", key);
				headers.set("Authorization", `Bearer ${token}`);
				return fetch(input, {
					...init,
					headers
				});
			}
		},
		auth: {
			persistSession: false,
			autoRefreshToken: false,
			storage: void 0
		}
	});
	const { data, error } = await supabase.auth.getClaims(token);
	const userId = data?.claims?.sub;
	if (error || !userId) return null;
	return {
		supabase,
		userId
	};
}
//#endregion
export { createUserScopedClient };
