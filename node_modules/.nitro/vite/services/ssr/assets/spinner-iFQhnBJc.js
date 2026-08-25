import { r as cn } from "./button-DyZVOtWw.js";
import { jsx } from "react/jsx-runtime";
import { Loader2Icon } from "lucide-react";
//#region src/components/ui/spinner.tsx
function Spinner({ className, ...props }) {
	return /* @__PURE__ */ jsx(Loader2Icon, {
		role: "status",
		"aria-label": "Loading",
		className: cn("size-4 animate-spin", className),
		...props
	});
}
//#endregion
export { Spinner as t };
