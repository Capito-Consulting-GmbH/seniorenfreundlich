"use client";

import { useTranslations } from "next-intl";
import type { AssessmentConfig, Question } from "@/src/validators/assessment";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";

interface Props {
  config: AssessmentConfig;
  locale?: "de" | "en";
}

function loc(obj: { de: string; en: string }, locale: "de" | "en") {
  return obj[locale] || obj.de || obj.en || "";
}

function QuestionPreview({
  question,
  locale,
}: {
  question: Question;
  locale: "de" | "en";
}) {
  const label = loc(question.label, locale);
  const desc = question.description ? loc(question.description, locale) : undefined;
  const isRequired = question.type !== "info" && question.required;

  return (
    <div className="space-y-1.5">
      {question.type === "info" ? (
        <div className="rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{label}</p>
          {desc && <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">{desc}</p>}
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium">{label}</span>
            {isRequired && <span className="text-destructive text-xs">*</span>}
          </div>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
          {(question.type === "text") && (
            <Input
              disabled
              placeholder={
                (question as { placeholder?: { de: string; en: string } }).placeholder
                  ? loc(
                      (question as { placeholder: { de: string; en: string } }).placeholder,
                      locale
                    )
                  : ""
              }
              className="bg-muted/50"
            />
          )}
          {question.type === "textarea" && (
            <Textarea
              disabled
              rows={(question as { rows?: number }).rows ?? 4}
              className="bg-muted/50 resize-none"
            />
          )}
          {question.type === "yes-no" && (
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm cursor-default">
                <input type="radio" disabled /> Ja
              </label>
              <label className="flex items-center gap-2 text-sm cursor-default">
                <input type="radio" disabled /> Nein
              </label>
            </div>
          )}
          {question.type === "single-choice" && (
            <div className="space-y-1">
              {(question as { options: { value: string; label: { de: string; en: string } }[] }).options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-default">
                  <input type="radio" disabled /> {loc(opt.label, locale)}
                </label>
              ))}
            </div>
          )}
          {question.type === "multi-choice" && (
            <div className="space-y-1">
              {(question as { options: { value: string; label: { de: string; en: string } }[] }).options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-default">
                  <input type="checkbox" disabled /> {loc(opt.label, locale)}
                </label>
              ))}
            </div>
          )}
          {question.type === "number" && (
            <Input
              type="number"
              disabled
              min={(question as { min?: number }).min}
              max={(question as { max?: number }).max}
              className="bg-muted/50"
            />
          )}
          {question.type === "date" && (
            <Input type="date" disabled className="bg-muted/50" />
          )}
          {question.type === "file-upload" && (
            <div className="border-2 border-dashed rounded p-4 text-center bg-muted/30">
              <p className="text-xs text-muted-foreground">
                {locale === "de" ? "Datei hochladen" : "Upload file"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function AssessmentPreview({ config, locale = "de" }: Props) {
  if (config.sections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {locale === "de" ? "Noch keine Abschnitte vorhanden." : "No sections yet."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {config.sections.map((section) => (
        <div key={section.id} className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">{loc(section.title, locale)}</h4>
            <Badge variant="secondary" className="text-xs">
              {section.questions.length}{" "}
              {locale === "de" ? "Frage(n)" : "question(s)"}
            </Badge>
          </div>
          {section.questions.length === 0 ? (
            <p className="text-xs text-muted-foreground italic pl-2">
              {locale === "de" ? "Keine Fragen." : "No questions."}
            </p>
          ) : (
            <div className="space-y-4 pl-2">
              {section.questions.map((q) => (
                <QuestionPreview key={q.id} question={q} locale={locale} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
