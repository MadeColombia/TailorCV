import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AlertTriangle, Archive, CheckCircle2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { exportAccountArchive } from "@/lib/user-settings.functions";
import { useUiStrings } from "@/lib/ui-strings";

type Factor = { id: string; status: string };

/**
 * Two-factor authentication setup and full-account zip export. The sections are
 * kept separate: the export is locked behind an overlay until 2FA is verified.
 */
export function TwoFactorExport({ title, hint }: { title: string; hint: string }) {
  const t = useUiStrings();
  const runExport = useServerFn(exportAccountArchive);
  const [factor, setFactor] = useState<Factor | null>(null);
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(
    null,
  );
  const [enrollCode, setEnrollCode] = useState("");
  const [exportCode, setExportCode] = useState("");
  const [loading, setLoading] = useState(true);

  const refreshFactors = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const totp = data?.totp?.find((item) => item.status === "verified") ?? null;
    setFactor(totp ? { id: totp.id, status: totp.status } : null);
    setLoading(false);
  };

  useEffect(() => {
    void refreshFactors();
  }, []);

  const startEnroll = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error || !data) {
      toast.error(error?.message ?? "Couldn't start two-factor setup.");
      return;
    }
    setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verifyEnrollMutation = useMutation({
    mutationFn: async () => {
      if (!enrolling?.id) throw new Error("Set up two-factor authentication first.");
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enrolling.id,
        code: enrollCode.trim(),
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setEnrolling(null);
      setEnrollCode("");
      void refreshFactors();
      toast.success("Two-factor authentication enabled");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!factor?.id) throw new Error("Enable two-factor authentication first.");
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factor.id,
        code: exportCode.trim(),
      });
      if (error) throw new Error(error.message);
      return runExport();
    },
    onSuccess: (result) => {
      setExportCode("");
      const bytes = Uint8Array.from(atob(result.base64), (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/zip" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Your archive is downloading");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const isEnabled = !loading && factor !== null && enrolling === null;

  return (
    <>
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 text-primary" />
          <div className="flex-1">
            <h2 className="font-medium">{t.authenticatorTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.authenticatorHint}</p>

            {loading ? (
              <p className="mt-4 text-sm text-muted-foreground">Checking your security setup…</p>
            ) : factor ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="size-4" />
                {t.authenticatorEnabled}
              </div>
            ) : enrolling ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <p className="text-sm">{t.authenticatorScanQr}</p>
                  <img
                    src={enrolling.qr}
                    alt="Two-factor authentication QR code"
                    className="mt-3 size-40 rounded bg-white p-2"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t.authenticatorManualKey}: {enrolling.secret}
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="enroll-mfa-code">{t.authenticatorCodeLabel}</Label>
                    <Input
                      id="enroll-mfa-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      className="w-36 tracking-[0.3em]"
                      value={enrollCode}
                      onChange={(event) => setEnrollCode(event.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                    />
                  </div>
                  <Button
                    size="sm"
                    disabled={enrollCode.trim().length !== 6 || verifyEnrollMutation.isPending}
                    onClick={() => verifyEnrollMutation.mutate()}
                  >
                    {verifyEnrollMutation.isPending ? <Spinner /> : <ShieldCheck className="size-4" />}
                    {t.authenticatorVerifyButton}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">{t.authenticatorDisabled}</p>
                <Button variant="outline" size="sm" onClick={() => void startEnroll()}>
                  <ShieldCheck className="size-4" /> {t.authenticatorSetupButton}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative rounded-xl border border-border bg-card p-6">
        {!isEnabled ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-card/80 p-6 text-center backdrop-blur-sm">
            <AlertTriangle className="size-8 text-amber-500" />
            <p className="mt-3 max-w-xs text-sm font-medium">{t.exportDisabled}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                if (!enrolling) void startEnroll();
              }}
            >
              <ShieldCheck className="size-4" /> {t.exportEnableButton}
            </Button>
          </div>
        ) : null}
        <div className={isEnabled ? "" : "opacity-50"}>
          <div className="flex items-start gap-3">
            <Archive className="mt-0.5 size-5 text-primary" />
            <div className="flex-1">
              <h2 className="font-medium">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{hint}</p>

              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="export-mfa-code">{t.authenticatorCodeLabel}</Label>
                  <Input
                    id="export-mfa-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className="w-36 tracking-[0.3em]"
                    value={exportCode}
                    onChange={(event) => setExportCode(event.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    disabled={!isEnabled}
                  />
                </div>
                <Button
                  size="sm"
                  disabled={!isEnabled || exportCode.trim().length !== 6 || exportMutation.isPending}
                  onClick={() => exportMutation.mutate()}
                >
                  {exportMutation.isPending ? <Spinner /> : <Archive className="size-4" />}
                  Verify and download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
