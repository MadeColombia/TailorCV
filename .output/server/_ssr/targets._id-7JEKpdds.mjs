import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/targets._id-7JEKpdds.js
var $$splitComponentImporter = () => import("./targets._id-BtZ9dSeJ.mjs");
var Route = createFileRoute("/_authenticated/targets/$id")({
	head: () => ({ meta: [
		{ title: "Role target — TailorCV" },
		{
			name: "description",
			content: "Shape a general ATS CV around one role you're targeting, then download the PDF."
		},
		{
			property: "og:title",
			content: "Role target — TailorCV"
		},
		{
			property: "og:description",
			content: "A reusable, role-focused CV with a readiness score and missing keywords."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
