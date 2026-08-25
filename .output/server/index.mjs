globalThis.__nitro_main__ = import.meta.url;
import { n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/QueryClientProvider-9aN6djbH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ce1f-33W20HYwzM4XAarwkbvZqlZwKwo\"",
		"mtime": "2026-08-24T00:26:49.518Z",
		"size": 52767,
		"path": "../public/assets/QueryClientProvider-9aN6djbH.js"
	},
	"/assets/admin-Gvri_YfZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"255a-QhuxKmRStOlLd4xt7FCNRBdLYG0\"",
		"mtime": "2026-08-24T00:26:49.518Z",
		"size": 9562,
		"path": "../public/assets/admin-Gvri_YfZ.js"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-08-24T00:26:50.121Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-08-24T00:26:50.122Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/assets/app-shell-ByuvtFLF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"161e6-Tjj4ipSvuaplFuPxV90Drwx5ey4\"",
		"mtime": "2026-08-24T00:26:49.518Z",
		"size": 90598,
		"path": "../public/assets/app-shell-ByuvtFLF.js"
	},
	"/assets/badge-CojIjJP5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32a-xoYMnVuSHxTzB4XBG00be3d5fdE\"",
		"mtime": "2026-08-24T00:26:49.518Z",
		"size": 810,
		"path": "../public/assets/badge-CojIjJP5.js"
	},
	"/assets/applications._id-DK79OflF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c45e-VEfOuPo+/Y44dmhSUgg+ORfC07I\"",
		"mtime": "2026-08-24T00:26:49.518Z",
		"size": 181342,
		"path": "../public/assets/applications._id-DK79OflF.js"
	},
	"/assets/createLucideIcon-BksDBjSU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4d5-cqcHJ5UlDUV/D89lXdmxTIQxpw8\"",
		"mtime": "2026-08-24T00:26:49.518Z",
		"size": 1237,
		"path": "../public/assets/createLucideIcon-BksDBjSU.js"
	},
	"/assets/button-v_DYP3KV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7d21-qGhzmVT9n7kvK3OF9BdqjYVu7D4\"",
		"mtime": "2026-08-24T00:26:49.518Z",
		"size": 32033,
		"path": "../public/assets/button-v_DYP3KV.js"
	},
	"/assets/download-DE35piIL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e8-QMAppZRHLXcLpyYKg6wZplPdvwc\"",
		"mtime": "2026-08-24T00:26:49.519Z",
		"size": 232,
		"path": "../public/assets/download-DE35piIL.js"
	},
	"/assets/dashboard-BeHdaWrP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4a31-m42NNLi7tjBdsz69FlfprK/Q5Dk\"",
		"mtime": "2026-08-24T00:26:49.518Z",
		"size": 18993,
		"path": "../public/assets/dashboard-BeHdaWrP.js"
	},
	"/assets/auth-xqhok2T-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c15-Gb5HYDLpcFvPnhhYzuNVyNFGkRs\"",
		"mtime": "2026-08-24T00:26:49.518Z",
		"size": 7189,
		"path": "../public/assets/auth-xqhok2T-.js"
	},
	"/assets/file-text-LOsf_Reo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"181-2AHLq+NAMM46bHLO9g3yemGn2Eo\"",
		"mtime": "2026-08-24T00:26:49.519Z",
		"size": 385,
		"path": "../public/assets/file-text-LOsf_Reo.js"
	},
	"/assets/dist-O8QVus3a.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3bcf5-rTMhkmOqYlXCzXXrfii+EoTMDTQ\"",
		"mtime": "2026-08-24T00:26:49.519Z",
		"size": 244981,
		"path": "../public/assets/dist-O8QVus3a.js"
	},
	"/assets/html2canvas-2iVgEZOu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"30b46-lGMk8Ugv2W6R9y5Kt3QKrvN8n7Q\"",
		"mtime": "2026-08-24T00:26:49.519Z",
		"size": 199494,
		"path": "../public/assets/html2canvas-2iVgEZOu.js"
	},
	"/assets/index.es-BvcQifOM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24f83-srb/CwI1WYqynpHCOBCC9Gc5kyY\"",
		"mtime": "2026-08-24T00:26:49.519Z",
		"size": 151427,
		"path": "../public/assets/index.es-BvcQifOM.js"
	},
	"/assets/input-Dv2LqQxF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6ef-6Gz2yGfy4xlz+f3qm+1Rzx/ej+E\"",
		"mtime": "2026-08-24T00:26:49.519Z",
		"size": 1775,
		"path": "../public/assets/input-Dv2LqQxF.js"
	},
	"/assets/languages-DbnIrsWb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ac-+eWMEZT9wZ9VrBX2EyjRixBiYfU\"",
		"mtime": "2026-08-24T00:26:49.519Z",
		"size": 428,
		"path": "../public/assets/languages-DbnIrsWb.js"
	},
	"/assets/link-BKigpQOU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"114a-u3VN6/zamHiK0qhbiMRPtyTvDW4\"",
		"mtime": "2026-08-24T00:26:49.519Z",
		"size": 4426,
		"path": "../public/assets/link-BKigpQOU.js"
	},
	"/assets/lazyRouteComponent-BS_hzxcB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1057-aLkiK95oAiBRk8dvTA4SeXvL4Qg\"",
		"mtime": "2026-08-24T00:26:49.519Z",
		"size": 4183,
		"path": "../public/assets/lazyRouteComponent-BS_hzxcB.js"
	},
	"/assets/matchContext-tnXa787R.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"462-mZEOMeA8KzFCbSvsJWD+QgjnutM\"",
		"mtime": "2026-08-24T00:26:49.519Z",
		"size": 1122,
		"path": "../public/assets/matchContext-tnXa787R.js"
	},
	"/assets/index-DM0t2Z7r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4016a-l1OSSye4kelFb6FRcsKtwZ+S1Qw\"",
		"mtime": "2026-08-24T00:26:49.517Z",
		"size": 262506,
		"path": "../public/assets/index-DM0t2Z7r.js"
	},
	"/assets/notifications-DbjYXHM5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"625-DXQtdJLb5ao2I6xE2wYHKhhTB+E\"",
		"mtime": "2026-08-24T00:26:49.519Z",
		"size": 1573,
		"path": "../public/assets/notifications-DbjYXHM5.js"
	},
	"/assets/pipeline-DMoVckqj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aa9-fpQlSEUXkn8Zflq54E0lz7qz9ao\"",
		"mtime": "2026-08-24T00:26:49.519Z",
		"size": 6825,
		"path": "../public/assets/pipeline-DMoVckqj.js"
	},
	"/assets/plus-CPcz5-iT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"99-SJSJIKY98nEBdhMCOOOkcfvd/Gw\"",
		"mtime": "2026-08-24T00:26:49.520Z",
		"size": 153,
		"path": "../public/assets/plus-CPcz5-iT.js"
	},
	"/assets/purify.es-BlKBIatO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"69f6-IlnHy/Q8qpJUYz6AbGb2n7vkhik\"",
		"mtime": "2026-08-24T00:26:49.520Z",
		"size": 27126,
		"path": "../public/assets/purify.es-BlKBIatO.js"
	},
	"/assets/profile-Bafnbr2-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6370-16g2zHw/sPKvNv0BrzSoRrs3gFQ\"",
		"mtime": "2026-08-24T00:26:49.520Z",
		"size": 25456,
		"path": "../public/assets/profile-Bafnbr2-.js"
	},
	"/assets/react-dom-BXluHPW7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e04-lKr1vjgV1R5TMksHrQ8ip11UowE\"",
		"mtime": "2026-08-24T00:26:49.520Z",
		"size": 3588,
		"path": "../public/assets/react-dom-BXluHPW7.js"
	},
	"/assets/rolldown-runtime-B0Z9INg1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"385-vn6fLblvytQt1hv6CJ89eGYvXrc\"",
		"mtime": "2026-08-24T00:26:49.520Z",
		"size": 901,
		"path": "../public/assets/rolldown-runtime-B0Z9INg1.js"
	},
	"/assets/routes-OL1p2nbi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f05-/jIYblefTUc30QjnNGWm3+Cr8bM\"",
		"mtime": "2026-08-24T00:26:49.520Z",
		"size": 3845,
		"path": "../public/assets/routes-OL1p2nbi.js"
	},
	"/assets/route-D5JR1YPG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8b-L1qIlT2GLqY8dCsogilSiS6OQHg\"",
		"mtime": "2026-08-24T00:26:49.520Z",
		"size": 139,
		"path": "../public/assets/route-D5JR1YPG.js"
	},
	"/assets/select-NGmf10Fy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c95d-cBGxshZSu1X/0NO6dIJlzHhanoY\"",
		"mtime": "2026-08-24T00:26:49.520Z",
		"size": 51549,
		"path": "../public/assets/select-NGmf10Fy.js"
	},
	"/assets/root-DLTE-HSj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20-vSYConOtSP6ciwr9zKsPixNwWmc\"",
		"mtime": "2026-08-24T00:26:49.520Z",
		"size": 32,
		"path": "../public/assets/root-DLTE-HSj.js"
	},
	"/assets/shield-check-DWS1QkKE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"140-vz1sh/n0AxntamJpWAngUq/id/k\"",
		"mtime": "2026-08-24T00:26:49.520Z",
		"size": 320,
		"path": "../public/assets/shield-check-DWS1QkKE.js"
	},
	"/assets/spinner-DkCGo3HE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16e-9/fsVJoOpeKqVp/N2FAcH7iBFHM\"",
		"mtime": "2026-08-24T00:26:49.520Z",
		"size": 366,
		"path": "../public/assets/spinner-DkCGo3HE.js"
	},
	"/assets/settings-D1SViOtZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"714a-8OM1L8gnWBGo7UGbhSwpVRo/GOM\"",
		"mtime": "2026-08-24T00:26:49.520Z",
		"size": 29002,
		"path": "../public/assets/settings-D1SViOtZ.js"
	},
	"/assets/target-DILh6VPG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e2-J3w1pm45Z3V/Yff0AsRoANZURdw\"",
		"mtime": "2026-08-24T00:26:49.520Z",
		"size": 226,
		"path": "../public/assets/target-DILh6VPG.js"
	},
	"/assets/targets.functions-C4-Kd8h3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34d-J6orftbYgKLwKnOD6VMJpycrP4A\"",
		"mtime": "2026-08-24T00:26:49.521Z",
		"size": 845,
		"path": "../public/assets/targets.functions-C4-Kd8h3.js"
	},
	"/assets/targets.index-BUyQ3CgW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1266-QV0jpNEaFNbyRWcM4yED/8QKKLw\"",
		"mtime": "2026-08-24T00:26:49.521Z",
		"size": 4710,
		"path": "../public/assets/targets.index-BUyQ3CgW.js"
	},
	"/assets/styles-KM51XNWG.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"17033-KTCwvrClReFBKTrkBxURVccSQJA\"",
		"mtime": "2026-08-24T00:26:49.522Z",
		"size": 94259,
		"path": "../public/assets/styles-KM51XNWG.css"
	},
	"/assets/targets._id-B7erFYpN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24a2-OApenSfq6tN/Kp41L/jgbmFS9TA\"",
		"mtime": "2026-08-24T00:26:49.521Z",
		"size": 9378,
		"path": "../public/assets/targets._id-B7erFYpN.js"
	},
	"/assets/typeof-B5XbjTb1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f-yPXEOGyFHb1Ws7OoWyWNEEBz4mQ\"",
		"mtime": "2026-08-24T00:26:49.521Z",
		"size": 271,
		"path": "../public/assets/typeof-B5XbjTb1.js"
	},
	"/assets/trash-2-BVgGUIkQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"148-0NTmSgoXjN6ld/tUIb9ZyRPlP18\"",
		"mtime": "2026-08-24T00:26:49.521Z",
		"size": 328,
		"path": "../public/assets/trash-2-BVgGUIkQ.js"
	},
	"/assets/template.functions-dPZXU7ok.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"62988-atj7HtuckbaHLJpWmx9Xt/zr0UE\"",
		"mtime": "2026-08-24T00:26:49.521Z",
		"size": 403848,
		"path": "../public/assets/template.functions-dPZXU7ok.js"
	},
	"/assets/useRouter-DFeFks9M.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f38-SGsT9fpA6pqZiBXvyE2Wj+7wyBc\"",
		"mtime": "2026-08-24T00:26:49.521Z",
		"size": 7992,
		"path": "../public/assets/useRouter-DFeFks9M.js"
	},
	"/assets/triangle-alert-BpdGiKtL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"244-6JczG2kmt8GoLnnut2TSLb2EBic\"",
		"mtime": "2026-08-24T00:26:49.521Z",
		"size": 580,
		"path": "../public/assets/triangle-alert-BpdGiKtL.js"
	},
	"/assets/useStore-Du8dLuEb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ab8-5zLKA+askM6FebsLs09VYVAlXqo\"",
		"mtime": "2026-08-24T00:26:49.521Z",
		"size": 19128,
		"path": "../public/assets/useStore-Du8dLuEb.js"
	},
	"/assets/user-round-BQvSiPwk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b6-243M3qwVdhotZTl0UQqJ0kNrdCU\"",
		"mtime": "2026-08-24T00:26:49.521Z",
		"size": 182,
		"path": "../public/assets/user-round-BQvSiPwk.js"
	},
	"/assets/user-settings.functions-Cfua-KZO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"257-meXL5AxssfwM2WdtcytQDFp8Sl8\"",
		"mtime": "2026-08-24T00:26:49.521Z",
		"size": 599,
		"path": "../public/assets/user-settings.functions-Cfua-KZO.js"
	},
	"/assets/wand-sparkles-BqEdol7_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"271-15+dDHP9Xkj57G82wbuUsp15GKA\"",
		"mtime": "2026-08-24T00:26:49.521Z",
		"size": 625,
		"path": "../public/assets/wand-sparkles-BqEdol7_.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_Keiv6g = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_Keiv6g
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
