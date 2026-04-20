import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/src/db/db";
import {
  assessmentSubmissions,
  assessmentAnswers,
  assessmentFiles,
  assessmentConfigs,
  companies,
  tierEnum,
} from "@/src/db/schema";

export type AssessmentSubmissionRow =
  typeof assessmentSubmissions.$inferSelect;
export type AssessmentAnswerRow = typeof assessmentAnswers.$inferSelect;
export type AssessmentFileRow = typeof assessmentFiles.$inferSelect;

export type SubmissionWithAnswers = AssessmentSubmissionRow & {
  answers: (AssessmentAnswerRow & { files: AssessmentFileRow[] })[];
};

export type AdminSubmissionRow = AssessmentSubmissionRow & {
  companyName: string;
  configVersion: number;
};

const ADMIN_PAGE_SIZE = 25;

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getSubmissionById(
  id: string
): Promise<SubmissionWithAnswers | null> {
  const [submission] = await db
    .select()
    .from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.id, id))
    .limit(1);
  if (!submission) return null;

  const answers = await db
    .select()
    .from(assessmentAnswers)
    .where(eq(assessmentAnswers.submissionId, id));

  const filesPerAnswer: Record<string, AssessmentFileRow[]> = {};
  for (const answer of answers) {
    filesPerAnswer[answer.id] = await db
      .select()
      .from(assessmentFiles)
      .where(eq(assessmentFiles.answerId, answer.id));
  }

  return {
    ...submission,
    answers: answers.map((a) => ({
      ...a,
      files: filesPerAnswer[a.id] ?? [],
    })),
  };
}

export async function getApprovedSubmissionByCompany(
  companyId: string
): Promise<AssessmentSubmissionRow | null> {
  const result = await db
    .select()
    .from(assessmentSubmissions)
    .where(
      and(
        eq(assessmentSubmissions.companyId, companyId),
        eq(assessmentSubmissions.status, "approved")
      )
    )
    .orderBy(desc(assessmentSubmissions.updatedAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getApprovedSubmissionByCompanyAndTier(
  companyId: string,
  tier: (typeof tierEnum.enumValues)[number]
): Promise<AssessmentSubmissionRow | null> {
  const rows = await db
    .select({ submission: assessmentSubmissions })
    .from(assessmentSubmissions)
    .innerJoin(
      assessmentConfigs,
      eq(assessmentSubmissions.configId, assessmentConfigs.id)
    )
    .where(
      and(
        eq(assessmentSubmissions.companyId, companyId),
        eq(assessmentSubmissions.status, "approved"),
        eq(assessmentConfigs.tier, tier)
      )
    )
    .orderBy(desc(assessmentSubmissions.updatedAt))
    .limit(1);
  return rows[0]?.submission ?? null;
}

export async function getSubmissionByCompany(
  companyId: string
): Promise<AssessmentSubmissionRow | null> {
  const result = await db
    .select()
    .from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.companyId, companyId))
    .orderBy(desc(assessmentSubmissions.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getOrCreateSubmission(
  companyId: string,
  configId: string
): Promise<AssessmentSubmissionRow> {
  // Try to find an existing draft for this config
  const existing = await db
    .select()
    .from(assessmentSubmissions)
    .where(
      and(
        eq(assessmentSubmissions.companyId, companyId),
        eq(assessmentSubmissions.configId, configId),
        eq(assessmentSubmissions.status, "draft")
      )
    )
    .limit(1);

  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(assessmentSubmissions)
    .values({ companyId, configId, status: "draft" })
    .returning();
  return created;
}

export async function listSubmissionsAdmin({
  page,
  statusFilter,
}: {
  page: number;
  statusFilter?: AssessmentSubmissionRow["status"];
}): Promise<{ rows: AdminSubmissionRow[]; total: number; pageSize: number }> {
  const offset = (page - 1) * ADMIN_PAGE_SIZE;

  const rows = await db
    .select({
      submission: assessmentSubmissions,
      companyName: companies.name,
      configVersion: assessmentConfigs.version,
    })
    .from(assessmentSubmissions)
    .innerJoin(companies, eq(assessmentSubmissions.companyId, companies.id))
    .innerJoin(
      assessmentConfigs,
      eq(assessmentSubmissions.configId, assessmentConfigs.id)
    )
    .where(
      statusFilter ? eq(assessmentSubmissions.status, statusFilter) : undefined
    )
    .orderBy(desc(assessmentSubmissions.updatedAt))
    .limit(ADMIN_PAGE_SIZE)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(assessmentSubmissions)
    .where(
      statusFilter ? eq(assessmentSubmissions.status, statusFilter) : undefined
    );

  return {
    rows: rows.map((r) => ({
      ...r.submission,
      companyName: r.companyName,
      configVersion: r.configVersion,
    })),
    total: count,
    pageSize: ADMIN_PAGE_SIZE,
  };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function submitForReview(
  id: string
): Promise<AssessmentSubmissionRow> {
  const [updated] = await db
    .update(assessmentSubmissions)
    .set({ status: "submitted", submittedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(assessmentSubmissions.id, id),
        eq(assessmentSubmissions.status, "draft")
      )
    )
    .returning();
  if (!updated) throw new Error("Submission not found or not in draft status.");
  return updated;
}

export async function startReview(
  id: string,
  adminId: string
): Promise<AssessmentSubmissionRow> {
  const [updated] = await db
    .update(assessmentSubmissions)
    .set({
      status: "under_review",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(assessmentSubmissions.id, id),
        eq(assessmentSubmissions.status, "submitted")
      )
    )
    .returning();
  if (!updated)
    throw new Error("Submission not found or not in submitted status.");
  return updated;
}

export async function approveSubmission(
  id: string,
  adminId: string
): Promise<AssessmentSubmissionRow> {
  const [updated] = await db
    .update(assessmentSubmissions)
    .set({
      status: "approved",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(assessmentSubmissions.id, id))
    .returning();
  if (!updated) throw new Error("Submission not found.");
  return updated;
}

export async function rejectSubmission(
  id: string,
  adminId: string,
  notes: string
): Promise<AssessmentSubmissionRow> {
  const [updated] = await db
    .update(assessmentSubmissions)
    .set({
      status: "rejected",
      adminNotes: notes,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(assessmentSubmissions.id, id))
    .returning();
  if (!updated) throw new Error("Submission not found.");
  return updated;
}

export async function abortReview(
  id: string
): Promise<AssessmentSubmissionRow> {
  const [updated] = await db
    .update(assessmentSubmissions)
    .set({ status: "submitted", reviewedBy: null, reviewedAt: null, updatedAt: new Date() })
    .where(
      and(
        eq(assessmentSubmissions.id, id),
        eq(assessmentSubmissions.status, "under_review")
      )
    )
    .returning();
  if (!updated)
    throw new Error("Submission not found or not under review.");
  return updated;
}

export async function reopenSubmission(
  id: string
): Promise<AssessmentSubmissionRow> {
  const [updated] = await db
    .update(assessmentSubmissions)
    .set({ status: "draft", adminNotes: null, updatedAt: new Date() })
    .where(
      and(
        eq(assessmentSubmissions.id, id),
        eq(assessmentSubmissions.status, "rejected")
      )
    )
    .returning();
  if (!updated)
    throw new Error("Submission not found or not in rejected status.");
  return updated;
}
