"use client";

import type { AnswerValue } from "@/src/validators/assessment";
import { Input } from "@/src/components/ui/input";

interface TextQuestionType {
  type: "text";
  placeholder?: { de: string; en: string };
  minLength?: number;
  maxLength?: number;
}

interface Props {
  question: TextQuestionType;
  value: string | undefined;
  onChange: (value: AnswerValue) => void;
  locale: "de" | "en";
  disabled?: boolean;
}

export function TextQuestion({ question, value, onChange, locale, disabled }: Props) {
  const placeholder = question.placeholder
    ? (question.placeholder[locale] || question.placeholder.de)
    : "";

  return (
    <Input
      value={value ?? ""}
      onChange={(e) => onChange({ text: e.target.value } as import("@/src/validators/assessment").TextAnswer)}
      placeholder={placeholder}
      minLength={question.minLength}
      maxLength={question.maxLength}
      disabled={disabled}
    />
  );
}
