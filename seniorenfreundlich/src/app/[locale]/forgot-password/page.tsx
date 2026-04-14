"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/navigation";
import { requestPasswordReset } from "@/src/lib/auth-client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { env } from "@/src/env";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Always show the success message regardless of whether the email exists
    // to prevent user enumeration (OWASP best practice).
    await requestPasswordReset({
      email,
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("forgotTitle")}</CardTitle>
          <CardDescription>{t("forgotSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>{t("forgotSuccess")}</AlertDescription>
              </Alert>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/sign-in" className="underline underline-offset-4 hover:text-foreground">
                  {t("forgotBackToSignIn")}
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("forgotSubmitting") : t("forgotSubmit")}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/sign-in" className="underline underline-offset-4 hover:text-foreground">
                  {t("forgotBackToSignIn")}
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
