import { S as useServerFn, _ as DialogHeader, a as submitReview, c as Textarea, d as TabsList, f as TabsTrigger, g as DialogFooter, h as DialogDescription, l as Tabs, m as DialogContent, p as Dialog, t as AppShell, u as TabsContent, v as DialogTitle } from "./app-shell-bjwPVDLq.js";
import { d as normalizeCv, f as normalizeLanguage, m as sectionLabels, p as normalizeMatch, t as LANGUAGES, u as languageNative } from "./cv-DMqvWRdG.js";
import { n as normalizeInterviewPrep, r as prepToPlainText, t as CATEGORY_LABELS } from "./interview-prep-CpEj5H5V.js";
import { isEmptySummary, normalizeOfferSummary } from "./offer-summary-DtdNVDc1.js";
import { a as pipelineHealth, l as toneTextClass, s as stageLabel } from "./pipeline-B78LRwYF.js";
import { n as DEFAULT_TEMPLATE } from "./cv-template-6N3GXnPx.js";
import { c as normalizeTone, t as COVER_LETTER_TONES } from "./user-settings-BzcLPF0g.js";
import { t as supabase } from "./client-CWFfskMz.js";
import { i as createChatMessage, n as KICKOFF_MESSAGE, r as chatMessageText, t as Route } from "./applications._id-DKukC4Dz.js";
import { r as cn, t as Button } from "./button-DyZVOtWw.js";
import { n as Label, t as Input } from "./input-Cl4UdChK.js";
import { t as Badge } from "./badge-Bzug_clR.js";
import { t as Spinner } from "./spinner-iFQhnBJc.js";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Bub4Crhq.js";
import { _ as updateApplication, a as generateInterviewPrep, f as saveChatTurn, g as tailorCv, h as summariseOffer, i as generateCoverLetter, l as markFollowedUp, m as setNextAction, o as getApplication, p as setInterviewDate, s as getCandidateDossier, t as changeApplicationLanguage, u as rememberAnswer, v as updateApplicationStage } from "./applications.functions-Dt0KIvJh.js";
import { a as notify } from "./notifications-_1kSfE6U.js";
import { r as getUserSettings } from "./user-settings.functions-Hdzanu9i.js";
import { i as downloadLetterPdf, r as downloadCvPdf, t as getCvTemplate } from "./template.functions-DCc8TDCF.js";
import * as React from "react";
import { createContext, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDownIcon, ArrowLeft, Banknote, Bell, Briefcase, Building2, CalendarClock, Check, ChevronDown, Copy, CornerDownLeftIcon, Download, ExternalLink, FileText, Languages, MapPin, RefreshCw, Sparkles, SquareIcon, Star, Wand2, XIcon } from "lucide-react";
import { cva } from "class-variance-authority";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { nanoid } from "nanoid";
import { motion } from "motion/react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as ProgressPrimitive from "@radix-ui/react-progress";
//#region src/components/ai-elements/conversation.tsx
var Conversation = ({ className, ...props }) => /* @__PURE__ */ jsx(StickToBottom, {
	className: cn("relative flex-1 overflow-y-hidden", className),
	initial: "smooth",
	resize: "smooth",
	role: "log",
	...props
});
var ConversationContent = ({ className, ...props }) => /* @__PURE__ */ jsx(StickToBottom.Content, {
	className: cn("flex flex-col gap-8 p-4", className),
	...props
});
var ConversationEmptyState = ({ className, title = "No messages yet", description = "Start a conversation to see messages here", icon, children, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("flex size-full flex-col items-center justify-center gap-3 p-8 text-center", className),
	...props,
	children: children ?? /* @__PURE__ */ jsxs(Fragment, { children: [icon && /* @__PURE__ */ jsx("div", {
		className: "text-muted-foreground",
		children: icon
	}), /* @__PURE__ */ jsxs("div", {
		className: "space-y-1",
		children: [/* @__PURE__ */ jsx("h3", {
			className: "font-medium text-sm",
			children: title
		}), description && /* @__PURE__ */ jsx("p", {
			className: "text-muted-foreground text-sm",
			children: description
		})]
	})] })
});
var ConversationScrollButton = ({ className, ...props }) => {
	const { isAtBottom, scrollToBottom } = useStickToBottomContext();
	const handleScrollToBottom = useCallback(() => {
		scrollToBottom();
	}, [scrollToBottom]);
	return !isAtBottom && /* @__PURE__ */ jsx(Button, {
		className: cn("absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full dark:bg-background dark:hover:bg-muted", className),
		onClick: handleScrollToBottom,
		size: "icon",
		type: "button",
		variant: "outline",
		...props,
		children: /* @__PURE__ */ jsx(ArrowDownIcon, { className: "size-4" })
	});
};
//#endregion
//#region src/components/ai-elements/message.tsx
var Message = ({ className, from, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("group flex w-full max-w-[95%] flex-col gap-2", from === "user" ? "is-user ml-auto justify-end" : "is-assistant", className),
	...props
});
var MessageContent = ({ children, className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("is-user:dark flex w-fit min-w-0 max-w-full flex-col gap-2 overflow-hidden text-sm", "group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground", "group-[.is-assistant]:text-foreground", className),
	...props,
	children
});
createContext(null);
var MessageResponse = memo(({ className, children, isAnimating: _isAnimating, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("size-full whitespace-pre-wrap break-words leading-relaxed", className),
	...props,
	children
}), (prevProps, nextProps) => prevProps.children === nextProps.children);
MessageResponse.displayName = "MessageResponse";
//#endregion
//#region src/components/ui/input-group.tsx
function InputGroup({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "input-group",
		role: "group",
		className: cn("group/input-group border-input dark:bg-input/30 shadow-xs relative flex w-full items-center rounded-md border outline-none transition-[color,box-shadow]", "h-9 has-[>textarea]:h-auto", "has-[>[data-align=inline-start]]:[&>input]:pl-2", "has-[>[data-align=inline-end]]:[&>input]:pr-2", "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3", "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3", "has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot=input-group-control]:focus-visible]:ring-1", "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40", className),
		...props
	});
}
var inputGroupAddonVariants = cva("text-muted-foreground flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4", {
	variants: { align: {
		"inline-start": "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
		"inline-end": "order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem]",
		"block-start": "[.border-b]:pb-3 order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5",
		"block-end": "[.border-t]:pt-3 order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5"
	} },
	defaultVariants: { align: "inline-start" }
});
function InputGroupAddon({ className, align = "inline-start", ...props }) {
	return /* @__PURE__ */ jsx("div", {
		role: "group",
		"data-slot": "input-group-addon",
		"data-align": align,
		className: cn(inputGroupAddonVariants({ align }), className),
		onClick: (e) => {
			if (e.target.closest("button")) return;
			e.currentTarget.parentElement?.querySelector("input")?.focus();
		},
		...props
	});
}
var inputGroupButtonVariants = cva("flex items-center gap-2 text-sm shadow-none", {
	variants: { size: {
		xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
		sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
		"icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
		"icon-sm": "size-8 p-0 has-[>svg]:p-0"
	} },
	defaultVariants: { size: "xs" }
});
function InputGroupButton({ className, type = "button", variant = "ghost", size = "xs", ...props }) {
	return /* @__PURE__ */ jsx(Button, {
		type,
		"data-size": size,
		variant,
		className: cn(inputGroupButtonVariants({ size }), className),
		...props
	});
}
function InputGroupTextarea({ className, ...props }) {
	return /* @__PURE__ */ jsx(Textarea, {
		"data-slot": "input-group-control",
		className: cn("flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent", className),
		...props
	});
}
//#endregion
//#region src/components/ai-elements/prompt-input.tsx
var convertBlobUrlToDataUrl = async (url) => {
	try {
		const blob = await (await fetch(url)).blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = () => resolve(null);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
};
var PromptInputController = createContext(null);
var ProviderAttachmentsContext = createContext(null);
var useOptionalPromptInputController = () => useContext(PromptInputController);
var useOptionalProviderAttachments = () => useContext(ProviderAttachmentsContext);
var LocalAttachmentsContext = createContext(null);
var usePromptInputAttachments = () => {
	const provider = useOptionalProviderAttachments();
	const context = useContext(LocalAttachmentsContext) ?? provider;
	if (!context) throw new Error("usePromptInputAttachments must be used within a PromptInput or PromptInputProvider");
	return context;
};
var LocalReferencedSourcesContext = createContext(null);
var PromptInput = ({ className, accept, multiple, globalDrop, syncHiddenInput, maxFiles, maxFileSize, onError, onSubmit, children, ...props }) => {
	const controller = useOptionalPromptInputController();
	const usingProvider = !!controller;
	const inputRef = useRef(null);
	const formRef = useRef(null);
	const [items, setItems] = useState([]);
	const files = usingProvider ? controller.attachments.files : items;
	const [referencedSources, setReferencedSources] = useState([]);
	const filesRef = useRef(files);
	useEffect(() => {
		filesRef.current = files;
	}, [files]);
	const openFileDialogLocal = useCallback(() => {
		inputRef.current?.click();
	}, []);
	const matchesAccept = useCallback((f) => {
		if (!accept || accept.trim() === "") return true;
		return accept.split(",").map((s) => s.trim()).filter(Boolean).some((pattern) => {
			if (pattern.endsWith("/*")) {
				const prefix = pattern.slice(0, -1);
				return f.type.startsWith(prefix);
			}
			return f.type === pattern;
		});
	}, [accept]);
	const addLocal = useCallback((fileList) => {
		const incoming = [...fileList];
		const accepted = incoming.filter((f) => matchesAccept(f));
		if (incoming.length && accepted.length === 0) {
			onError?.({
				code: "accept",
				message: "No files match the accepted types."
			});
			return;
		}
		const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
		const sized = accepted.filter(withinSize);
		if (accepted.length > 0 && sized.length === 0) {
			onError?.({
				code: "max_file_size",
				message: "All files exceed the maximum size."
			});
			return;
		}
		setItems((prev) => {
			const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - prev.length) : void 0;
			const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
			if (typeof capacity === "number" && sized.length > capacity) onError?.({
				code: "max_files",
				message: "Too many files. Some were not added."
			});
			const next = [];
			for (const file of capped) next.push({
				filename: file.name,
				id: nanoid(),
				mediaType: file.type,
				type: "file",
				url: URL.createObjectURL(file)
			});
			return [...prev, ...next];
		});
	}, [
		matchesAccept,
		maxFiles,
		maxFileSize,
		onError
	]);
	const removeLocal = useCallback((id) => setItems((prev) => {
		const found = prev.find((file) => file.id === id);
		if (found?.url) URL.revokeObjectURL(found.url);
		return prev.filter((file) => file.id !== id);
	}), []);
	const addWithProviderValidation = useCallback((fileList) => {
		const incoming = [...fileList];
		const accepted = incoming.filter((f) => matchesAccept(f));
		if (incoming.length && accepted.length === 0) {
			onError?.({
				code: "accept",
				message: "No files match the accepted types."
			});
			return;
		}
		const withinSize = (f) => maxFileSize ? f.size <= maxFileSize : true;
		const sized = accepted.filter(withinSize);
		if (accepted.length > 0 && sized.length === 0) {
			onError?.({
				code: "max_file_size",
				message: "All files exceed the maximum size."
			});
			return;
		}
		const currentCount = files.length;
		const capacity = typeof maxFiles === "number" ? Math.max(0, maxFiles - currentCount) : void 0;
		const capped = typeof capacity === "number" ? sized.slice(0, capacity) : sized;
		if (typeof capacity === "number" && sized.length > capacity) onError?.({
			code: "max_files",
			message: "Too many files. Some were not added."
		});
		if (capped.length > 0) controller?.attachments.add(capped);
	}, [
		matchesAccept,
		maxFileSize,
		maxFiles,
		onError,
		files.length,
		controller
	]);
	const clearAttachments = useCallback(() => usingProvider ? controller?.attachments.clear() : setItems((prev) => {
		for (const file of prev) if (file.url) URL.revokeObjectURL(file.url);
		return [];
	}), [usingProvider, controller]);
	const clearReferencedSources = useCallback(() => setReferencedSources([]), []);
	const add = usingProvider ? addWithProviderValidation : addLocal;
	const remove = usingProvider ? controller.attachments.remove : removeLocal;
	const openFileDialog = usingProvider ? controller.attachments.openFileDialog : openFileDialogLocal;
	const clear = useCallback(() => {
		clearAttachments();
		clearReferencedSources();
	}, [clearAttachments, clearReferencedSources]);
	useEffect(() => {
		if (!usingProvider) return;
		controller.__registerFileInput(inputRef, () => inputRef.current?.click());
	}, [usingProvider, controller]);
	useEffect(() => {
		if (syncHiddenInput && inputRef.current && files.length === 0) inputRef.current.value = "";
	}, [files, syncHiddenInput]);
	useEffect(() => {
		const form = formRef.current;
		if (!form) return;
		if (globalDrop) return;
		const onDragOver = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		const onDrop = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) add(e.dataTransfer.files);
		};
		form.addEventListener("dragover", onDragOver);
		form.addEventListener("drop", onDrop);
		return () => {
			form.removeEventListener("dragover", onDragOver);
			form.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);
	useEffect(() => {
		if (!globalDrop) return;
		const onDragOver = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
		};
		const onDrop = (e) => {
			if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
			if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) add(e.dataTransfer.files);
		};
		document.addEventListener("dragover", onDragOver);
		document.addEventListener("drop", onDrop);
		return () => {
			document.removeEventListener("dragover", onDragOver);
			document.removeEventListener("drop", onDrop);
		};
	}, [add, globalDrop]);
	useEffect(() => () => {
		if (!usingProvider) {
			for (const f of filesRef.current) if (f.url) URL.revokeObjectURL(f.url);
		}
	}, [usingProvider]);
	const handleChange = useCallback((event) => {
		if (event.currentTarget.files) add(event.currentTarget.files);
		event.currentTarget.value = "";
	}, [add]);
	const attachmentsCtx = useMemo(() => ({
		add,
		clear: clearAttachments,
		fileInputRef: inputRef,
		files: files.map((item) => ({
			...item,
			id: item.id
		})),
		openFileDialog,
		remove
	}), [
		files,
		add,
		remove,
		clearAttachments,
		openFileDialog
	]);
	const refsCtx = useMemo(() => ({
		add: (incoming) => {
			const array = Array.isArray(incoming) ? incoming : [incoming];
			setReferencedSources((prev) => [...prev, ...array.map((s) => ({
				...s,
				id: nanoid()
			}))]);
		},
		clear: clearReferencedSources,
		remove: (id) => {
			setReferencedSources((prev) => prev.filter((s) => s.id !== id));
		},
		sources: referencedSources
	}), [referencedSources, clearReferencedSources]);
	const handleSubmit = useCallback(async (event) => {
		event.preventDefault();
		const form = event.currentTarget;
		const text = usingProvider ? controller.textInput.value : (() => {
			return new FormData(form).get("message") || "";
		})();
		if (!usingProvider) form.reset();
		try {
			const result = onSubmit({
				files: await Promise.all(files.map(async ({ id: _id, ...item }) => {
					if (item.url?.startsWith("blob:")) {
						const dataUrl = await convertBlobUrlToDataUrl(item.url);
						return {
							...item,
							url: dataUrl ?? item.url
						};
					}
					return item;
				})),
				text
			}, event);
			if (result instanceof Promise) try {
				await result;
				clear();
				if (usingProvider) controller.textInput.clear();
			} catch {}
			else {
				clear();
				if (usingProvider) controller.textInput.clear();
			}
		} catch {}
	}, [
		usingProvider,
		controller,
		files,
		onSubmit,
		clear
	]);
	const inner = /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("input", {
		accept,
		"aria-label": "Upload files",
		className: "hidden",
		multiple,
		onChange: handleChange,
		ref: inputRef,
		title: "Upload files",
		type: "file"
	}), /* @__PURE__ */ jsx("form", {
		className: cn("w-full", className),
		onSubmit: handleSubmit,
		ref: formRef,
		...props,
		children: /* @__PURE__ */ jsx(InputGroup, {
			className: "overflow-hidden",
			children
		})
	})] });
	const withReferencedSources = /* @__PURE__ */ jsx(LocalReferencedSourcesContext.Provider, {
		value: refsCtx,
		children: inner
	});
	return /* @__PURE__ */ jsx(LocalAttachmentsContext.Provider, {
		value: attachmentsCtx,
		children: withReferencedSources
	});
};
var PromptInputTextarea = ({ onChange, onKeyDown, className, placeholder = "What would you like to know?", ...props }) => {
	const controller = useOptionalPromptInputController();
	const attachments = usePromptInputAttachments();
	const [isComposing, setIsComposing] = useState(false);
	const handleKeyDown = useCallback((e) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		if (e.key === "Enter") {
			if (isComposing || e.nativeEvent.isComposing) return;
			if (e.shiftKey) return;
			e.preventDefault();
			const { form } = e.currentTarget;
			if ((form?.querySelector("button[type=\"submit\"]"))?.disabled) return;
			form?.requestSubmit();
		}
		if (e.key === "Backspace" && e.currentTarget.value === "" && attachments.files.length > 0) {
			e.preventDefault();
			const lastAttachment = attachments.files.at(-1);
			if (lastAttachment) attachments.remove(lastAttachment.id);
		}
	}, [
		onKeyDown,
		isComposing,
		attachments
	]);
	const handlePaste = useCallback((event) => {
		const items = event.clipboardData?.items;
		if (!items) return;
		const files = [];
		for (const item of items) if (item.kind === "file") {
			const file = item.getAsFile();
			if (file) files.push(file);
		}
		if (files.length > 0) {
			event.preventDefault();
			attachments.add(files);
		}
	}, [attachments]);
	const handleCompositionEnd = useCallback(() => setIsComposing(false), []);
	const handleCompositionStart = useCallback(() => setIsComposing(true), []);
	const controlledProps = controller ? {
		onChange: (e) => {
			controller.textInput.setInput(e.currentTarget.value);
			onChange?.(e);
		},
		value: controller.textInput.value
	} : { onChange };
	return /* @__PURE__ */ jsx(InputGroupTextarea, {
		className: cn("field-sizing-content max-h-48 min-h-16", className),
		name: "message",
		onCompositionEnd: handleCompositionEnd,
		onCompositionStart: handleCompositionStart,
		onKeyDown: handleKeyDown,
		onPaste: handlePaste,
		placeholder,
		...props,
		...controlledProps
	});
};
var PromptInputFooter = ({ className, ...props }) => /* @__PURE__ */ jsx(InputGroupAddon, {
	align: "block-end",
	className: cn("justify-between gap-1", className),
	...props
});
var PromptInputSubmit = ({ className, variant = "default", size = "icon-sm", status, onStop, onClick, children, ...props }) => {
	const isGenerating = status === "submitted" || status === "streaming";
	let Icon = /* @__PURE__ */ jsx(CornerDownLeftIcon, { className: "size-4" });
	if (status === "submitted") Icon = /* @__PURE__ */ jsx(Spinner, {});
	else if (status === "streaming") Icon = /* @__PURE__ */ jsx(SquareIcon, { className: "size-4" });
	else if (status === "error") Icon = /* @__PURE__ */ jsx(XIcon, { className: "size-4" });
	const handleClick = useCallback((e) => {
		if (isGenerating && onStop) {
			e.preventDefault();
			onStop();
			return;
		}
		onClick?.(e);
	}, [
		isGenerating,
		onStop,
		onClick
	]);
	return /* @__PURE__ */ jsx(InputGroupButton, {
		"aria-label": isGenerating ? "Stop" : "Submit",
		className: cn(className),
		onClick: handleClick,
		size,
		type: isGenerating && onStop ? "button" : "submit",
		variant,
		...props,
		children: children ?? Icon
	});
};
//#endregion
//#region src/components/ai-elements/shimmer.tsx
var motionComponentCache = /* @__PURE__ */ new Map();
var getMotionComponent = (element) => {
	let component = motionComponentCache.get(element);
	if (!component) {
		component = motion.create(element);
		motionComponentCache.set(element, component);
	}
	return component;
};
var ShimmerComponent = ({ children, as: Component = "p", className, duration = 2, spread = 2 }) => {
	const MotionComponent = getMotionComponent(Component);
	const dynamicSpread = useMemo(() => (children?.length ?? 0) * spread, [children, spread]);
	return /* @__PURE__ */ jsx(MotionComponent, {
		animate: { backgroundPosition: "0% center" },
		className: cn("relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent", "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]", className),
		initial: { backgroundPosition: "100% center" },
		style: {
			"--spread": `${dynamicSpread}px`,
			backgroundImage: "var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))"
		},
		transition: {
			duration,
			ease: "linear",
			repeat: Number.POSITIVE_INFINITY
		},
		children
	});
};
var Shimmer = memo(ShimmerComponent);
//#endregion
//#region src/components/ui/accordion.tsx
var Accordion = AccordionPrimitive.Root;
var AccordionItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Item, {
	ref,
	className: cn("border-b", className),
	...props
}));
AccordionItem.displayName = "AccordionItem";
var AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Header, {
	className: "flex",
	children: /* @__PURE__ */ jsxs(AccordionPrimitive.Trigger, {
		ref,
		className: cn("flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180", className),
		...props,
		children: [children, /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })]
	})
}));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
var AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Content, {
	ref,
	className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
	...props,
	children: /* @__PURE__ */ jsx("div", {
		className: cn("pb-4 pt-0", className),
		children
	})
}));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
//#endregion
//#region src/components/ui/progress.tsx
var Progress = React.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsx(ProgressPrimitive.Root, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
	...props,
	children: /* @__PURE__ */ jsx(ProgressPrimitive.Indicator, {
		className: "h-full w-full flex-1 bg-primary transition-all",
		style: { transform: `translateX(-${100 - (value || 0)}%)` }
	})
}));
Progress.displayName = ProgressPrimitive.Root.displayName;
//#endregion
//#region src/components/application-tracker.tsx
var OPEN_STAGES = [
	"draft",
	"applied",
	"interview",
	"offer"
];
var CLOSE_ACTIONS = [
	{
		stage: "rejected",
		label: "Rejected"
	},
	{
		stage: "withdrawn",
		label: "No longer interested"
	},
	{
		stage: "ghosted",
		label: "Ghosted"
	}
];
/** Turn an ISO timestamp into the value an <input type="date"> expects. */
function toDateInput(value) {
	if (typeof value !== "string") return "";
	const stamp = Date.parse(value);
	if (!Number.isFinite(stamp)) return "";
	return new Date(stamp).toISOString().slice(0, 10);
}
/**
* Everything the user needs to remember what this application is and where it
* stands: offer recap, pipeline stage, ghosting radar and reminders.
*/
function ApplicationTracker({ application, windows }) {
	const queryClient = useQueryClient();
	const id = application.id;
	const stageFn = useServerFn(updateApplicationStage);
	const interviewFn = useServerFn(setInterviewDate);
	const nextActionFn = useServerFn(setNextAction);
	const followUpFn = useServerFn(markFollowedUp);
	const summariseFn = useServerFn(summariseOffer);
	const reviewFn = useServerFn(submitReview);
	const summary = normalizeOfferSummary(application["offer_summary"]);
	const health = pipelineHealth(application, windows);
	const stage = health.stage;
	const [interviewAt, setInterviewAt] = useState(toDateInput(application["interview_at"]));
	const [nextActionAt, setNextActionAt] = useState(toDateInput(application["next_action_at"]));
	const [celebrate, setCelebrate] = useState(false);
	const [rating, setRating] = useState(5);
	const [reviewText, setReviewText] = useState("");
	useEffect(() => {
		setInterviewAt(toDateInput(application["interview_at"]));
		setNextActionAt(toDateInput(application["next_action_at"]));
	}, [application["interview_at"], application["next_action_at"]]);
	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: ["application", id] });
		queryClient.invalidateQueries({ queryKey: ["applications"] });
	};
	const stageMutation = useMutation({
		mutationFn: (next) => stageFn({ data: {
			id,
			stage: next,
			...next === "interview" && interviewAt ? { interviewAt: (/* @__PURE__ */ new Date(`${interviewAt}T09:00:00`)).toISOString() } : {}
		} }),
		onSuccess: (_result, next) => {
			refresh();
			if (next === "interview") toast.success("Interview stage — prep questions switch to deep mode.");
			else if (next === "offer") setCelebrate(true);
			else toast.success(`Moved to ${stageLabel(next)}`);
		},
		onError: (error) => toast.error(error.message)
	});
	const interviewMutation = useMutation({
		mutationFn: (value) => interviewFn({ data: {
			id,
			interviewAt: value ? (/* @__PURE__ */ new Date(`${value}T09:00:00`)).toISOString() : null
		} }),
		onSuccess: () => {
			refresh();
			toast.success("Interview date updated");
		},
		onError: (error) => toast.error(error.message)
	});
	const nextActionMutation = useMutation({
		mutationFn: (value) => nextActionFn({ data: {
			id,
			nextActionAt: value ? (/* @__PURE__ */ new Date(`${value}T09:00:00`)).toISOString() : null
		} }),
		onSuccess: () => refresh(),
		onError: (error) => toast.error(error.message)
	});
	const followUpMutation = useMutation({
		mutationFn: () => followUpFn({ data: { id } }),
		onSuccess: () => {
			refresh();
			toast.success("Logged — we pushed your reminder forward.");
		},
		onError: (error) => toast.error(error.message)
	});
	const summaryMutation = useMutation({
		mutationFn: () => summariseFn({ data: { id } }),
		onSuccess: () => {
			refresh();
			notify("offer_analyzed", "Offer summary ready", "We condensed the job description for you.");
		},
		onError: (error) => toast.error(error.message)
	});
	const reviewMutation = useMutation({
		mutationFn: () => reviewFn({ data: {
			rating,
			message: reviewText,
			source: "hired",
			applicationId: id,
			mayQuote: true
		} }),
		onSuccess: () => {
			setCelebrate(false);
			toast.success("Thank you — and congratulations!");
		},
		onError: (error) => toast.error(error.message)
	});
	const appliedOn = typeof application["applied_at"] === "string" ? new Date(application["applied_at"]).toLocaleDateString() : null;
	return /* @__PURE__ */ jsxs("section", {
		className: "mt-4 rounded-xl border border-border bg-card",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b border-border p-4",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex flex-wrap items-center gap-1.5",
					children: OPEN_STAGES.map((item, index) => {
						const currentIndex = OPEN_STAGES.indexOf(stage);
						return /* @__PURE__ */ jsx(Button, {
							size: "sm",
							variant: stage === item ? "default" : currentIndex >= 0 && index <= currentIndex ? "secondary" : "outline",
							onClick: () => stageMutation.mutate(item),
							disabled: stageMutation.isPending,
							children: item === "offer" ? "Got the job" : stageLabel(item)
						}, item);
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "flex flex-wrap items-center gap-1",
					children: CLOSE_ACTIONS.map((item) => /* @__PURE__ */ jsx(Button, {
						size: "sm",
						variant: stage === item.stage ? "destructive" : "ghost",
						className: "text-xs text-muted-foreground",
						onClick: () => stageMutation.mutate(item.stage),
						disabled: stageMutation.isPending,
						children: item.label
					}, item.stage))
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid gap-5 p-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ jsx("p", {
								className: cn("text-sm font-medium", toneTextClass(health.tone)),
								children: health.sentence
							}), health.likelihood !== null && /* @__PURE__ */ jsxs("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ jsx(Progress, { value: health.likelihood }), /* @__PURE__ */ jsxs("p", {
									className: "text-xs text-muted-foreground",
									children: [health.likelihood, "% of companies that reply have replied by this point."]
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsxs(Label, {
									htmlFor: "interview-date",
									className: "text-xs",
									children: [/* @__PURE__ */ jsx(CalendarClock, { className: "mr-1 inline size-3" }), " Interview date"]
								}), /* @__PURE__ */ jsx(Input, {
									id: "interview-date",
									type: "date",
									value: interviewAt,
									onChange: (event) => {
										setInterviewAt(event.target.value);
										interviewMutation.mutate(event.target.value);
									}
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ jsxs(Label, {
									htmlFor: "next-action",
									className: "text-xs",
									children: [/* @__PURE__ */ jsx(Bell, { className: "mr-1 inline size-3" }), " Next action"]
								}), /* @__PURE__ */ jsx(Input, {
									id: "next-action",
									type: "date",
									value: nextActionAt,
									onChange: (event) => {
										setNextActionAt(event.target.value);
										nextActionMutation.mutate(event.target.value);
									}
								})]
							})]
						}),
						stage === "applied" && /* @__PURE__ */ jsx(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => followUpMutation.mutate(),
							disabled: followUpMutation.isPending,
							children: "I followed up today"
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "rounded-lg border border-border/70 bg-background/60 p-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "truncate text-base font-semibold leading-tight",
									children: application["role_title"] || "Untitled role"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-0.5 truncate text-sm text-muted-foreground",
									children: application["company"] || "Unknown company"
								})]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex shrink-0 items-center gap-1.5",
								children: [typeof application["offer_url"] === "string" && application["offer_url"] ? /* @__PURE__ */ jsxs("a", {
									href: application["offer_url"],
									target: "_blank",
									rel: "noreferrer noopener",
									className: "inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-primary hover:bg-accent hover:underline",
									children: [/* @__PURE__ */ jsx(ExternalLink, { className: "size-3.5" }), " Job post"]
								}) : null, /* @__PURE__ */ jsxs(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => summaryMutation.mutate(),
									disabled: summaryMutation.isPending,
									children: [summaryMutation.isPending ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsx(RefreshCw, { className: "size-3.5" }), isEmptySummary(summary) ? "Summarize offer" : "Refresh"]
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
							children: [
								appliedOn && /* @__PURE__ */ jsxs(Badge, {
									variant: "secondary",
									children: ["Applied ", appliedOn]
								}),
								summary.location && /* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1",
									children: [
										/* @__PURE__ */ jsx(MapPin, { className: "size-3" }),
										" ",
										summary.location
									]
								}),
								(summary.seniority || summary.employmentType) && /* @__PURE__ */ jsx("span", { children: [summary.seniority, summary.employmentType].filter(Boolean).join(" · ") }),
								summary.salaryText && /* @__PURE__ */ jsxs("span", {
									className: "inline-flex items-center gap-1",
									children: [
										/* @__PURE__ */ jsx(Banknote, { className: "size-3" }),
										" ",
										summary.salaryText
									]
								})
							]
						}),
						summary.summary ? /* @__PURE__ */ jsx("p", {
							className: "mt-3 text-sm leading-relaxed text-muted-foreground",
							children: summary.summary
						}) : /* @__PURE__ */ jsxs("p", {
							className: "mt-3 flex items-center gap-2 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ jsx(Sparkles, { className: "size-3.5" }), " No recap yet — summarise the offer to get a two-line reminder of what this role is about."]
						}),
						summary.skills.length > 0 && /* @__PURE__ */ jsx("div", {
							className: "mt-3 flex flex-wrap gap-1.5",
							children: summary.skills.map((skill) => /* @__PURE__ */ jsx("span", {
								className: "rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground",
								children: skill
							}, skill))
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx(Dialog, {
				open: celebrate,
				onOpenChange: setCelebrate,
				children: /* @__PURE__ */ jsxs(DialogContent, { children: [
					/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "You got the job 🎉" }), /* @__PURE__ */ jsx(DialogDescription, { children: "Congratulations! If TailorCV helped, a short review means a lot." })] }),
					/* @__PURE__ */ jsx("div", {
						className: "flex items-center gap-1",
						children: [
							1,
							2,
							3,
							4,
							5
						].map((value) => /* @__PURE__ */ jsx("button", {
							type: "button",
							"aria-label": `${value} stars`,
							onClick: () => setRating(value),
							className: "p-1",
							children: /* @__PURE__ */ jsx(Star, { className: cn("size-6", value <= rating ? "fill-primary text-primary" : "text-muted-foreground/40") })
						}, value))
					}),
					/* @__PURE__ */ jsx(Textarea, {
						rows: 4,
						value: reviewText,
						onChange: (event) => setReviewText(event.target.value),
						placeholder: "What made the difference for you?"
					}),
					/* @__PURE__ */ jsxs(DialogFooter, { children: [/* @__PURE__ */ jsx(Button, {
						variant: "ghost",
						onClick: () => setCelebrate(false),
						children: "Maybe later"
					}), /* @__PURE__ */ jsx(Button, {
						onClick: () => reviewMutation.mutate(),
						disabled: reviewMutation.isPending,
						children: "Send review"
					})] })
				] })
			})
		]
	});
}
//#endregion
//#region src/routes/_authenticated/applications.$id.tsx?tsr-split=component
function Workspace() {
	const { id } = Route.useParams();
	const queryClient = useQueryClient();
	const fetchApplication = useServerFn(getApplication);
	const update = useServerFn(updateApplication);
	const tailor = useServerFn(tailorCv);
	const coverLetter = useServerFn(generateCoverLetter);
	const persistTurn = useServerFn(saveChatTurn);
	const remember = useServerFn(rememberAnswer);
	const fetchTemplate = useServerFn(getCvTemplate);
	const makePrep = useServerFn(generateInterviewPrep);
	const fetchDossier = useServerFn(getCandidateDossier);
	const switchLanguage = useServerFn(changeApplicationLanguage);
	const summarise = useServerFn(summariseOffer);
	const { data, isLoading } = useQuery({
		queryKey: ["application", id],
		queryFn: () => fetchApplication({ data: { id } })
	});
	const templateQuery = useQuery({
		queryKey: ["cv-template"],
		queryFn: () => fetchTemplate()
	});
	const fetchSettings = useServerFn(getUserSettings);
	const settingsQuery = useQuery({
		queryKey: ["user-settings"],
		queryFn: () => fetchSettings()
	});
	const cvLanguages = settingsQuery.data?.cvLanguages ?? ["en"];
	const dossierQuery = useQuery({
		queryKey: ["dossier"],
		queryFn: () => fetchDossier()
	});
	const [showDossier, setShowDossier] = useState(false);
	const [copied, setCopied] = useState(false);
	const [company, setCompany] = useState("");
	const [roleTitle, setRoleTitle] = useState("");
	const [offerText, setOfferText] = useState("");
	const [cv, setCv] = useState(null);
	const [match, setMatch] = useState(null);
	const [letter, setLetter] = useState("");
	const [tone, setTone] = useState(null);
	const [prep, setPrep] = useState(null);
	const [prepCopied, setPrepCopied] = useState(false);
	const [language, setLanguage] = useState("en");
	const [summary, setSummary] = useState(null);
	const effectiveTone = tone ?? settingsQuery.data?.coverLetterTone ?? "professional";
	useEffect(() => {
		if (!data) return;
		setCompany(data.application.company ?? "");
		setRoleTitle(data.application.role_title ?? "");
		setOfferText(data.application.offer_text ?? "");
		setLetter(data.application.cover_letter ?? "");
		setCv(data.application.tailored_cv ? normalizeCv(data.application.tailored_cv) : null);
		setMatch(data.application.match_result ? normalizeMatch(data.application.match_result) : null);
		const storedPrep = data.application.interview_prep;
		setPrep(storedPrep ? normalizeInterviewPrep(storedPrep) : null);
		setLanguage(normalizeLanguage(data.application.language));
		const storedSummary = data.application.offer_summary;
		setSummary(storedSummary ? normalizeOfferSummary(storedSummary) : null);
	}, [data]);
	const templateSettings = templateQuery.data ?? DEFAULT_TEMPLATE;
	const initialMessages = useMemo(() => (data?.messages ?? []).map((message) => ({
		id: message.id,
		role: message.role === "assistant" ? "assistant" : "user",
		parts: [{
			type: "text",
			text: message.content
		}]
	})), [data?.messages]);
	const activeCv = cv ?? data?.profile ?? null;
	const labels = sectionLabels(language);
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState(initialMessages);
	const [status, setStatus] = useState("ready");
	useEffect(() => {
		if (messages.length === 0 && initialMessages.length > 0) setMessages(initialMessages);
	}, [initialMessages, messages.length]);
	const sendMessage = async (text) => {
		const userMessage = createChatMessage("user", text);
		const outgoingMessages = [...messages, userMessage];
		setMessages(outgoingMessages);
		setStatus("submitted");
		try {
			const { data: session } = await supabase.auth.getSession();
			const accessToken = session.session?.access_token;
			if (!accessToken) throw new Error("Your session expired. Please sign in again.");
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`
				},
				body: JSON.stringify({
					messages: outgoingMessages,
					applicationId: id
				})
			});
			if (!response.ok) throw new Error(await response.text() || "The interview could not continue.");
			if (!response.body) throw new Error("The interview returned an empty response.");
			const assistantMessage = createChatMessage("assistant", "");
			setMessages((current) => [...current, assistantMessage]);
			setStatus("streaming");
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let assistantText = "";
			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				assistantText += decoder.decode(value, { stream: true });
				setMessages((current) => current.map((message) => message.id === assistantMessage.id ? {
					...message,
					parts: [{
						type: "text",
						text: assistantText
					}]
				} : message));
			}
			assistantText += decoder.decode();
			if (assistantText.trim()) persistTurn({ data: {
				applicationId: id,
				turns: [{
					role: "assistant",
					content: assistantText.trim()
				}]
			} });
			setStatus("ready");
		} catch (error) {
			setStatus("error");
			toast.error(error instanceof Error ? error.message : "The interview could not continue.");
		}
	};
	const busy = status === "submitted" || status === "streaming";
	const kickedOff = useRef(false);
	useEffect(() => {
		if (kickedOff.current) return;
		if (!data || isLoading) return;
		if (initialMessages.length > 0 || messages.length > 0) return;
		if (busy) return;
		if (!(data.application.offer_text ?? "").trim()) return;
		kickedOff.current = true;
		sendMessage(KICKOFF_MESSAGE);
	}, [
		data,
		isLoading,
		initialMessages.length,
		messages.length,
		busy,
		sendMessage
	]);
	const visibleMessages = useMemo(() => messages.filter((message) => chatMessageText(message) !== KICKOFF_MESSAGE), [messages]);
	const saveMutation = useMutation({
		mutationFn: () => update({ data: {
			id,
			company,
			roleTitle,
			offerText
		} }),
		onSuccess: () => toast.success("Application saved"),
		onError: (error) => toast.error(error.message)
	});
	const tailorMutation = useMutation({
		mutationFn: () => tailor({ data: { id } }),
		onSuccess: (result) => {
			setCv(result.cv);
			setMatch(result.match);
			queryClient.invalidateQueries({ queryKey: ["applications"] });
			toast.success(`Tailored — ${result.match.score}% keyword match`);
			notify("cv_tailored", "Your tailored CV is ready", `${result.match.score}% keyword match for ${roleTitle || "this role"}.`);
		},
		onError: (error) => {
			toast.error(error.message);
			notify("errors", "Tailoring failed", error.message);
		}
	});
	const letterMutation = useMutation({
		mutationFn: () => coverLetter({ data: {
			id,
			tone: COVER_LETTER_TONES.find((item) => item.value === normalizeTone(effectiveTone))?.label ?? "Professional"
		} }),
		onSuccess: (result) => {
			setLetter(result.letter);
			toast.success("Cover letter ready");
			notify("cover_letter", "Your cover letter is ready", `${company || "Application"} — ${roleTitle || "role"}.`);
		},
		onError: (error) => {
			toast.error(error.message);
			notify("errors", "Cover letter failed", error.message);
		}
	});
	const prepMutation = useMutation({
		mutationFn: () => makePrep({ data: { id } }),
		onSuccess: (result) => {
			setPrep(normalizeInterviewPrep(result));
			toast.success("Interview questions ready");
			notify("interview_prep", "Interview prep is ready", `Screening questions drafted for ${company || "your application"}.`);
		},
		onError: (error) => {
			toast.error(error.message);
			notify("errors", "Interview prep failed", error.message);
		}
	});
	const summaryMutation = useMutation({
		mutationFn: () => summarise({ data: { id } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["application", id] });
			queryClient.invalidateQueries({ queryKey: ["applications"] });
			toast.success("Offer summarized");
			notify("offer_analyzed", "Offer summary ready", "We condensed the job description for you.");
		},
		onError: (error) => {
			toast.error(error.message);
			notify("errors", "Offer summary failed", error.message);
		}
	});
	const languageMutation = useMutation({
		mutationFn: (next) => switchLanguage({ data: {
			id,
			language: next
		} }),
		onSuccess: (result) => {
			setLanguage(normalizeLanguage(result.language));
			if (result.cv) setCv(normalizeCv(result.cv));
			if (result.coverLetter) setLetter(result.coverLetter);
			if (result.prep) setPrep(normalizeInterviewPrep(result.prep));
			queryClient.invalidateQueries({ queryKey: ["application", id] });
			queryClient.invalidateQueries({ queryKey: ["applications"] });
			toast.success(result.translated ? `Application switched to ${languageNative(result.language)}` : "Language unchanged");
		},
		onError: (error, next) => {
			setLanguage(next === "es" ? "en" : "es");
			toast.error(error.message);
		}
	});
	const handleSend = () => {
		const text = input.trim();
		if (!text || busy) return;
		setInput("");
		const lastQuestion = [...messages].reverse().find((message) => message.role === "assistant");
		sendMessage(text);
		persistTurn({ data: {
			applicationId: id,
			turns: [{
				role: "user",
				content: text
			}]
		} });
		remember({ data: {
			applicationId: id,
			question: lastQuestion ? chatMessageText(lastQuestion) : "",
			answer: text
		} }).then(() => queryClient.invalidateQueries({ queryKey: ["dossier"] }));
	};
	if (isLoading || !data) return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx("p", {
		className: "mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground",
		children: "Loading…"
	}) });
	return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsxs("main", {
		className: "mx-auto max-w-7xl px-6 py-8",
		children: [
			/* @__PURE__ */ jsxs(Link, {
				to: "/dashboard",
				className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "size-3.5" }), " All applications"]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4 flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "grid gap-2 sm:grid-cols-2 sm:gap-3",
					children: [/* @__PURE__ */ jsx(Input, {
						className: "font-display text-lg font-semibold",
						value: roleTitle,
						onChange: (event) => setRoleTitle(event.target.value),
						placeholder: "Role"
					}), /* @__PURE__ */ jsx(Input, {
						value: company,
						onChange: (event) => setCompany(event.target.value),
						placeholder: "Company"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ jsxs(Select, {
							value: language,
							onValueChange: (next) => {
								if (next === language || languageMutation.isPending) return;
								setLanguage(next);
								languageMutation.mutate(next);
							},
							children: [/* @__PURE__ */ jsxs(SelectTrigger, {
								className: "w-40",
								"aria-label": "Application language",
								children: [languageMutation.isPending ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsx(Languages, { className: "size-4" }), /* @__PURE__ */ jsx(SelectValue, {})]
							}), /* @__PURE__ */ jsx(SelectContent, { children: LANGUAGES.filter((item) => cvLanguages.includes(item.code)).map((item) => /* @__PURE__ */ jsx(SelectItem, {
								value: item.code,
								children: item.native
							}, item.code)) })]
						}),
						/* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							onClick: () => saveMutation.mutate(),
							children: "Save"
						}),
						/* @__PURE__ */ jsxs(Button, {
							onClick: () => tailorMutation.mutate(),
							disabled: tailorMutation.isPending,
							children: [tailorMutation.isPending ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsx(Wand2, { className: "size-4" }), "Tailor CV"]
						})
					]
				})]
			}),
			data?.application && /* @__PURE__ */ jsx(ApplicationTracker, {
				application: data.application,
				windows: {
					responseWindowDays: settingsQuery.data?.responseWindowDays ?? 21,
					ghostAfterDays: settingsQuery.data?.ghostAfterDays ?? 45,
					archiveRetentionDays: settingsQuery.data?.archiveRetentionDays ?? 30,
					followupOffsetDays: settingsQuery.data?.followupOffsetDays ?? 10
				}
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-6 grid gap-5 lg:grid-cols-[1.35fr_1fr]",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [match && /* @__PURE__ */ jsxs("div", {
						className: "mb-5 rounded-xl border border-border bg-card p-5",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-baseline gap-3",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "font-display text-3xl font-bold text-primary",
									children: [match.score, "%"]
								}), /* @__PURE__ */ jsx("span", {
									className: "text-sm text-muted-foreground",
									children: "ATS keyword match"
								})]
							}),
							match.notes && /* @__PURE__ */ jsx("p", {
								className: "mt-3 text-sm leading-relaxed text-muted-foreground",
								children: match.notes
							}),
							match.missing.length > 0 && /* @__PURE__ */ jsxs("div", {
								className: "mt-4",
								children: [/* @__PURE__ */ jsx("p", {
									className: "text-xs uppercase tracking-wide text-muted-foreground",
									children: "Not covered yet"
								}), /* @__PURE__ */ jsx("div", {
									className: "mt-2 flex flex-wrap gap-1.5",
									children: match.missing.map((keyword) => /* @__PURE__ */ jsx("span", {
										className: "rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground",
										children: keyword
									}, keyword))
								})]
							})
						]
					}), /* @__PURE__ */ jsxs(Tabs, {
						defaultValue: "cv",
						children: [
							/* @__PURE__ */ jsxs(TabsList, { children: [
								/* @__PURE__ */ jsx(TabsTrigger, {
									value: "cv",
									children: "Tailored CV"
								}),
								/* @__PURE__ */ jsx(TabsTrigger, {
									value: "letter",
									children: "Cover letter"
								}),
								/* @__PURE__ */ jsx(TabsTrigger, {
									value: "prep",
									children: "Interview prep"
								}),
								/* @__PURE__ */ jsx(TabsTrigger, {
									value: "offer",
									children: "Job offer"
								})
							] }),
							/* @__PURE__ */ jsx(TabsContent, {
								value: "cv",
								className: "mt-4",
								children: cv ? /* @__PURE__ */ jsxs("div", {
									className: "rounded-xl border border-border bg-card",
									children: [/* @__PURE__ */ jsx("div", {
										className: "flex flex-wrap items-center justify-end gap-2 border-b border-border p-3",
										children: /* @__PURE__ */ jsxs(Button, {
											variant: "outline",
											size: "sm",
											onClick: () => downloadCvPdf(cv, `${(cv.fullName || "CV").replace(/\s+/g, "-")}-${(company || "role").replace(/\s+/g, "-")}.pdf`, language, templateSettings),
											children: [/* @__PURE__ */ jsx(Download, { className: "size-4" }), " Download PDF"]
										})
									}), /* @__PURE__ */ jsxs("article", {
										className: "space-y-6 p-7 text-sm leading-relaxed",
										children: [
											/* @__PURE__ */ jsxs("header", {
												className: "flex items-start gap-4",
												children: [cv.photoUrl && /* @__PURE__ */ jsx("img", {
													src: cv.photoUrl,
													alt: `${cv.fullName} profile photo`,
													className: "size-16 shrink-0 rounded-full object-cover"
												}), /* @__PURE__ */ jsxs("div", {
													className: "min-w-0",
													children: [
														/* @__PURE__ */ jsx("h2", {
															className: "font-display text-xl font-bold",
															children: cv.fullName
														}),
														cv.headline && /* @__PURE__ */ jsx("p", {
															className: "text-muted-foreground",
															children: cv.headline
														}),
														/* @__PURE__ */ jsx("p", {
															className: "mt-1 text-xs text-muted-foreground",
															children: [
																cv.email,
																cv.phone,
																cv.location
															].filter(Boolean).join("  •  ")
														}),
														cv.linkItems.length > 0 && /* @__PURE__ */ jsx("p", {
															className: "mt-1 text-xs text-muted-foreground",
															children: cv.linkItems.filter((link) => link.url).map((link) => `${link.label}: ${link.url}`).join("  •  ")
														})
													]
												})]
											}),
											cv.summary && /* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h3", {
												className: "text-xs font-semibold uppercase tracking-wide text-primary",
												children: labels.summary
											}), /* @__PURE__ */ jsx("p", {
												className: "mt-2",
												children: cv.summary
											})] }),
											cv.experiences.length > 0 && /* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h3", {
												className: "text-xs font-semibold uppercase tracking-wide text-primary",
												children: labels.experience
											}), /* @__PURE__ */ jsx("div", {
												className: "mt-3 space-y-4",
												children: cv.experiences.map((experience, index) => /* @__PURE__ */ jsxs("div", { children: [
													/* @__PURE__ */ jsxs("p", {
														className: "font-semibold",
														children: [experience.title, experience.company ? ` — ${experience.company}` : ""]
													}),
													/* @__PURE__ */ jsx("p", {
														className: "text-xs text-muted-foreground",
														children: [experience.location, [experience.start, experience.end].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ")
													}),
													/* @__PURE__ */ jsx("ul", {
														className: "mt-2 list-disc space-y-1 pl-5",
														children: experience.bullets.map((bullet, bulletIndex) => /* @__PURE__ */ jsx("li", { children: bullet }, bulletIndex))
													})
												] }, index))
											})] }),
											cv.education.length > 0 && /* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h3", {
												className: "text-xs font-semibold uppercase tracking-wide text-primary",
												children: labels.education
											}), /* @__PURE__ */ jsx("div", {
												className: "mt-3 space-y-3",
												children: cv.education.map((education, index) => /* @__PURE__ */ jsxs("div", { children: [
													/* @__PURE__ */ jsxs("p", {
														className: "font-semibold",
														children: [education.degree, education.school ? ` — ${education.school}` : ""]
													}),
													/* @__PURE__ */ jsx("p", {
														className: "text-xs text-muted-foreground",
														children: [education.start, education.end].filter(Boolean).join(" – ")
													}),
													education.details && /* @__PURE__ */ jsx("p", { children: education.details })
												] }, index))
											})] }),
											/* @__PURE__ */ jsxs("section", { children: [/* @__PURE__ */ jsx("h3", {
												className: "text-xs font-semibold uppercase tracking-wide text-primary",
												children: labels.skills
											}), /* @__PURE__ */ jsx("p", {
												className: "mt-2",
												children: cv.skills.length > 0 ? cv.skills.join(", ") : "No skills listed yet."
											})] })
										]
									})]
								}) : /* @__PURE__ */ jsxs("div", {
									className: "rounded-xl border border-dashed border-border p-12 text-center",
									children: [/* @__PURE__ */ jsx(Sparkles, { className: "mx-auto size-6 text-primary" }), /* @__PURE__ */ jsx("p", {
										className: "mt-3 text-sm text-muted-foreground",
										children: "No tailored CV yet. Answer a few interview questions, then hit “Tailor CV”."
									})]
								})
							}),
							/* @__PURE__ */ jsxs(TabsContent, {
								value: "letter",
								className: "mt-4 space-y-3",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ jsxs(Select, {
											value: normalizeTone(effectiveTone),
											onValueChange: setTone,
											children: [/* @__PURE__ */ jsx(SelectTrigger, {
												className: "w-56",
												children: /* @__PURE__ */ jsx(SelectValue, {})
											}), /* @__PURE__ */ jsx(SelectContent, { children: COVER_LETTER_TONES.map((item) => /* @__PURE__ */ jsx(SelectItem, {
												value: item.value,
												children: item.label
											}, item.value)) })]
										}),
										/* @__PURE__ */ jsxs(Button, {
											onClick: () => letterMutation.mutate(),
											disabled: letterMutation.isPending,
											children: [letterMutation.isPending ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsx(Wand2, { className: "size-4" }), "Generate"]
										}),
										letter && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs(Button, {
											variant: "outline",
											onClick: async () => {
												try {
													await navigator.clipboard.writeText(letter);
													setCopied(true);
													toast.success("Cover letter copied");
													setTimeout(() => setCopied(false), 2e3);
												} catch {
													toast.error("Couldn't copy — select the text and copy manually");
												}
											},
											children: [copied ? /* @__PURE__ */ jsx(Check, { className: "size-4" }) : /* @__PURE__ */ jsx(Copy, { className: "size-4" }), copied ? "Copied" : "Copy"]
										}), /* @__PURE__ */ jsxs(Button, {
											variant: "outline",
											onClick: () => downloadLetterPdf(letter, activeCv?.fullName ?? "", `Cover-Letter-${(company || "role").replace(/\s+/g, "-")}.pdf`),
											children: [/* @__PURE__ */ jsx(Download, { className: "size-4" }), " PDF"]
										})] })
									]
								}), /* @__PURE__ */ jsx(Textarea, {
									rows: 20,
									value: letter,
									onChange: (event) => setLetter(event.target.value),
									onBlur: () => update({ data: {
										id,
										coverLetter: letter
									} }),
									placeholder: "Your cover letter will appear here."
								})]
							}),
							/* @__PURE__ */ jsxs(TabsContent, {
								value: "prep",
								className: "mt-4 space-y-4",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ jsxs(Button, {
										onClick: () => prepMutation.mutate(),
										disabled: prepMutation.isPending,
										children: [prepMutation.isPending ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsx(Wand2, { className: "size-4" }), prep ? "Regenerate questions" : "Generate questions"]
									}), prep && prep.questions.length > 0 && /* @__PURE__ */ jsxs(Button, {
										variant: "outline",
										onClick: async () => {
											try {
												await navigator.clipboard.writeText(prepToPlainText(prep));
												setPrepCopied(true);
												toast.success("Prep sheet copied");
												setTimeout(() => setPrepCopied(false), 2e3);
											} catch {
												toast.error("Couldn't copy — select the text and copy manually");
											}
										},
										children: [prepCopied ? /* @__PURE__ */ jsx(Check, { className: "size-4" }) : /* @__PURE__ */ jsx(Copy, { className: "size-4" }), prepCopied ? "Copied" : "Copy all"]
									})]
								}), prep && prep.questions.length > 0 ? /* @__PURE__ */ jsx(Accordion, {
									type: "multiple",
									className: "rounded-xl border border-border bg-card px-4",
									children: prep.questions.map((item, index) => /* @__PURE__ */ jsxs(AccordionItem, {
										value: `q-${index}`,
										children: [/* @__PURE__ */ jsx(AccordionTrigger, {
											className: "text-left",
											children: /* @__PURE__ */ jsxs("span", {
												className: "flex flex-1 items-start gap-3 pr-3",
												children: [/* @__PURE__ */ jsx("span", {
													className: "mt-0.5 shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground",
													children: CATEGORY_LABELS[item.category]
												}), /* @__PURE__ */ jsx("span", {
													className: "text-sm font-medium",
													children: item.question
												})]
											})
										}), /* @__PURE__ */ jsxs(AccordionContent, {
											className: "space-y-3 text-sm leading-relaxed",
											children: [
												item.why && /* @__PURE__ */ jsxs("p", {
													className: "text-muted-foreground",
													children: [/* @__PURE__ */ jsx("span", {
														className: "font-medium text-foreground",
														children: "Why they ask: "
													}), item.why]
												}),
												item.answer && /* @__PURE__ */ jsx("p", {
													className: "whitespace-pre-wrap rounded-lg bg-muted/40 p-3",
													children: item.answer
												}),
												item.isGap && /* @__PURE__ */ jsx("p", {
													className: "text-xs text-muted-foreground",
													children: "This is a gap versus the offer — the answer bridges it honestly."
												}),
												/* @__PURE__ */ jsxs(Button, {
													variant: "ghost",
													size: "sm",
													onClick: async () => {
														try {
															await navigator.clipboard.writeText(`${item.question}\n\n${item.answer}`);
															toast.success("Question and answer copied");
														} catch {
															toast.error("Couldn't copy — select the text and copy manually");
														}
													},
													children: [/* @__PURE__ */ jsx(Copy, { className: "size-4" }), " Copy"]
												})
											]
										})]
									}, `${index}-${item.question}`))
								}) : /* @__PURE__ */ jsxs("div", {
									className: "rounded-xl border border-dashed border-border p-12 text-center",
									children: [/* @__PURE__ */ jsx(Sparkles, { className: "mx-auto size-6 text-primary" }), /* @__PURE__ */ jsx("p", {
										className: "mt-3 text-sm text-muted-foreground",
										children: "No interview questions yet. Generate the likely screening questions for this role, each with a draft answer from your own CV."
									})]
								})]
							}),
							/* @__PURE__ */ jsx(TabsContent, {
								value: "offer",
								className: "mt-4",
								children: /* @__PURE__ */ jsxs("div", {
									className: "space-y-5",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "relative flex min-h-[320px] flex-col rounded-xl border border-border bg-card",
										children: [(!summary || isEmptySummary(summary)) && /* @__PURE__ */ jsxs("div", {
											className: "absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-card/80 p-6 text-center backdrop-blur-sm",
											children: [
												/* @__PURE__ */ jsx(Sparkles, { className: "size-8 text-primary" }),
												/* @__PURE__ */ jsx("p", {
													className: "mt-3 max-w-xs text-sm font-medium",
													children: "Summarize offer"
												}),
												/* @__PURE__ */ jsx("p", {
													className: "mt-1 max-w-xs text-xs text-muted-foreground",
													children: "Let AI read the job description and extract the key details so you can review them at a glance."
												}),
												/* @__PURE__ */ jsxs(Button, {
													variant: "outline",
													size: "sm",
													className: "mt-4",
													onClick: () => summaryMutation.mutate(),
													disabled: summaryMutation.isPending || !offerText.trim(),
													children: [summaryMutation.isPending ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsx(Sparkles, { className: "size-4" }), "Summarize offer"]
												})
											]
										}), /* @__PURE__ */ jsx("div", {
											className: cn("flex-1", !summary || isEmptySummary(summary) ? "opacity-50" : ""),
											children: /* @__PURE__ */ jsxs("div", {
												className: "space-y-6 p-6",
												children: [/* @__PURE__ */ jsxs("div", {
													className: "flex items-center justify-between gap-3",
													children: [/* @__PURE__ */ jsx("h3", {
														className: "font-display text-lg font-semibold",
														children: "Offer summary"
													}), summary && !isEmptySummary(summary) && /* @__PURE__ */ jsxs(Button, {
														variant: "ghost",
														size: "sm",
														onClick: () => summaryMutation.mutate(),
														disabled: summaryMutation.isPending,
														children: [summaryMutation.isPending ? /* @__PURE__ */ jsx(Spinner, {}) : /* @__PURE__ */ jsx(RefreshCw, { className: "size-4" }), "Refresh"]
													})]
												}), /* @__PURE__ */ jsxs("div", {
													className: "space-y-5",
													children: [
														/* @__PURE__ */ jsxs("div", {
															className: "grid gap-4 sm:grid-cols-2",
															children: [
																/* @__PURE__ */ jsxs("div", {
																	className: "space-y-1",
																	children: [/* @__PURE__ */ jsxs("p", {
																		className: "flex items-center gap-2 text-xs text-muted-foreground",
																		children: [/* @__PURE__ */ jsx(Building2, { className: "size-3.5" }), " Company"]
																	}), /* @__PURE__ */ jsx("p", {
																		className: "text-sm font-medium",
																		children: company || "—"
																	})]
																}),
																/* @__PURE__ */ jsxs("div", {
																	className: "space-y-1",
																	children: [/* @__PURE__ */ jsxs("p", {
																		className: "flex items-center gap-2 text-xs text-muted-foreground",
																		children: [/* @__PURE__ */ jsx(Briefcase, { className: "size-3.5" }), " Role"]
																	}), /* @__PURE__ */ jsx("p", {
																		className: "text-sm font-medium",
																		children: roleTitle || "—"
																	})]
																}),
																summary?.salaryText ? /* @__PURE__ */ jsxs("div", {
																	className: "space-y-1",
																	children: [/* @__PURE__ */ jsxs("p", {
																		className: "flex items-center gap-2 text-xs text-muted-foreground",
																		children: [/* @__PURE__ */ jsx(Banknote, { className: "size-3.5" }), " Salary"]
																	}), /* @__PURE__ */ jsx("p", {
																		className: "text-sm font-medium",
																		children: summary.salaryText
																	})]
																}) : null,
																summary?.location ? /* @__PURE__ */ jsxs("div", {
																	className: "space-y-1",
																	children: [/* @__PURE__ */ jsxs("p", {
																		className: "flex items-center gap-2 text-xs text-muted-foreground",
																		children: [/* @__PURE__ */ jsx(MapPin, { className: "size-3.5" }), " Location"]
																	}), /* @__PURE__ */ jsx("p", {
																		className: "text-sm font-medium",
																		children: summary.location
																	})]
																}) : null
															]
														}),
														summary?.summary ? /* @__PURE__ */ jsxs("div", {
															className: "space-y-1",
															children: [/* @__PURE__ */ jsxs("p", {
																className: "flex items-center gap-2 text-xs text-muted-foreground",
																children: [/* @__PURE__ */ jsx(FileText, { className: "size-3.5" }), " Brief description"]
															}), /* @__PURE__ */ jsx("p", {
																className: "text-sm leading-relaxed text-muted-foreground",
																children: summary.summary
															})]
														}) : null,
														summary && summary.skills.length > 0 ? /* @__PURE__ */ jsxs("div", {
															className: "space-y-2",
															children: [/* @__PURE__ */ jsx("p", {
																className: "text-xs text-muted-foreground",
																children: "Skills"
															}), /* @__PURE__ */ jsx("div", {
																className: "flex flex-wrap gap-1.5",
																children: summary.skills.map((skill) => /* @__PURE__ */ jsx("span", {
																	className: "rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground",
																	children: skill
																}, skill))
															})]
														}) : null
													]
												})]
											})
										})]
									}), /* @__PURE__ */ jsxs("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ jsx("h4", {
											className: "text-sm font-medium",
											children: "Raw offer description"
										}), /* @__PURE__ */ jsx(Textarea, {
											rows: 12,
											value: offerText,
											onChange: (event) => setOfferText(event.target.value),
											onBlur: () => update({ data: {
												id,
												offerText
											} }),
											placeholder: "Paste the full job description here. The AI will use it to tailor your CV and draft questions."
										})]
									})]
								})
							})
						]
					})]
				}), /* @__PURE__ */ jsxs("aside", {
					className: "flex h-[calc(100vh-11rem)] flex-col overflow-hidden rounded-xl border border-border bg-card lg:sticky lg:top-20",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "border-b border-border px-5 py-3",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "font-display text-sm font-semibold",
									children: "Tailoring interview"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-xs text-muted-foreground",
									children: "Answer the questions, then re-run “Tailor CV”."
								}),
								/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => setShowDossier((open) => !open),
									className: "mt-2 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground",
									children: [showDossier ? "Hide" : "Show", " what we already know about you"]
								}),
								showDossier && /* @__PURE__ */ jsx("div", {
									className: "mt-2 max-h-56 overflow-y-auto rounded-lg bg-muted/50 p-3 text-xs whitespace-pre-wrap text-muted-foreground",
									children: dossierQuery.data?.content?.trim() ? dossierQuery.data.content : "Nothing recorded yet — your answers below build this up."
								})
							]
						}),
						/* @__PURE__ */ jsxs(Conversation, {
							className: "flex-1",
							children: [/* @__PURE__ */ jsxs(ConversationContent, { children: [
								visibleMessages.length === 0 && !busy && /* @__PURE__ */ jsx(ConversationEmptyState, {
									title: "Let's find the gaps",
									description: "The coach is reviewing this offer against your profile."
								}),
								visibleMessages.map((message) => /* @__PURE__ */ jsx(Message, {
									from: message.role,
									children: /* @__PURE__ */ jsx(MessageContent, { children: /* @__PURE__ */ jsx(MessageResponse, { children: chatMessageText(message) }) })
								}, message.id)),
								status === "submitted" && /* @__PURE__ */ jsx(Shimmer, { children: "Reviewing your CV…" })
							] }), /* @__PURE__ */ jsx(ConversationScrollButton, {})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "border-t border-border p-3",
							children: /* @__PURE__ */ jsxs(PromptInput, {
								onSubmit: handleSend,
								children: [/* @__PURE__ */ jsx(PromptInputTextarea, {
									autoFocus: true,
									value: input,
									onChange: (event) => setInput(event.target.value),
									placeholder: "Answer, or ask what's missing…"
								}), /* @__PURE__ */ jsx(PromptInputFooter, {
									className: "justify-end",
									children: /* @__PURE__ */ jsx(PromptInputSubmit, {
										status,
										disabled: !input.trim()
									})
								})]
							})
						})
					]
				})]
			})
		]
	}) });
}
//#endregion
export { Workspace as component };
