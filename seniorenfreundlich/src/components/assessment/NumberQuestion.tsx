"use client";

import type { AnswerValue } from "@/src/validators/assessment";
import { Input } from "@/src/components/ui/input";

interface NumberQuestionType {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
  placeholder?: { de: string; en: string };
}

interface Props {
  question: NumberQuestionType;
  value: number | undefined;
  onChange: (value: AnswerValue) => void;
  disabled?: boolean;
}

export function NumberQuestion({ question, value, onChange, disabled }: Props) {
  return (
    <Input
      type="number"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? ({ number: Number(e.target.value) } as import("@/src/validators/assessment").NumberAnswer) : undefined as unknown as import("@/src/validators/assessment").NumberAnswer)}
      min={question.min}
      max={question.max}
      step={question.step ?? 1}
      disabled={disabled}
    />
  );
}
