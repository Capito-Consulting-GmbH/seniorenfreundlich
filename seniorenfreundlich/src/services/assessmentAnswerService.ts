import { and, eq } from "drizzle-orm";
import { db } from "@/src/db/db";
import { assessmentAnswers } from "@/src/db/schema";
import type { AnswerValue } from "@/src/validators/assessment";

export type AssessmentAnswerRow = typeof assessmentAnswers.$inferSelect;

export async function upsertAnswer(
  submissionId: string,
  questionId: string,
  value: AnswerValue
): Promise<AssessmentAnswerRow> {
  const [row] = await db
    .insert(assessmentAnswers)
    .values({
      submissionId,
      questionId,
      value: value as unknown as Record<string, unknown>,
    })
    .onConflictDoUpdate({
      target: [assessmentAnswers.submissionId, assessmentAnswers.questionId],
      set: {
        value: value as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      },
    })
    .returning();
  return row;
}

export async function getAnswersForSubmission(
  submissionId: string
): Promise<AssessmentAnswerRow[]> {
  return db
    .select()
    .from(assessmentAnswers)
    .where(eq(assessmentAnswers.submissionId, submissionId));
}

export async function getAnswerForQuestion(
  submissionId: string,
  questionId: string
): Promise<AssessmentAnswerRow | null> {
  const result = await db
    .select()
    .from(assessmentAnswers)
    .where(
      and(
        eq(assessmentAnswers.submissionId, submissionId),
        eq(assessmentAnswers.questionId, questionId)
      )
    )
    .limit(1);
  return result[0] ?? null;
}
