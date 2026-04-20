"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/src/auth/isAdmin";
import { writeAuditEvent } from "@/src/services/auditService";
import {
  createConfig,
  updateDraftConfig,
  publishConfig,
  duplicateConfig,
  deleteConfig,
  getConfigById,
} from "@/src/services/assessmentConfigService";
import {
  startReview,
  abortReview,
  approveSubmission,
  rejectSubmission,
  getSubmissionById,
} from "@/src/services/assessmentSubmissionService";
import { getCompanyById } from "@/src/services/companyService";
import type { AssessmentConfig } from "@/src/validators/assessment";

export type AdminActionState = { success?: boolean; error?: string };

// ─── Config management ────────────────────────────────────────────────────────

export async function createConfigAction(
  title: { de: string; en: string },
  tier: "basic" | "standard" | "premium" = "basic"
): Promise<AdminActionState & { configId?: string }> {
  const admin = await requireAdmin();

  const config = await createConfig(title, admin.userId, tier);

  await writeAuditEvent({
    entityType: "assessment_config",
    entityId: config.id,
    action: "assessment_config_created",
    actorId: admin.userId,
    metadata: { version: config.version, tier },
  });

  revalidatePath("/admin/assessments");
  return { success: true, configId: config.id };
}

export async function saveConfigDraftAction(
  configId: string,
  title: { de: string; en: string },
  config: AssessmentConfig
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  try {
    await updateDraftConfig(configId, title, config);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Fehler beim Speichern." };
  }

  revalidatePath("/admin/assessments");
  revalidatePath(`/admin/assessments/builder/${configId}`);
  return { success: true };
}

export async function publishConfigAction(
  configId: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  const existing = await getConfigById(configId);
  if (!existing) return { error: "Konfiguration nicht gefunden." };

  try {
    await publishConfig(configId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Fehler beim Veröffentlichen." };
  }

  await writeAuditEvent({
    entityType: "assessment_config",
    entityId: configId,
    action: "assessment_config_published",
    actorId: admin.userId,
    metadata: { version: existing.version },
  });

  revalidatePath("/admin/assessments");
  revalidatePath(`/admin/assessments/builder/${configId}`);
  return { success: true };
}

export async function duplicateConfigAction(
  configId: string
): Promise<AdminActionState & { newConfigId?: string }> {
  const admin = await requireAdmin();

  const copy = await duplicateConfig(configId, admin.userId);

  await writeAuditEvent({
    entityType: "assessment_config",
    entityId: copy.id,
    action: "assessment_config_created",
    actorId: admin.userId,
    metadata: { version: copy.version, duplicatedFrom: configId },
  });

  revalidatePath("/admin/assessments");
  return { success: true, newConfigId: copy.id };
}

export async function deleteConfigAction(
  configId: string
): Promise<AdminActionState> {
  await requireAdmin();

  try {
    await deleteConfig(configId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Fehler beim Löschen." };
  }

  revalidatePath("/admin/assessments");
  return { success: true };
}

// ─── Submission review ────────────────────────────────────────────────────────

export async function startReviewAction(
  submissionId: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  try {
    await startReview(submissionId, admin.userId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Fehler." };
  }

  await writeAuditEvent({
    entityType: "assessment_submission",
    entityId: submissionId,
    action: "assessment_review_started",
    actorId: admin.userId,
  });

  revalidatePath("/admin/assessments/submissions");
  revalidatePath(`/admin/assessments/submissions/${submissionId}`);
  return { success: true };
}

export async function approveSubmissionAction(
  submissionId: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  const submission = await getSubmissionById(submissionId);
  if (!submission) return { error: "Einreichung nicht gefunden." };

  try {
    await approveSubmission(submissionId, admin.userId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Fehler." };
  }

  await writeAuditEvent({
    entityType: "assessment_submission",
    entityId: submissionId,
    action: "assessment_approved",
    actorId: admin.userId,
    metadata: { companyId: submission.companyId },
  });

  const company = await getCompanyById(submission.companyId);
  revalidatePath("/admin/assessments/submissions");
  revalidatePath(`/admin/assessments/submissions/${submissionId}`);
  revalidatePath(`/admin/companies/${submission.companyId}`);
  if (company) {
    revalidatePath(`/certificate/${company.slug}`);
    revalidatePath(`/companies/${company.slug}`);
  }

  return { success: true };
}

export async function abortReviewAction(
  submissionId: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  try {
    await abortReview(submissionId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Fehler." };
  }

  await writeAuditEvent({
    entityType: "assessment_submission",
    entityId: submissionId,
    action: "assessment_review_aborted",
    actorId: admin.userId,
  });

  revalidatePath("/admin/assessments/submissions");
  revalidatePath(`/admin/assessments/submissions/${submissionId}`);
  return { success: true };
}

export async function rejectSubmissionAction(
  submissionId: string,
  notes: string
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  try {
    await rejectSubmission(submissionId, admin.userId, notes);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Fehler." };
  }

  await writeAuditEvent({
    entityType: "assessment_submission",
    entityId: submissionId,
    action: "assessment_rejected",
    actorId: admin.userId,
    metadata: { notes },
  });

  revalidatePath("/admin/assessments/submissions");
  revalidatePath(`/admin/assessments/submissions/${submissionId}`);
  return { success: true };
}
