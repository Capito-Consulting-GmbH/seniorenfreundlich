"use client";

import type { AnswerValue } from "@/src/validators/assessment";
import { Input } from "@/src/components/ui/input";

interface DateQuestionType {
  type: "date";
  minDate?: string;
  maxDate?: string;
}

interface Props {
  question: DateQuestionType;
  value: string | undefined;
  onChange: (value: AnswerValue) => void;
  disabled?: boolean;
}

export function DateQuestion({ question, value, onChange, disabled }: Props) {
  return (
    <Input
      type="date"
      value={value ?? ""}
      onChange={(e) => onChange({ date: e.target.value } as import("@/src/validators/assessment").DateAnswer)}
      min={question.minDate}
      max={question.maxDate}
      disabled={disabled}
    />
  );
}
