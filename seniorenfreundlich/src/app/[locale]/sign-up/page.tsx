"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { signUp } from "@/src/lib/auth-client";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Check, X } from "lucide-react";

const PASSWORD_RULES = [
  { key: "passwordReqMin" as const,     test: (p: string) => p.length >= 8 },
  { key: "passwordReqUpper" as const,   test: (p: string) => /[A-Z]/.test(p) },
  { key: "passwordReqLower" as const,   test: (p: string) => /[a-z]/.test(p) },
  { key: "passwordReqNumber" as const,  test: (p: string) => /[0-9]/.test(p) },
  { key: "passwordReqSpecial" as const, test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export default function SignUpPage() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ruleResults = PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) }));
  const passwordValid = ruleResults.every((r) => r.passed);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!passwordValid) {
      setPasswordTouched(true);
      setError(t("passwordErrorWeak"));
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp.email({
      name,
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (signUpError) {
      setError(t("errorGeneric"));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("signUpTitle")}</CardTitle>
          <CardDescription>{t("signUpSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("nameLabel")}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t("namePlaceholder")}
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("passwordLabel")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
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

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "…" : t("submitSignUp")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/sign-in" className="underline underline-offset-4 hover:text-foreground">
              {t("switchToSignIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
