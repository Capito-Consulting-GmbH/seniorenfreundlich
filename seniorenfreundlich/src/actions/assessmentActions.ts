"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/src/auth/getCurrentUser";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { writeAuditEvent } from "@/src/services/auditService";
import { getActiveConfig } from "@/src/services/assessmentConfigService";
import {
  getOrCreateSubmission,
  getSubmissionById,
  submitForReview,
  reopenSubmission,
} from "@/src/services/assessmentSubmissionService";
import { upsertAnswer } from "@/src/services/assessmentAnswerService";
import {
  uploadAssessmentFile,
  deleteAssessmentFile,
  getFilesForAnswer,
} from "@/src/services/assessmentFileService";
import { getAnswerForQuestion } from "@/src/services/assessmentAnswerService";
import type { AnswerValue } from "@/src/validators/assessment";

export type ActionState = { success?: boolean; error?: string };

// ─── Start / load assessment ──────────────────────────────────────────────────

export async function startAssessmentAction(): Promise<
  ActionState & { submissionId?: string }
> {
  const [user, company] = await Promise.all([
    getCurrentUser(),
    getCurrentCompany(),
  ]);
  if (!company) return { error: "Kein Unternehmen gefunden." };

  const activeConfig = await getActiveConfig();
  if (!activeConfig) return { error: "Keine aktive Bewerbung verfügbar." };

  const submission = await getOrCreateSubmission(company.id, activeConfig.id);

  if (submission.status === "draft" && submission.createdAt === submission.updatedAt) {
    // Freshly created — log started event
    await writeAuditEvent({
      entityType: "assessment_submission",
      entityId: submission.id,
      action: "assessment_started",
      actorId: user.userId,
      metadata: { companyId: company.id, configId: activeConfig.id },
    });
  }

  return { success: true, submissionId: submission.id };
}

// ─── Save answer ──────────────────────────────────────────────────────────────

export async function saveAnswerAction(
  submissionId: string,
  questionId: string,
  value: AnswerValue
): Promise<ActionState> {
  const [, company] = await Promise.all([
    getCurrentUser(),
    getCurrentCompany(),
  ]);
  if (!company) return { error: "Kein Unternehmen gefunden." };

  const submission = await getSubmissionById(submissionId);
  if (!submission || submission.companyId !== company.id) {
    return { error: "Einreichung nicht gefunden." };
  }
  if (submission.status !== "draft") {
    return { error: "Einreichung kann nicht mehr bearbeitet werden." };
  }

  await upsertAnswer(submissionId, questionId, value);
  return { success: true };
}

// ─── File upload ──────────────────────────────────────────────────────────────

export async function uploadAssessmentFileAction(
  formData: FormData
): Promise<ActionState & { fileId?: string; blobUrl?: string; filename?: string }> {
  const [, company] = await Promise.all([
    getCurrentUser(),
    getCurrentCompany(),
  ]);
  if (!company) return { error: "Kein Unternehmen gefunden." };

  const submissionId = formData.get("submissionId") as string;
  const questionId = formData.get("questionId") as string;
  const file = formData.get("file") as File | null;

  if (!submissionId || !questionId || !file) {
    return { error: "Ungültige Anfrage." };
  }

  const submission = await getSubmissionById(submissionId);
  if (!submission || submission.companyId !== company.id) {
    return { error: "Einreichung nicht gefunden." };
  }
  if (submission.status !== "draft") {
    return { error: "Einreichung kann nicht mehr bearbeitet werden." };
  }

  // Ensure answer row exists before linking file
  const existing = await getAnswerForQuestion(submissionId, questionId);
  const answerId = existing?.id ?? (
    await upsertAnswer(submissionId, questionId, { fileIds: [] })
  ).id;

  try {
    const fileRow = await uploadAssessmentFile(answerId, file);
    // Update answer value with new fileId
    const currentFiles = await getFilesForAnswer(answerId);
    await upsertAnswer(submissionId, questionId, {
      fileIds: currentFiles.map((f) => f.id),
    });
    return { success: true, fileId: fileRow.id, blobUrl: fileRow.blobUrl, filename: fileRow.filename };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload fehlgeschlagen." };
  }
}

export async function deleteAssessmentFileAction(
  fileId: string,
  submissionId: string,
  questionId: string
): Promise<ActionState> {
  const [, company] = await Promise.all([
    getCurrentUser(),
    getCurrentCompany(),
  ]);
  if (!company) return { error: "Kein Unternehmen gefunden." };

  const submission = await getSubmissionById(submissionId);
  if (!submission || submission.companyId !== company.id) {
    return { error: "Einreichung nicht gefunden." };
  }

  await deleteAssessmentFile(fileId);

  // Refresh answer value
  const answer = await getAnswerForQuestion(submissionId, questionId);
  if (answer) {
    const remaining = await getFilesForAnswer(answer.id);
    await upsertAnswer(submissionId, questionId, {
      fileIds: remaining.map((f) => f.id),
    });
  }

  return { success: true };
}

// ─── Submit ───────────────────────────────────────────────────────────────────

export async function submitAssessmentAction(
  submissionId: string
): Promise<ActionState> {
  const [user, company] = await Promise.all([
    getCurrentUser(),
    getCurrentCompany(),
  ]);
  if (!company) return { error: "Kein Unternehmen gefunden." };

  const submission = await getSubmissionById(submissionId);
  if (!submission || submission.companyId !== company.id) {
    return { error: "Einreichung nicht gefunden." };
  }

  try {
    await submitForReview(submissionId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Fehler beim Einreichen." };
  }

  await writeAuditEvent({
    entityType: "assessment_submission",
    entityId: submissionId,
    action: "assessment_submitted",
    actorId: user.userId,
    metadata: { companyId: company.id },
  });

  revalidatePath("/dashboard/assessment");
  return { success: true };
}

// ─── Reopen rejected submission ───────────────────────────────────────────────

export async function reopenAssessmentAction(
  submissionId: string
): Promise<ActionState> {
  const [, company] = await Promise.all([
    getCurrentUser(),
    getCurrentCompany(),
  ]);
  if (!company) return { error: "Kein Unternehmen gefunden." };

  const submission = await getSubmissionById(submissionId);
  if (!submission || submission.companyId !== company.id) {
    return { error: "Einreichung nicht gefunden." };
  }

  await reopenSubmission(submissionId);
  revalidatePath("/dashboard/assessment");
  return { success: true };
}
