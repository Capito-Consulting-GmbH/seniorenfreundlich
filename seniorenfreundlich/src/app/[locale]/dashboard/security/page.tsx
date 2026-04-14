"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession, changePassword, changeEmail } from "@/src/lib/auth-client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Check, X } from "lucide-react";

const PASSWORD_RULES = [
  { key: "passwordReqMin" as const,     test: (p: string) => p.length >= 8 },
  { key: "passwordReqUpper" as const,   test: (p: string) => /[A-Z]/.test(p) },
  { key: "passwordReqLower" as const,   test: (p: string) => /[a-z]/.test(p) },
  { key: "passwordReqNumber" as const,  test: (p: string) => /[0-9]/.test(p) },
  { key: "passwordReqSpecial" as const, test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export default function SecurityPage() {
  const tSecurity = useTranslations("security");
  const tAuth = useTranslations("auth");
  const { data: session } = useSession();

  // --- Email change state ---
  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    setEmailLoading(true);

    const { error } = await changeEmail({
      newEmail,
      callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/security`,
    });

    if (error) {
      setEmailError(tSecurity("errorGeneric"));
      setEmailLoading(false);
      return;
    }

    setEmailSuccess(true);
    setNewEmail("");
    setEmailLoading(false);
  }

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const ruleResults = PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(newPassword) }));
  const passwordValid = ruleResults.every((r) => r.passed);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!passwordValid) {
      setNewPasswordTouched(true);
      setError(tAuth("passwordErrorWeak"));
      return;
    }

    setLoading(true);

    const { error: changeError } = await changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (changeError) {
      setError(
        changeError.status === 400
          ? tSecurity("errorWrongPassword")
          : tSecurity("errorGeneric")
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordTouched(false);
    setLoading(false);
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-foreground">{tSecurity("title")}</h1>

      {/* Change email */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">{tSecurity("changeEmailTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {session?.user?.email && (
            <p className="mb-4 text-sm text-muted-foreground">
              {tSecurity("currentEmail")}: <span className="font-medium text-foreground">{session.user.email}</span>
            </p>
          )}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newEmail">{tSecurity("newEmail")}</Label>
              <Input
                id="newEmail"
                type="email"
                autoComplete="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            {emailError && <Alert variant="destructive"><AlertDescription>{emailError}</AlertDescription></Alert>}
            {emailSuccess && <Alert><AlertDescription>{tSecurity("emailSuccess")}</AlertDescription></Alert>}
            <Button type="submit" disabled={emailLoading}>
              {emailLoading ? tSecurity("submittingEmail") : tSecurity("submitEmail")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">{tSecurity("changePasswordTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">{tSecurity("currentPassword")}</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">{tSecurity("newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setNewPasswordTouched(true);
                }}
              />
              {newPasswordTouched && (
                <ul className="mt-2 space-y-1">
                  {ruleResults.map((r) => (
                    <li key={r.key} className="flex items-center gap-1.5 text-xs">
                      {r.passed ? (
                        <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                      )}
                      <span className={r.passed ? "text-muted-foreground" : "text-destructive"}>
                        {tAuth(r.key)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert><AlertDescription>{tSecurity("success")}</AlertDescription></Alert>}

            <Button type="submit" disabled={loading}>
              {loading ? tSecurity("submitting") : tSecurity("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
