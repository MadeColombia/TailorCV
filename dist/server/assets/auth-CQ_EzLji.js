import { t as supabase } from "./client-CWFfskMz.js";
import { t as Button } from "./button-DyZVOtWw.js";
import { n as Label, t as Input } from "./input-Cl4UdChK.js";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
//#region src/routes/auth.tsx?tsr-split=component
function AuthPage() {
	const navigate = useNavigate();
	const [mode, setMode] = useState("signin");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);
	useEffect(() => {
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
		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: { redirectTo: window.location.origin + "/dashboard" }
		});
		if (error) {
			setLoading(false);
			toast.error(error.message ?? `${provider} sign-in failed`);
			return;
		}
	};
	return /* @__PURE__ */ jsx("main", {
		className: "grain flex min-h-screen items-center justify-center bg-background px-6 py-12",
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-sm",
			children: [
				/* @__PURE__ */ jsxs("h1", {
					className: "font-display text-2xl font-bold",
					children: ["Tailor", /* @__PURE__ */ jsx("span", {
						className: "text-primary",
						children: "CV"
					})]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: mode === "signin" ? "Welcome back." : "Create your account to get started."
				}),
				sent ? /* @__PURE__ */ jsxs("div", {
					className: "mt-8 rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground",
					children: [
						"Check your inbox — we sent a confirmation link to ",
						/* @__PURE__ */ jsx("strong", { children: email }),
						"."
					]
				}) : /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsxs("div", {
						className: "mt-8 space-y-3",
						children: [/* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "outline",
							className: "w-full",
							onClick: () => handleOAuth("google"),
							disabled: loading,
							children: "Continue with Google"
						}), /* @__PURE__ */ jsx(Button, {
							type: "button",
							variant: "outline",
							className: "w-full",
							onClick: () => handleOAuth("apple"),
							disabled: loading,
							children: "Continue with Apple"
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "my-6 flex items-center gap-3 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-border" }),
							"or",
							/* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-border" })
						]
					}),
					/* @__PURE__ */ jsxs("form", {
						onSubmit: handleSubmit,
						className: "space-y-4",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "email",
									children: "Email"
								}), /* @__PURE__ */ jsx(Input, {
									id: "email",
									type: "email",
									required: true,
									value: email,
									onChange: (event) => setEmail(event.target.value),
									placeholder: "you@example.com"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "password",
									children: "Password"
								}), /* @__PURE__ */ jsx(Input, {
									id: "password",
									type: "password",
									required: true,
									minLength: 6,
									value: password,
									onChange: (event) => setPassword(event.target.value),
									placeholder: "••••••••"
								})]
							}),
							/* @__PURE__ */ jsx(Button, {
								type: "submit",
								className: "w-full",
								disabled: loading,
								children: mode === "signin" ? "Sign in" : "Create account"
							})
						]
					}),
					/* @__PURE__ */ jsx("button", {
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
