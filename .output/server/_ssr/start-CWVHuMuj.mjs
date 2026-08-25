import { t as createMiddleware } from "./createMiddleware-B_4t7rW1.mjs";
import { t as supabase } from "./client-Bxc8_G9k.mjs";
import { t as createCsrfMiddleware } from "./createCsrfMiddleware-jzif2P7h.mjs";
import { t as renderErrorPage } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/start-CWVHuMuj.js
function dedupeSerializationAdapters(deduped, serializationAdapters) {
	for (let i = 0, len = serializationAdapters.length; i < len; i++) {
		const current = serializationAdapters[i];
		if (!deduped.has(current)) {
			deduped.add(current);
			if (current.extends) dedupeSerializationAdapters(deduped, current.extends);
		}
	}
}
var createStart = (getOptions) => {
	return {
		getOptions: async () => {
			const options = await getOptions();
			if (options.serializationAdapters) {
				const deduped = /* @__PURE__ */ new Set();
				dedupeSerializationAdapters(deduped, options.serializationAdapters);
				options.serializationAdapters = Array.from(deduped);
			}
			return options;
		},
		createMiddleware
	};
};
var attachSupabaseAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { data } = await supabase.auth.getSession();
	const token = data.session?.access_token;
	return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
});
var errorMiddleware = createMiddleware().server(async ({ next }) => {
	try {
		return await next();
	} catch (error) {
		if (error != null && typeof error === "object" && "statusCode" in error) throw error;
		console.error(error);
		return new Response(renderErrorPage(), {
			status: 500,
			headers: { "content-type": "text/html; charset=utf-8" }
		});
	}
});
var securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
	const result = await next();
	const headers = result.response?.headers;
	if (headers) {
		headers.set("X-Content-Type-Options", "nosniff");
		headers.set("X-Frame-Options", "SAMEORIGIN");
		headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
		headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
		headers.set("Cross-Origin-Opener-Policy", "same-origin");
		if (!headers.has("cache-control")) headers.set("cache-control", "private, no-store");
	}
	return result;
});
var csrfMiddleware = createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === "serverFn" });
var startInstance = createStart(() => ({
	functionMiddleware: [attachSupabaseAuth],
	requestMiddleware: [
		errorMiddleware,
		csrfMiddleware,
		securityHeadersMiddleware
	]
}));
//#endregion
export { startInstance };
