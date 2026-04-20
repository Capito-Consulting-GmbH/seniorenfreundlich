"use client";

import type { AnswerValue } from "@/src/validators/assessment";
import { Textarea } from "@/src/components/ui/textarea";

interface TextareaQuestionType {
  type: "textarea";
  placeholder?: { de: string; en: string };
  minLength?: number;
  maxLength?: number;
  rows?: number;
}

interface Props {
  question: TextareaQuestionType;
  value: string | undefined;
  onChange: (value: AnswerValue) => void;
  locale: "de" | "en";
  disabled?: boolean;
}

export function TextareaQuestion({ question, value, onChange, locale, disabled }: Props) {
  const placeholder = question.placeholder
    ? (question.placeholder[locale] || question.placeholder.de)
    : "";

  return (
    <Textarea
      value={value ?? ""}
      onChange={(e) => onChange({ text: e.target.value } as import("@/src/validators/assessment").TextAnswer)}
      placeholder={placeholder}
      rows={question.rows ?? 4}
      disabled={disabled}
      className="resize-none"
    />
  );
}
