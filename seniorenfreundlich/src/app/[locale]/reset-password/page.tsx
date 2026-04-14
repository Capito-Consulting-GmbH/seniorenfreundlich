"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/src/i18n/navigation";
import { resetPassword } from "@/src/lib/auth-client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Check, X } from "lucide-react";

const PASSWORD_RULES = [
  { key: "passwordReqMin" as const,     test: (p: string) => p.length >= 8 },
  { key: "passwordReqUpper" as const,   test: (p: string) => /[A-Z]/.test(p) },
  { key: "passwordReqLower" as const,   test: (p: string) => /[a-z]/.test(p) },
  { key: "passwordReqNumber" as const,  test: (p: string) => /[0-9]/.test(p) },
  { key: "passwordReqSpecial" as const, test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const ruleResults = PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) }));
  const passwordValid = ruleResults.every((r) => r.passed);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertDescription>{t("resetInvalidToken")}</AlertDescription>
            </Alert>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link href="/forgot-password" className="underline underline-offset-4 hover:text-foreground">
                {t("forgotTitle")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!passwordValid) {
      setPasswordTouched(true);
      setError(t("passwordErrorWeak"));
      return;
    }

    setLoading(true);

    const { error: resetError } = await resetPassword({ newPassword: password, token: token! });

    if (resetError) {
      setError(
        resetError.status === 400 ? t("resetInvalidToken") : t("errorGeneric")
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/sign-in"), 2500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("resetTitle")}</CardTitle>
          <CardDescription>{t("resetSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <Alert>
              <AlertDescription>{t("resetSuccess")}</AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("resetNewPassword")}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordTouched(true);
                  }}
                />
                {passwordTouched && (
                  <ul className="mt-2 space-y-1">
                    {ruleResults.map((r) => (
                      <li key={r.key} className="flex items-center gap-1.5 text-xs">
                        {r.passed ? (
                          <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                        )}
                        <span className={r.passed ? "text-muted-foreground" : "text-destructive"}>
                          {t(r.key)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("resetSubmitting") : t("resetSubmit")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
