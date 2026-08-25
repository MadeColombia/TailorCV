import { c as createServerFn } from "./createServerFn-BFFE07zL.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-UH_Jp6hR.mjs";
import { h as createSsrRpc } from "./app-shell-BSALpTtH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/targets.functions-BFgxQ2gl.js
var listRoleTargets = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("776c43e0170bd6a7612682a39d4c2440f47fb93e7ac9fdef9789b786b6812f60"));
var getRoleTarget = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("fdc9c5eb05b293a732e968c11638f04bcc5163dec9cee7a04cc1f4cf675ee561"));
var createRoleTarget = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("2708351e23dfe26581f9f92847af43d01489c064bdf63448df8bbbed61b9b16c"));
var updateRoleTarget = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("93ea08acf8f19745c1f9ecba03a365aeeae8d7cfb44ef65f3614ad6c8e4b3b3b"));
var deleteRoleTarget = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("48b05c8c37aa74a8eb77e39fb37a7bc7a70e4fedb4143b927034daa15c967340"));
/** Build a general, role-focused CV (not tied to one job ad) plus a readiness score. */
var generateTargetCv = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("f0c5e5f747d222292ff6c2ac789fdbb77f634e1bbaab4a93f1688758ecf25ecd"));
//#endregion
export { listRoleTargets as a, getRoleTarget as i, deleteRoleTarget as n, updateRoleTarget as o, generateTargetCv as r, createRoleTarget as t };
