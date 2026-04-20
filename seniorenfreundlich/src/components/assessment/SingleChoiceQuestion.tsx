"use client";

import type { AnswerValue } from "@/src/validators/assessment";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Label } from "@/src/components/ui/label";

interface Option {
  value: string;
  label: { de: string; en: string };
}

interface SingleChoiceQuestionType {
  type: "single-choice";
  options: Option[];
}

interface Props {
  question: SingleChoiceQuestionType;
  value: string | undefined;
  onChange: (value: AnswerValue) => void;
  locale: "de" | "en";
  disabled?: boolean;
}

export function SingleChoiceQuestion({ question, value, onChange, locale, disabled }: Props) {
  return (
    <RadioGroup
      value={value ?? ""}
      onValueChange={(v: string) => onChange({ selected: v } as import("@/src/validators/assessment").SingleChoiceAnswer)}
      disabled={disabled}
      className="space-y-2"
    >
      {question.options.map((opt) => (
        <div key={opt.value} className="flex items-center space-x-2">
          <RadioGroupItem value={opt.value} id={`sc-${opt.value}`} />
          <Label htmlFor={`sc-${opt.value}`}>
            {opt.label[locale] || opt.label.de}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
