"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createCompanyAction, type CreateCompanyState } from "@/src/actions/createCompany";

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
      <h1 className="text-2xl font-semibold text-zinc-900">{t("title")}</h1>
      <p className="mt-2 text-zinc-600">{t("subtitle")}</p>

      {state.errors?._form && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {state.errors._form.join(", ")}
        </div>
      )}

      <form action={action} className="mt-8 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
            {t("labelName")} <span className="text-red-500">*</span>
          </label>
          <input
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
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
          {state.errors?.name && (
            <p className="mt-1 text-xs text-red-600">{state.errors.name.join(", ")}</p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-zinc-700">
            {t("labelSlug")} <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500">
              {t("slugPrefix")}
            </span>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              placeholder="muster-gmbh"
              value={slug}
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
              className="block w-full rounded-r-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            />
          </div>
          <p className="mt-1 text-xs text-zinc-500">{t("slugHint")}</p>
          {state.errors?.slug && (
            <p className="mt-1 text-xs text-red-600">{state.errors.slug.join(", ")}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? t("submitting") : t("submit")}
        </button>
      </form>
    </div>
  );
}
