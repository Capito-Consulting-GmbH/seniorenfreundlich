"use client";

import { useState, useActionState } from "react";
import { useTranslations } from "next-intl";
import { createCompanyAction, type CreateCompanyState } from "@/src/actions/createCompany";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
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

export function Step2CompanyDetails() {
  const t = useTranslations("dashboard.onboarding");
  const [state, action, pending] = useActionState(createCompanyAction, initialState);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground">{t("step2Title")}</h2>
      <p className="mt-1 text-muted-foreground">{t("step2Subtitle")}</p>

      {state.errors?._form && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{state.errors._form.join(", ")}</AlertDescription>
        </Alert>
      )}

      <form action={action} className="mt-6 space-y-5">
        {/* Company name */}
        <div className="space-y-1.5">
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
              if (!slugEdited) setSlug(slugify(nextName));
            }}
          />
          {state.errors?.name && (
            <p className="text-xs text-destructive">{state.errors.name.join(", ")}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-1.5">
          <Label htmlFor="slug">
            {t("labelSlug")} <span className="text-destructive">*</span>
          </Label>
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground whitespace-nowrap">
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

        {/* Company email (required — used for verification) */}
        <div className="space-y-1.5">
          <Label htmlFor="email">
            {t("labelEmail")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="info@muster-gmbh.de"
          />
          <p className="text-xs text-muted-foreground">{t("labelEmailHint")}</p>
          {state.errors?.email && (
            <p className="text-xs text-destructive">{state.errors.email.join(", ")}</p>
          )}
        </div>

        {/* HRB number (optional) */}
        <div className="space-y-1.5">
          <Label htmlFor="hrbNumber">{t("labelHrb")}</Label>
          <Input
            id="hrbNumber"
            name="hrbNumber"
            type="text"
            placeholder="HRB 12345 München"
          />
          <p className="text-xs text-muted-foreground">{t("labelHrbHint")}</p>
          {state.errors?.hrbNumber && (
            <p className="text-xs text-destructive">{state.errors.hrbNumber.join(", ")}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">{t("labelPhone")}</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+49 89 123456" />
          {state.errors?.phone && (
            <p className="text-xs text-destructive">{state.errors.phone.join(", ")}</p>
          )}
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <Label htmlFor="website">{t("labelWebsite")}</Label>
          <Input id="website" name="website" type="text" placeholder="https://muster-gmbh.de" />
          {state.errors?.website && (
            <p className="text-xs text-destructive">{state.errors.website.join(", ")}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label htmlFor="address">{t("labelAddress")}</Label>
          <Input id="address" name="address" type="text" placeholder="Musterstraße 1" />
          {state.errors?.address && (
            <p className="text-xs text-destructive">{state.errors.address.join(", ")}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="postalCode">{t("labelPostalCode")}</Label>
            <Input
              id="postalCode"
              name="postalCode"
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="80331"
            />
            {state.errors?.postalCode && (
              <p className="text-xs text-destructive">{state.errors.postalCode.join(", ")}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">{t("labelCity")}</Label>
            <Input id="city" name="city" type="text" placeholder="München" />
            {state.errors?.city && (
              <p className="text-xs text-destructive">{state.errors.city.join(", ")}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">{t("labelDescription")}</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Kurze Beschreibung Ihres Unternehmens…"
            className="resize-none"
          />
          {state.errors?.description && (
            <p className="text-xs text-destructive">{state.errors.description.join(", ")}</p>
          )}
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </div>
  );
}
