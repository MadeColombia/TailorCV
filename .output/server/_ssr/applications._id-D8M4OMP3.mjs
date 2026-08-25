import { j as redirect, m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/applications._id-D8M4OMP3.js
var KICKOFF_MESSAGE = "__kickoff__";
function chatMessageText(message) {
	return message.parts.map((part) => part.text).join("").trim();
}
function createChatMessage(role, text) {
	return {
		id: crypto.randomUUID(),
		role,
		parts: [{
			type: "text",
			text
		}]
	};
}
var $$splitComponentImporter = () => import("./applications._id-D5EHYkwD.mjs");
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var Route = createFileRoute("/_authenticated/applications/$id")({
	beforeLoad: ({ params }) => {
		if (!UUID_RE.test(params.id)) throw redirect({ to: "/dashboard" });
	},
	head: () => ({ meta: [
		{ title: "Tailoring workspace — TailorCV" },
		{
			name: "description",
			content: "Tailor your CV to this job offer, answer the AI interview and export the PDF."
		},
		{
			property: "og:title",
			content: "Tailoring workspace — TailorCV"
		},
		{
			property: "og:description",
			content: "Tailored CV, ATS match score and cover letter."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { createChatMessage as i, Route as n, chatMessageText as r, KICKOFF_MESSAGE as t };
