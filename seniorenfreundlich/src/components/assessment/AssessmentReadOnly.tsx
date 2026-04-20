"use client";

import { useTranslations } from "next-intl";
import type { AssessmentConfig } from "@/src/validators/assessment";
import type {
  AssessmentAnswerRow,
  AssessmentFileRow,
} from "@/src/services/assessmentSubmissionService";

interface Props {
  config: AssessmentConfig;
  answers: (AssessmentAnswerRow & { files: AssessmentFileRow[] })[];
  locale: "de" | "en";
}

function loc(obj: { de: string; en: string }, locale: "de" | "en") {
  return obj[locale] || obj.de || obj.en || "";
}

export function AssessmentReadOnly({ config, answers, locale }: Props) {
  const t = useTranslations("assessment");

  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  return (
    <div className="space-y-6 mt-6">
      {config.sections.map((section) => (
        <div key={section.id} className="border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-muted/30 border-b">
            <h3 className="font-semibold text-sm">{loc(section.title, locale)}</h3>
          </div>
          <div className="divide-y">
            {section.questions.map((question) => {
              const answer = answerMap.get(question.id);
              const value = answer?.value;

              return (
                <div key={question.id} className="px-4 py-3">
                  <p className="text-sm font-medium mb-1">
                    {loc(question.label, locale)}
                    {question.type !== "info" && question.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </p>
                  {question.type === "info" ? null : value === undefined || value === null ? (
                    <p className="text-sm italic text-muted-foreground">{t("notAnswered")}</p>
                  ) : (
                    <AnswerDisplay question={question} value={value} answer={answer} locale={locale} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function AnswerDisplay({
  question,
  value,
  answer,
  locale,
}: {
  question: {
    type: string;
    label: { de: string; en: string };
    options?: { value: string; label: { de: string; en: string } }[];
  };
  value: unknown;
  answer: (AssessmentAnswerRow & { files: AssessmentFileRow[] }) | undefined;
  locale: "de" | "en";
}) {
  if (question.type === "yes-no") {
    return <p className="text-sm">{value === true ? "Ja" : "Nein"}</p>;
  }
  if (question.type === "single-choice" && question.options) {
    const selected = (value as { selected?: string } | null)?.selected ?? String(value);
    const opt = question.options.find((o) => o.value === selected);
    return <p className="text-sm">{opt ? (opt.label[locale] || opt.label.de) : selected}</p>;
  }
  if (question.type === "multi-choice" && question.options) {
    const selected = (value as { selected?: string[] } | null)?.selected ?? [];
    const labels = selected.map(
      (v) => {
        const opt = question.options?.find((o) => o.value === v);
        return opt ? (opt.label[locale] || opt.label.de) : v;
      }
    );
    return (
      <ul className="list-disc list-inside text-sm space-y-0.5">
        {labels.map((l) => <li key={l}>{l}</li>)}
      </ul>
    );
  }
  if (question.type === "file-upload" && answer?.files && answer.files.length > 0) {
    return (
      <ul className="space-y-1">
        {answer.files.map((f) => (
          <li key={f.id}>
            <a
              href={f.blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {f.filename}{" "}
              <span className="text-muted-foreground text-xs">
                ({(f.sizeBytes / 1024).toFixed(1)} KB)
              </span>
            </a>
          </li>
        ))}
      </ul>
    );
  }
  if (question.type === "date" && typeof value === "string") {
    return <p className="text-sm">{new Date(value).toLocaleDateString("de-DE")}</p>;
  }
  if (typeof value === "string" || typeof value === "number") {
    return <p className="text-sm whitespace-pre-wrap">{String(value)}</p>;
  }
  return <p className="text-sm text-muted-foreground italic">{JSON.stringify(value)}</p>;
}
