import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { r as cn } from "./button-DyZVOtWw.mjs";
import { S as LoaderCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/spinner-iFQhnBJc.js
var import_jsx_runtime = require_jsx_runtime();
function Spinner({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
		role: "status",
		"aria-label": "Loading",
		className: cn("size-4 animate-spin", className),
		...props
	});
}
//#endregion
export { Spinner as t };
