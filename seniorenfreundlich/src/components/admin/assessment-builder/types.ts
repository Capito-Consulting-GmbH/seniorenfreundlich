import type { AssessmentSection, Question } from "@/src/validators/assessment";

export type Action =
  | { type: "SET_CONFIG"; config: import("@/src/validators/assessment").AssessmentConfig }
  | { type: "SET_TITLE"; title: { de: string; en: string } }
  | { type: "ADD_SECTION" }
  | { type: "REMOVE_SECTION"; sectionId: string }
  | { type: "UPDATE_SECTION"; sectionId: string; update: Partial<AssessmentSection> }
  | { type: "REORDER_SECTIONS"; fromIndex: number; toIndex: number }
  | { type: "ADD_QUESTION"; sectionId: string; question: Question }
  | { type: "REMOVE_QUESTION"; sectionId: string; questionId: string }
  | { type: "UPDATE_QUESTION"; sectionId: string; question: Question }
  | { type: "REORDER_QUESTIONS"; sectionId: string; fromIndex: number; toIndex: number };
