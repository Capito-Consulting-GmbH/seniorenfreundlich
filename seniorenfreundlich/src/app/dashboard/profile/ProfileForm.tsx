"use client";

import { useActionState } from "react";
import { updateCompanyProfileAction, type UpdateCompanyProfileState } from "@/src/actions/updateCompanyProfile";
import type { Company } from "@/src/services/companyService";
import LogoUpload from "./LogoUpload";

const initialState: UpdateCompanyProfileState = {};

export default function ProfileForm({ company }: { company: Company }) {
  const [state, action, pending] = useActionState(updateCompanyProfileAction, initialState);
  const logoUrl = state.logoUrl ?? company.logoUrl ?? null;

  return (
    <div className="mt-8">
      {state.success && (
        <div className="mb-6 rounded-md bg-green-50 p-3 text-sm text-green-700">
          Profil gespeichert.
        </div>
      )}
      {state.errors?._form && (
        <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {state.errors._form.join(", ")}
        </div>
      )}

      <form action={action} className="space-y-6">
        <LogoUpload logoUrl={logoUrl} />

        <Field
          label="Unternehmensname"
          name="name"
          required
          defaultValue={company.name}
          error={state.errors?.name}
        />
        <Field
          label="Beschreibung"
          name="description"
          type="textarea"
          defaultValue={company.description ?? ""}
          error={state.errors?.description}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Website"
            name="website"
            type="text"
            placeholder="www.example.de"
            defaultValue={company.website ?? ""}
            error={state.errors?.website}
          />
          <Field
            label="Telefon"
            name="phone"
            type="tel"
            defaultValue={company.phone ?? ""}
            error={state.errors?.phone}
          />
        </div>
        <Field
          label="E-Mail (öffentlich)"
          name="email"
          type="email"
          defaultValue={company.email ?? ""}
          error={state.errors?.email}
        />
        <Field
          label="Straße & Hausnummer"
          name="address"
          defaultValue={company.address ?? ""}
          error={state.errors?.address}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Postleitzahl"
            name="postalCode"
            placeholder="12345"
            defaultValue={company.postalCode ?? ""}
            error={state.errors?.postalCode}
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
          />
          <Field
            label="Stadt"
            name="city"
            defaultValue={company.city ?? ""}
            error={state.errors?.city}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? "Wird gespeichert…" : "Speichern"}
        </button>
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  error?: string[];
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  maxLength?: number;
};

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  error,
  inputMode,
  pattern,
  maxLength,
}: FieldProps) {
  const base =
    "mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500";

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-zinc-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          rows={4}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={base}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          inputMode={inputMode}
          pattern={pattern}
          maxLength={maxLength}
          className={base}
        />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error.join(", ")}</p>}
    </div>
  );
}
