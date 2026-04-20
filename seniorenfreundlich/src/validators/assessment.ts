import { z } from "zod";

// ─── Shared ───────────────────────────────────────────────────────────────────

export const localizedStringSchema = z.object({
  de: z.string(),
  en: z.string(),
});

const optionSchema = z.object({
  value: z.string(),
  label: localizedStringSchema,
});

// ─── Question schemas (discriminated union on `type`) ─────────────────────────

const baseQuestionSchema = z.object({
  id: z.string().min(1),
  label: localizedStringSchema,
  description: localizedStringSchema.optional(),
  required: z.boolean(),
});

export const textQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("text"),
  placeholder: localizedStringSchema.optional(),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
});

export const textareaQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("textarea"),
  placeholder: localizedStringSchema.optional(),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  rows: z.number().int().positive().optional(),
});

export const yesNoQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("yes-no"),
});

export const singleChoiceQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("single-choice"),
  options: z.array(optionSchema).min(2),
});

export const multiChoiceQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("multi-choice"),
  options: z.array(optionSchema).min(2),
  minSelect: z.number().int().positive().optional(),
  maxSelect: z.number().int().positive().optional(),
});

export const numberQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("number"),
  placeholder: localizedStringSchema.optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
  unit: localizedStringSchema.optional(),
});

export const fileUploadQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("file-upload"),
  accept: z.array(z.string()).optional(),
  maxFiles: z.number().int().positive().optional(),
  maxSizeMb: z.number().positive().optional(),
});

export const dateQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("date"),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
});

export const infoBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("info"),
  label: localizedStringSchema,
  description: localizedStringSchema,
  required: z.literal(false).default(false),
});

export const questionSchema = z.discriminatedUnion("type", [
  textQuestionSchema,
  textareaQuestionSchema,
  yesNoQuestionSchema,
  singleChoiceQuestionSchema,
  multiChoiceQuestionSchema,
  numberQuestionSchema,
  fileUploadQuestionSchema,
  dateQuestionSchema,
  infoBlockSchema,
]);

export type Question = z.infer<typeof questionSchema>;
export type QuestionType = Question["type"];

// ─── Section & Config ─────────────────────────────────────────────────────────

export const sectionSchema = z.object({
  id: z.string().min(1),
  title: localizedStringSchema,
  description: localizedStringSchema.optional(),
  questions: z.array(questionSchema),
});

export const assessmentConfigSchema = z.object({
  sections: z.array(sectionSchema),
});

export type AssessmentSection = z.infer<typeof sectionSchema>;
export type AssessmentConfig = z.infer<typeof assessmentConfigSchema>;

// ─── Answer value schemas ─────────────────────────────────────────────────────

export const textAnswerSchema = z.object({ text: z.string() });
export const yesNoAnswerSchema = z.object({ answer: z.boolean() });
export const singleChoiceAnswerSchema = z.object({ selected: z.string() });
export const multiChoiceAnswerSchema = z.object({
  selected: z.array(z.string()),
});
export const numberAnswerSchema = z.object({ number: z.number() });
export const fileAnswerSchema = z.object({ fileIds: z.array(z.string()) });
export const dateAnswerSchema = z.object({ date: z.string() });

export type TextAnswer = z.infer<typeof textAnswerSchema>;
export type YesNoAnswer = z.infer<typeof yesNoAnswerSchema>;
export type SingleChoiceAnswer = z.infer<typeof singleChoiceAnswerSchema>;
export type MultiChoiceAnswer = z.infer<typeof multiChoiceAnswerSchema>;
export type NumberAnswer = z.infer<typeof numberAnswerSchema>;
export type FileAnswer = z.infer<typeof fileAnswerSchema>;
export type DateAnswer = z.infer<typeof dateAnswerSchema>;

export type AnswerValue =
  | TextAnswer
  | YesNoAnswer
  | SingleChoiceAnswer
  | MultiChoiceAnswer
  | NumberAnswer
  | FileAnswer
  | DateAnswer;
