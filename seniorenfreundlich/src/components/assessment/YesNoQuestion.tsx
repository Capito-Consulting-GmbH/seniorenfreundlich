"use client";

import type { AnswerValue } from "@/src/validators/assessment";
import { useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Label } from "@/src/components/ui/label";

interface Props {
  value: boolean | undefined;
  onChange: (value: AnswerValue) => void;
  locale: "de" | "en";
  disabled?: boolean;
}

export function YesNoQuestion({ value, onChange, locale, disabled }: Props) {
  const t = useTranslations("assessment");

  return (
    <RadioGroup
      value={value === true ? "yes" : value === false ? "no" : undefined}
      onValueChange={(v) => onChange({ answer: v === "yes" } as import("@/src/validators/assessment").YesNoAnswer)}
      disabled={disabled}
      className="flex gap-6"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="yes" id="yes" />
        <Label htmlFor="yes">{t("yes")}</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="no" id="no" />
        <Label htmlFor="no">{t("no")}</Label>
      </div>
    </RadioGroup>
  );
}
