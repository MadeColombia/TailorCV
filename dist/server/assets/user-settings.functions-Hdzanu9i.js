import { t as createServerFn } from "./createServerFn-BFFE07zL.js";
import { o as createSsrRpc } from "./app-shell-bjwPVDLq.js";
import { t as requireSupabaseAuth } from "./auth-middleware-ZGAJzz7F.js";
//#region src/lib/user-settings.functions.ts
/** Read the caller's preferences (creating nothing — defaults are virtual). */
var getUserSettings = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("8f4f889997e8ec556e3e42ccefde4ee0736b76bf2f84c188e50b5136eea7e3b8"));
/** Persist a full settings object (the client always sends the merged state). */
var updateUserSettings = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("999f53238c1f2363f7601b7bc8fc1599eb23d53cc2a335a228cf231e46dd59c1"));
/**
* Apply the retention setting: when the saved context has not been touched for
* longer than the chosen window, erase it. Runs whenever settings are read by
* the app, so no scheduler is required.
*/
var enforceContextRetention = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("29f0ee964d4e602487b118562d64a01783924290d33af7424841263c6149077c"));
/**
* Full account export as a zip. Sensitive enough that we require a session
* that has passed two-factor authentication (AAL2) — a stolen password alone
* can never pull the whole archive.
*/
var exportAccountArchive = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("f527afc0403cdbb78590da889fb40cf02eda91d267d3c35e884d0dcde00a9330"));
//#endregion
export { updateUserSettings as i, exportAccountArchive as n, getUserSettings as r, enforceContextRetention as t };
