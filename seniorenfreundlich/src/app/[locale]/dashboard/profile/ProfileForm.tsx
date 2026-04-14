"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updateCompanyProfileAction, type UpdateCompanyProfileState } from "@/src/actions/updateCompanyProfile";
import type { Company } from "@/src/services/companyService";
import LogoUpload from "./LogoUpload";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

const initialState: UpdateCompanyProfileState = {};

export default function ProfileForm({ company }: { company: Company }) {
  const t = useTranslations("dashboard.profile");
  const [state, action, pending] = useActionState(updateCompanyProfileAction, initialState);
  const logoUrl = state.logoUrl ?? company.logoUrl ?? null;

  return (
    <div className="mt-8">
      {state.success && (
        <Alert className="mb-6">
          <AlertDescription>{t("saved")}</AlertDescription>
        </Alert>
      )}
      {state.errors?._form && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{state.errors._form.join(", ")}</AlertDescription>
        </Alert>
      )}

      <form action={action} className="space-y-6">
        <LogoUpload logoUrl={logoUrl} />

        <Field
          label={t("labelName")}
          name="name"
          required
          defaultValue={company.name}
          error={state.errors?.name}
        />
        <Field
          label={t("labelDescription")}
          name="description"
          type="textarea"
          defaultValue={company.description ?? ""}
          error={state.errors?.description}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label={t("labelWebsite")}
            name="website"
            type="text"
            placeholder="www.example.de"
            defaultValue={company.website ?? ""}
            error={state.errors?.website}
          />
          <Field
            label={t("labelPhone")}
            name="phone"
            type="tel"
            defaultValue={company.phone ?? ""}
            error={state.errors?.phone}
          />
        </div>
        <Field
          label={t("labelEmail")}
          name="email"
          type="email"
          defaultValue={company.email ?? ""}
          error={state.errors?.email}
        />
        <Field
          label={t("labelAddress")}
          name="address"
          defaultValue={company.address ?? ""}
          error={state.errors?.address}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label={t("labelPostalCode")}
            name="postalCode"
            placeholder="12345"
            defaultValue={company.postalCode ?? ""}
            error={state.errors?.postalCode}
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
          />
          <Field
            label={t("labelCity")}
            name="city"
            defaultValue={company.city ?? ""}
            error={state.errors?.city}
          />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? t("saving") : t("save")}
        </Button>
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
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          rows={4}
          placeholder={placeholder}
          defaultValue={defaultValue}
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          inputMode={inputMode}
          pattern={pattern}
          maxLength={maxLength}
        />
      )}
      {error && <p className="text-xs text-destructive">{error.join(", ")}</p>}
    </div>
  );
}
