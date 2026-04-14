"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import {
  sendVerificationEmailAction,
  type SendVerificationEmailState,
} from "@/src/actions/sendVerificationEmail";
import {
  verifyCompanyEmailAction,
  type VerifyCompanyEmailState,
} from "@/src/actions/verifyCompanyEmail";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Separator } from "@/src/components/ui/separator";

type Props = {
  companyEmail: string | null;
  verificationStatus: string;
};

const initialSendState: SendVerificationEmailState = {};
const initialVerifyState: VerifyCompanyEmailState = {};

export function Step3EmailVerification({ companyEmail, verificationStatus }: Props) {
  const t = useTranslations("dashboard.onboarding");

  const [sendState, sendAction, sendPending] = useActionState(
    sendVerificationEmailAction,
    initialSendState
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyCompanyEmailAction,
    initialVerifyState
  );

  // Show the code-entry form if a code was already sent (pending status) or just sent now
  const codeWasSent = verificationStatus === "pending" || sendState.success;
  const emailDisplay = sendState.email ?? companyEmail;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{t("step3Title")}</h2>
        <p className="mt-1 text-muted-foreground">{t("step3Subtitle")}</p>
      </div>

      {!codeWasSent && (
        <div className="space-y-4">
          {emailDisplay && (
            <p className="text-sm text-muted-foreground">
              {t("labelEmail")}:{" "}
              <span className="font-medium text-foreground">{emailDisplay}</span>
            </p>
          )}

          {sendState.error && (
            <Alert variant="destructive">
              <AlertDescription>{sendState.error}</AlertDescription>
            </Alert>
          )}

          <form action={sendAction}>
            <Button type="submit" disabled={sendPending}>
              {sendPending ? t("sendingCode") : t("sendCode")}
            </Button>
          </form>
        </div>
      )}

      {codeWasSent && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("codeSentTo")}:{" "}
            <span className="font-medium text-foreground">{emailDisplay}</span>
          </p>

          {verifyState.error && (
            <Alert variant="destructive">
              <AlertDescription>{verifyState.error}</AlertDescription>
            </Alert>
          )}

          <form action={verifyAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="code">{t("labelCode")}</Label>
              <Input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                autoComplete="one-time-code"
                placeholder="000000"
                className="text-center tracking-[0.3em] text-lg max-w-[160px]"
                required
              />
            </div>
            <Button type="submit" disabled={verifyPending}>
              {verifyPending ? t("verifying") : t("verify")}
            </Button>
          </form>

          {/* Resend */}
          <form action={sendAction}>
            <Button type="submit" variant="ghost" size="sm" disabled={sendPending}>
              {sendPending ? t("sendingCode") : t("resendCode")}
            </Button>
          </form>

          {sendState.success && (
            <p className="text-sm text-green-600">
              ✓ {t("codeSentTo")} {emailDisplay}
            </p>
          )}
        </div>
      )}

      <Separator />

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{t("skipHint")}</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">{t("skipVerification")}</Link>
        </Button>
      </div>
    </div>
  );
}
