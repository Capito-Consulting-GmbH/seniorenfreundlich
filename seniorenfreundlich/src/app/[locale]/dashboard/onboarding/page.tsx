"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createCompanyAction, type CreateCompanyState } from "@/src/actions/createCompany";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

const initialState: CreateCompanyState = {};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function OnboardingPage() {
  const t = useTranslations("dashboard.onboarding");
  const [state, action, pending] = useActionState(createCompanyAction, initialState);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>

      {state.errors?._form && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{state.errors._form.join(", ")}</AlertDescription>
        </Alert>
      )}

      <form action={action} className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            {t("labelName")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Muster GmbH"
            value={name}
            onChange={(e) => {
              const nextName = e.target.value;
              setName(nextName);
              if (!slugEdited) {
                setSlug(slugify(nextName));
              }
            }}
          />
          {state.errors?.name && (
            <p className="text-xs text-destructive">{state.errors.name.join(", ")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            {t("labelSlug")} <span className="text-destructive">*</span>
          </Label>
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
              {t("slugPrefix")}
            </span>
            <Input
              id="slug"
              name="slug"
              type="text"
              required
              placeholder="muster-gmbh"
              value={slug}
              className="rounded-l-none"
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(slugify(e.target.value));
              }}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                  setSlugEdited(true);
                  setSlug((prev) => slugify(`${prev}-`));
                }
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{t("slugHint")}</p>
          {state.errors?.slug && (
            <p className="text-xs text-destructive">{state.errors.slug.join(", ")}</p>
          )}
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </div>
  );
}
