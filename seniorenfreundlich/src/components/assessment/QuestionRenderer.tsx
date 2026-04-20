"use client";

import type {
  Question,
  AnswerValue,
  TextAnswer,
  YesNoAnswer,
  SingleChoiceAnswer,
  MultiChoiceAnswer,
  NumberAnswer,
  DateAnswer,
} from "@/src/validators/assessment";
import { TextQuestion } from "./TextQuestion";
import { TextareaQuestion } from "./TextareaQuestion";
import { YesNoQuestion } from "./YesNoQuestion";
import { SingleChoiceQuestion } from "./SingleChoiceQuestion";
import { MultiChoiceQuestion } from "./MultiChoiceQuestion";
import { NumberQuestion } from "./NumberQuestion";
import { FileUploadQuestion } from "./FileUploadQuestion";
import { DateQuestion } from "./DateQuestion";
import { InfoBlock } from "./InfoBlock";

interface Props {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  submissionId: string;
  locale: "de" | "en";
  disabled?: boolean;
}

function loc(obj: { de: string; en: string }, locale: "de" | "en") {
  return obj[locale] || obj.de || obj.en || "";
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  submissionId,
  locale,
  disabled,
}: Props) {
  const label = loc(question.label, locale);
  const description = question.description ? loc(question.description, locale) : undefined;
  const isRequired = question.type !== "info" && question.required;

  if (question.type === "info") {
    return <InfoBlock label={label} description={description} />;
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium leading-none">
          {label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {question.type === "text" && (
        <TextQuestion
          question={question}
          value={(value as TextAnswer | undefined)?.text}
          onChange={onChange}
          locale={locale}
          disabled={disabled}
        />
      )}
      {question.type === "textarea" && (
        <TextareaQuestion
          question={question}
          value={(value as TextAnswer | undefined)?.text}
          onChange={onChange}
          locale={locale}
          disabled={disabled}
        />
      )}
      {question.type === "yes-no" && (
        <YesNoQuestion
          value={(value as YesNoAnswer | undefined)?.answer}
          onChange={onChange}
          locale={locale}
          disabled={disabled}
        />
      )}
      {question.type === "single-choice" && (
        <SingleChoiceQuestion
          question={question}
          value={(value as SingleChoiceAnswer | undefined)?.selected}
          onChange={onChange}
          locale={locale}
          disabled={disabled}
        />
      )}
      {question.type === "multi-choice" && (
        <MultiChoiceQuestion
          question={question}
          value={(value as MultiChoiceAnswer | undefined)?.selected}
          onChange={onChange}
          locale={locale}
          disabled={disabled}
        />
      )}
      {question.type === "number" && (
        <NumberQuestion
          question={question}
          value={(value as NumberAnswer | undefined)?.number}
          onChange={onChange}
          disabled={disabled}
        />
      )}
      {question.type === "file-upload" && (
        <FileUploadQuestion
          question={question}
          submissionId={submissionId}
          questionId={question.id}
          disabled={disabled}
          locale={locale}
        />
      )}
      {question.type === "date" && (
        <DateQuestion
          question={question}
          value={(value as DateAnswer | undefined)?.date}
          onChange={onChange}
          disabled={disabled}
        />
      )}
    </div>
  );
}
