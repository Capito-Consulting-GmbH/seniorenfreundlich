"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { AssessmentConfig, AnswerValue } from "@/src/validators/assessment";
import {
  startAssessmentAction,
  saveAnswerAction,
  submitAssessmentAction,
} from "@/src/actions/assessmentActions";
import { QuestionRenderer } from "@/src/components/assessment/QuestionRenderer";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

interface Props {
  config: AssessmentConfig;
  configId: string;
  submissionId: string | null;
  initialAnswers: Record<string, unknown>;
  locale: "de" | "en";
}

function loc(obj: { de: string; en: string }, locale: "de" | "en") {
  return obj[locale] || obj.de || obj.en || "";
}

export function AssessmentWizard({
  config,
  configId,
  submissionId: initialSubmissionId,
  initialAnswers,
  locale,
}: Props) {
  const t = useTranslations("assessment");
  const router = useRouter();
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers);
  const [submissionId, setSubmissionId] = useState<string | null>(initialSubmissionId);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const sections = config.sections;
  const currentSection = sections[sectionIndex];
  const totalSections = sections.length;
  const isLastSection = sectionIndex === totalSections - 1;

  // Calculate required questions answered (used for both label and progress bar)
  const requiredQuestions = sections
    .flatMap((s) => s.questions)
    .filter((q) => q.type !== "info" && q.required);
  const answeredRequired = requiredQuestions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== ""
  );
  const progress =
    requiredQuestions.length > 0
      ? (answeredRequired.length / requiredQuestions.length) * 100
      : 0;

  async function ensureSubmissionId(): Promise<string | null> {
    if (submissionId) return submissionId;
    const result = await startAssessmentAction();
    if (result.error || !result.submissionId) {
      setError(result.error ?? "Fehler beim Starten der Bewerbung.");
      return null;
    }
    setSubmissionId(result.submissionId);
    return result.submissionId;
  }

  function handleAnswerChange(questionId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    startTransition(async () => {
      const sid = await ensureSubmissionId();
      if (!sid) return;
      await saveAnswerAction(sid, questionId, value);
    });
  }

  function handleNext() {
    if (sectionIndex < totalSections - 1) {
      setSectionIndex((i) => i + 1);
      window.scrollTo(0, 0);
    }
  }

  function handlePrev() {
    if (sectionIndex > 0) {
      setSectionIndex((i) => i - 1);
      window.scrollTo(0, 0);
    }
  }

  function handleSubmit() {
    startTransition(async () => {
      const sid = await ensureSubmissionId();
      if (!sid) return;
      const result = await submitAssessmentAction(sid);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {loc(currentSection.title, locale)}
          </span>
          <span>
            {t("progress", {
              answered: answeredRequired.length,
              total: requiredQuestions.length,
            })}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex gap-1">
          {sections.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSectionIndex(idx)}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                idx === sectionIndex
                  ? "bg-primary"
                  : idx < sectionIndex
                  ? "bg-primary/50"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Section header */}
      <div className="border-b pb-4">
        <h2 className="text-lg font-semibold">{loc(currentSection.title, locale)}</h2>
        {currentSection.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {loc(currentSection.description as { de: string; en: string }, locale)}
          </p>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {currentSection.questions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            value={answers[question.id] as AnswerValue | undefined}
            onChange={(value) => handleAnswerChange(question.id, value)}
            submissionId={submissionId ?? ""}
            locale={locale}
            disabled={isPending}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={sectionIndex === 0 || isPending}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("previous")}
        </Button>

        {isLastSection ? (
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? t("submitting") : t("submit")}
            <Send className="h-4 w-4 ml-1.5" />
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={isPending}>
            {t("next")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
