import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRouterState } from "@tanstack/react-router";
import { ImagePlus, LifeBuoy, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { submitIssue, submitReview } from "@/lib/feedback.functions";
import { supabase } from "@/integrations/supabase/client";
import { APP_VERSION, collectClientInfo } from "@/lib/client-info";
import { cn } from "@/lib/utils";

/** Sticky helper: report a bug or leave a review from anywhere in the app. */
export function SupportButton() {
  const [open, setOpen] = useState(false);
  const [issue, setIssue] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [mayQuote, setMayQuote] = useState(false);
  const [shot, setShot] = useState<File | null>(null);
  const [shotPreview, setShotPreview] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const sendIssue = useServerFn(submitIssue);
  const sendReview = useServerFn(submitReview);

  function pickScreenshot(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Screenshots must be under 5 MB.");
      return;
    }
    setShot(file);
    setShotPreview(URL.createObjectURL(file));
  }

  function clearScreenshot() {
    setShot(null);
    setShotPreview(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  const issueMutation = useMutation({
    mutationFn: async () => {
      let screenshotPath: string | null = null;
      if (shot) {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (!userId)
          throw new Error("Please sign in again to attach a screenshot.");
        const extension = (shot.name.split(".").pop() ?? "png")
          .toLowerCase()
          .slice(0, 5);
        const path = `${userId}/${crypto.randomUUID()}.${extension}`;
        const { error } = await supabase.storage
          .from("issue-screenshots")
          .upload(path, shot, { contentType: shot.type, upsert: false });
        if (error)
          throw new Error(`Screenshot upload failed: ${error.message}`);
        screenshotPath = path;
      }
      return sendIssue({
        data: {
          message: issue,
          route: pathname,
          userAgent:
            typeof navigator === "undefined" ? "" : navigator.userAgent,
          screenshotPath,
          clientInfo: { ...collectClientInfo(), route: pathname },
        },
      });
    },
    onSuccess: () => {
      toast.success("Thanks — we got your report.");
      setIssue("");
      clearScreenshot();
      setOpen(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      sendReview({
        data: { rating, message: review, source: "general", mayQuote },
      }),
    onSuccess: () => {
      toast.success("Thank you for the feedback!");
      setReview("");
      setOpen(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 gap-2 rounded-full border border-border shadow-lg"
      >
        <LifeBuoy className="size-4" /> Help
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tell us what's going on</DialogTitle>
            <DialogDescription>
              Report something broken, or let us know how TailorCV is working
              for you.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="issue">
            <TabsList className="w-full">
              <TabsTrigger value="issue" className="flex-1">
                Report an issue
              </TabsTrigger>
              <TabsTrigger value="review" className="flex-1">
                Share feedback
              </TabsTrigger>
            </TabsList>

            <TabsContent value="issue" className="space-y-3 pt-3">
              <Textarea
                rows={5}
                value={issue}
                onChange={(event) => setIssue(event.target.value)}
                placeholder="What happened? What were you doing right before?"
              />
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  pickScreenshot(event.target.files?.[0] ?? null)
                }
              />

              {shotPreview ? (
                <div className="relative overflow-hidden rounded-lg border border-border">
                  <img
                    src={shotPreview}
                    alt="Screenshot attached to the issue report"
                    className="max-h-48 w-full object-contain bg-muted"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-2 top-2 size-7 rounded-full"
                    onClick={clearScreenshot}
                    aria-label="Remove screenshot"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => fileInput.current?.click()}
                >
                  <ImagePlus className="size-4" /> Attach a screenshot
                </Button>
              )}

              <p className="text-xs text-muted-foreground">
                We attach the page you were on ({pathname}), your device,
                browser and app version (v{APP_VERSION}), and the date. No CV
                content is sent.
              </p>
              <Button
                className="w-full"
                disabled={issue.trim().length < 5 || issueMutation.isPending}
                onClick={() => issueMutation.mutate()}
              >
                {issueMutation.isPending ? "Sending…" : "Send report"}
              </Button>
            </TabsContent>

            <TabsContent value="review" className="space-y-3 pt-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                    onClick={() => setRating(value)}
                    className="p-1"
                  >
                    <Star
                      className={cn(
                        "size-6 transition-colors",
                        value <= rating
                          ? "fill-primary text-primary"
                          : "text-muted-foreground/40",
                      )}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                rows={4}
                value={review}
                onChange={(event) => setReview(event.target.value)}
                placeholder="What worked well? What would you change?"
              />
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <Label htmlFor="may-quote" className="text-sm font-normal">
                  You may quote me publicly
                </Label>
                <Switch
                  id="may-quote"
                  checked={mayQuote}
                  onCheckedChange={setMayQuote}
                />
              </div>
              <Button
                className="w-full"
                disabled={reviewMutation.isPending}
                onClick={() => reviewMutation.mutate()}
              >
                {reviewMutation.isPending ? "Sending…" : "Send feedback"}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
