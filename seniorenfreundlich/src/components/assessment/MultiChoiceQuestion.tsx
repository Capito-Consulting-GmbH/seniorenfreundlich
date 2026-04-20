"use client";

import type { AnswerValue, MultiChoiceAnswer } from "@/src/validators/assessment";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";

interface Option {
  value: string;
  label: { de: string; en: string };
}

interface MultiChoiceQuestionType {
  type: "multi-choice";
  options: Option[];
}

interface Props {
  question: MultiChoiceQuestionType;
  value: string[] | undefined;
  onChange: (value: AnswerValue) => void;
  locale: "de" | "en";
  disabled?: boolean;
}

export function MultiChoiceQuestion({ question, value, onChange, locale, disabled }: Props) {
  const selected = value ?? [];

  function toggle(optValue: string) {
    if (selected.includes(optValue)) {
      onChange({ selected: selected.filter((v) => v !== optValue) } as MultiChoiceAnswer);
    } else {
      onChange({ selected: [...selected, optValue] } as MultiChoiceAnswer);
    }
  }

  return (
    <div className="space-y-2">
      {question.options.map((opt) => (
        <div key={opt.value} className="flex items-center space-x-2">
          <Checkbox
            id={`mc-${opt.value}`}
            checked={selected.includes(opt.value)}
            onCheckedChange={() => toggle(opt.value)}
            disabled={disabled}
          />
          <Label htmlFor={`mc-${opt.value}`}>
            {opt.label[locale] || opt.label.de}
          </Label>
        </div>
      ))}
    </div>
  );
}
