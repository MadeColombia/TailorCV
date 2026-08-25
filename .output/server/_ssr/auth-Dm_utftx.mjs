import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-Bxc8_G9k.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { t as Button } from "./button-DyZVOtWw.mjs";
import { n as Label, t as Input } from "./input-Cl4UdChK.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as createLovableAuth } from "../_libs/lovable.dev__cloud-auth-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-Dm_utftx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var lovableAuth = createLovableAuth();
var lovable = { auth: { signInWithOAuth: async (provider, opts) => {
	const result = await lovableAuth.signInWithOAuth(provider, {
		...opts,
		extraParams: { ...opts?.extraParams }
	});
	if (result.redirected) return result;
	if (result.error) return result;
	try {
		await supabase.auth.setSession(result.tokens);
	} catch (e) {
		return { error: e instanceof Error ? e : new Error(String(e)) };
	}
	return result;
} } };
function AuthPage() {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [sent, setSent] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) navigate({
				to: "/dashboard",
				replace: true
			});
		});
	}, [navigate]);
	const handleSubmit = async (event) => {
		event.preventDefault();
		setLoading(true);
		try {
			if (mode === "signup") {
				const { data, error } = await supabase.auth.signUp({
					email,
					password,
					options: { emailRedirectTo: window.location.origin }
				});
				if (error) throw error;
				if (!data.session) {
					setSent(true);
					return;
				}
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (error) throw error;
			}
			navigate({
				to: "/dashboard",
				replace: true
			});
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong");
		} finally {
			setLoading(false);
		}
	};
	const handleOAuth = async (provider) => {
		setLoading(true);
		const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
		if (result.error) {
			setLoading(false);
			toast.error(result.error.message ?? `${provider} sign-in failed`);
			return;
		}
		if (result.redirected) return;
		navigate({
			to: "/dashboard",
			replace: true
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grain flex min-h-screen items-center justify-center bg-background px-6 py-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "font-display text-2xl font-bold",
					children: ["Tailor", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-primary",
						children: "CV"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: mode === "signin" ? "Welcome back." : "Create your account to get started."
				}),
				sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground",
					children: [
						"Check your inbox — we sent a confirmation link to ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: email }),
						"."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							className: "w-full",
							onClick: () => handleOAuth("google"),
							disabled: loading,
							children: "Continue with Google"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							className: "w-full",
							onClick: () => handleOAuth("apple"),
							disabled: loading,
							children: "Continue with Apple"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-6 flex items-center gap-3 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
							"or",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSubmit,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "email",
									children: "Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "email",
									type: "email",
									required: true,
									value: email,
									onChange: (event) => setEmail(event.target.value),
									placeholder: "you@example.com"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "password",
									children: "Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "password",
									type: "password",
									required: true,
									minLength: 6,
									value: password,
									onChange: (event) => setPassword(event.target.value),
									placeholder: "••••••••"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "w-full",
								disabled: loading,
								children: mode === "signin" ? "Sign in" : "Create account"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-6 w-full text-center text-xs text-muted-foreground hover:text-foreground",
						onClick: () => setMode(mode === "signin" ? "signup" : "signin"),
						children: mode === "signin" ? "No account yet? Sign up" : "Already have an account? Sign in"
					})
				] })
			]
		})
	});
}
//#endregion
export { AuthPage as component };
