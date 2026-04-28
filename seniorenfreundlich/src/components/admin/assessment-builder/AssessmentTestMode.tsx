"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { AssessmentConfig, AnswerValue, Question } from "@/src/validators/assessment";
import { QuestionRenderer } from "@/src/components/assessment/QuestionRenderer";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { Label } from "@/src/components/ui/label";
import { ChevronLeft, ChevronRight, RotateCcw, Send, Trash2, Upload } from "lucide-react";

interface Props {
  config: AssessmentConfig;
  locale: "de" | "en";
}

interface SimulatedFile {
  id: string;
  name: string;
  size: number;
}

function loc(obj: { de: string; en: string }, locale: "de" | "en") {
  return obj[locale] || obj.de || obj.en || "";
}

function isAnswered(question: Question, value: AnswerValue | undefined, files: SimulatedFile[] | undefined) {
  switch (question.type) {
    case "text":
    case "textarea":
      return (
        !!value &&
        "text" in value &&
        typeof value.text === "string" &&
        value.text.trim().length > 0
      );
    case "yes-no":
      return !!value && "answer" in value && typeof value.answer === "boolean";
    case "single-choice":
      return (
        !!value &&
        "selected" in value &&
        typeof value.selected === "string" &&
        value.selected.length > 0
      );
    case "multi-choice":
      return (
        !!value &&
        "selected" in value &&
        Array.isArray(value.selected) &&
        value.selected.length > 0
      );
    case "number":
      return (
        !!value &&
        "number" in value &&
        typeof value.number === "number" &&
        !Number.isNaN(value.number)
      );
    case "date":
      return (
        !!value &&
        "date" in value &&
        typeof value.date === "string" &&
        value.date.length > 0
      );
    case "file-upload":
      return (files?.length ?? 0) > 0;
    case "info":
      return true;
    default:
      return false;
  }
}

function SimulatedFileUploadQuestion({
  question,
  files,
  onChange,
  locale,
}: {
  question: Extract<Question, { type: "file-upload" }>;
  files: SimulatedFile[];
  onChange: (files: SimulatedFile[]) => void;
  locale: "de" | "en";
}) {
  const t = useTranslations("assessment");
  const tBuilder = useTranslations("admin.assessments.builder");
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const maxFiles = question.maxFiles ?? 5;
  const maxSizeBytes = (question.maxSizeMb ?? 10) * 1024 * 1024;

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;

    const nextFiles = [...files];

    for (const file of selectedFiles) {
      if (nextFiles.length >= maxFiles) {
        setError(t("maxFilesReached"));
        break;
      }
      if (file.size > maxSizeBytes) {
        setError(`Max. ${question.maxSizeMb ?? 10} MB`);
        continue;
      }

      nextFiles.push({
        id: `${file.name}-${file.lastModified}-${nextFiles.length}`,
        name: file.name,
        size: file.size,
      });
      setError(null);
    }

    onChange(nextFiles);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove(fileId: string) {
    onChange(files.filter((file) => file.id !== fileId));
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium leading-none">
          {loc(question.label, locale)}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </label>
        {question.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {loc(question.description, locale)}
          </p>
        )}
      </div>

      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        {tBuilder("testModeHint")}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => handleRemove(file.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {files.length < maxFiles && (
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={question.accept?.join(",")}
            multiple={maxFiles > 1}
            onChange={handleSelect}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            {t("uploadFile")}
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function AssessmentTestMode({ config, locale }: Props) {
  const t = useTranslations("assessment");
  const tBuilder = useTranslations("admin.assessments.builder");
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue | undefined>>({});
  const [simulatedFiles, setSimulatedFiles] = useState<Record<string, SimulatedFile[]>>({});
  const [isFinished, setIsFinished] = useState(false);

  const sections = config.sections;
  const totalSections = sections.length;

  useEffect(() => {
    if (totalSections === 0) {
      setSectionIndex(0);
      return;
    }
    setSectionIndex((prev) => Math.min(prev, totalSections - 1));
  }, [totalSections]);

  if (sections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {tBuilder("emptyPreview")}
      </p>
    );
  }

  const currentSection = sections[sectionIndex];
  const requiredQuestions = sections
    .flatMap((section) => section.questions)
    .filter((question) => question.type !== "info" && question.required);
  const answeredRequired = requiredQuestions.filter((question) =>
    isAnswered(question, answers[question.id], simulatedFiles[question.id])
  );
  const progress =
    requiredQuestions.length > 0 ? (answeredRequired.length / requiredQuestions.length) * 100 : 0;
  const isLastSection = sectionIndex === totalSections - 1;

  function handleQuestionChange(questionId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleReset() {
    setAnswers({});
    setSimulatedFiles({});
    setSectionIndex(0);
    setIsFinished(false);
  }

  function handleNext() {
    if (sectionIndex < totalSections - 1) {
      setSectionIndex((prev) => prev + 1);
      setIsFinished(false);
      window.scrollTo(0, 0);
    }
  }

  function handlePrevious() {
    if (sectionIndex > 0) {
      setSectionIndex((prev) => prev - 1);
      setIsFinished(false);
      window.scrollTo(0, 0);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 rounded-lg border bg-background p-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">{tBuilder("testMode")}</h4>
          <p className="text-sm text-muted-foreground">{tBuilder("testModeHint")}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {tBuilder("resetTestMode")}
        </Button>
      </div>

      {isFinished && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {tBuilder("testModeDone")}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{loc(currentSection.title, locale)}</span>
          <span>
            {t("progress", {
              answered: answeredRequired.length,
              total: requiredQuestions.length,
            })}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex gap-1">
          {sections.map((section, idx) => (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                setSectionIndex(idx);
                setIsFinished(false);
              }}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                idx === sectionIndex ? "bg-primary" : idx < sectionIndex ? "bg-primary/50" : "bg-muted"
              }`}
              aria-label={loc(section.title, locale)}
            />
          ))}
        </div>
      </div>

      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold">{loc(currentSection.title, locale)}</h3>
        {currentSection.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {loc(currentSection.description, locale)}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {currentSection.questions.map((question) =>
          question.type === "file-upload" ? (
            <SimulatedFileUploadQuestion
              key={question.id}
              question={question}
              files={simulatedFiles[question.id] ?? []}
              onChange={(files) => setSimulatedFiles((prev) => ({ ...prev, [question.id]: files }))}
              locale={locale}
            />
          ) : (
            <QuestionRenderer
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(value) => handleQuestionChange(question.id, value)}
              submissionId="simulation"
              locale={locale}
            />
          )
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <Button type="button" variant="outline" onClick={handlePrevious} disabled={sectionIndex === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t("previous")}
        </Button>

        {isLastSection ? (
          <Button
            type="button"
            onClick={() => {
              setIsFinished(true);
              window.scrollTo(0, 0);
            }}
          >
            {tBuilder("finishTestMode")}
            <Send className="h-4 w-4 ml-1.5" />
          </Button>
        ) : (
          <Button type="button" onClick={handleNext}>
            {t("next")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}