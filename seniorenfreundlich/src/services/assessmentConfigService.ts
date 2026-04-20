import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/src/db/db";
import { assessmentConfigs, user } from "@/src/db/schema";
import {
  assessmentConfigSchema,
  type AssessmentConfig,
} from "@/src/validators/assessment";

export type AssessmentConfigRow = typeof assessmentConfigs.$inferSelect;

export type AdminConfigRow = AssessmentConfigRow & { createdByName: string };

const ADMIN_PAGE_SIZE = 25;

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getActiveConfig(): Promise<AssessmentConfigRow | null> {
  const result = await db
    .select()
    .from(assessmentConfigs)
    .where(eq(assessmentConfigs.status, "active"))
    .limit(1);
  return result[0] ?? null;
}

export async function getActiveConfigByTier(
  tier: "basic" | "standard" | "premium"
): Promise<AssessmentConfigRow | null> {
  const result = await db
    .select()
    .from(assessmentConfigs)
    .where(
      and(
        eq(assessmentConfigs.status, "active"),
        eq(assessmentConfigs.tier, tier)
      )
    )
    .limit(1);
  return result[0] ?? null;
}

export async function getConfigById(
  id: string
): Promise<AssessmentConfigRow | null> {
  const result = await db
    .select()
    .from(assessmentConfigs)
    .where(eq(assessmentConfigs.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function listConfigs({
  page,
}: {
  page: number;
}): Promise<{ rows: AdminConfigRow[]; total: number; pageSize: number }> {
  const offset = (page - 1) * ADMIN_PAGE_SIZE;

  const rows = await db
    .select({
      config: assessmentConfigs,
      createdByName: user.name,
    })
    .from(assessmentConfigs)
    .leftJoin(user, eq(assessmentConfigs.createdBy, user.id))
    .orderBy(desc(assessmentConfigs.version))
    .limit(ADMIN_PAGE_SIZE)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(assessmentConfigs);

  return {
    rows: rows.map((r) => ({
      ...r.config,
      createdByName: r.createdByName ?? "Unknown",
    })),
    total: count,
    pageSize: ADMIN_PAGE_SIZE,
  };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createConfig(
  title: { de: string; en: string },
  createdBy: string,
  tier: "basic" | "standard" | "premium" = "basic"
): Promise<AssessmentConfigRow> {
  // Determine next version number
  const [{ maxVersion }] = await db
    .select({ maxVersion: sql<number>`coalesce(max(version), 0)::int` })
    .from(assessmentConfigs);

  const [config] = await db
    .insert(assessmentConfigs)
    .values({
      version: maxVersion + 1,
      status: "draft",
      tier,
      title,
      config: { sections: [] },
      createdBy,
    })
    .returning();
  return config;
}

export async function updateDraftConfig(
  id: string,
  title: { de: string; en: string },
  config: AssessmentConfig
): Promise<AssessmentConfigRow> {
  const validated = assessmentConfigSchema.parse(config);

  const [updated] = await db
    .update(assessmentConfigs)
    .set({
      title,
      config: validated as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .where(and(eq(assessmentConfigs.id, id), eq(assessmentConfigs.status, "draft")))
    .returning();

  if (!updated) throw new Error("Config not found or not in draft status.");
  return updated;
}

export async function publishConfig(id: string): Promise<AssessmentConfigRow> {
  // Archive any currently active config, then publish this draft.
  // Neon HTTP driver doesn't support transactions, so we use sequential updates.
  await db
    .update(assessmentConfigs)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(assessmentConfigs.status, "active"));

  const [published] = await db
    .update(assessmentConfigs)
    .set({ status: "active", updatedAt: new Date() })
    .where(
      and(eq(assessmentConfigs.id, id), eq(assessmentConfigs.status, "draft"))
    )
    .returning();

  if (!published) throw new Error("Config not found or not in draft status.");
  return published;
}

export async function deleteConfig(id: string): Promise<void> {
  const config = await getConfigById(id);
  if (!config) throw new Error("Config not found.");
  if (config.status !== "draft") throw new Error("Only draft configs can be deleted.");

  await db.delete(assessmentConfigs).where(eq(assessmentConfigs.id, id));
}

export async function duplicateConfig(
  id: string,
  createdBy: string
): Promise<AssessmentConfigRow> {
  const source = await getConfigById(id);
  if (!source) throw new Error("Config not found.");

  const [{ maxVersion }] = await db
    .select({ maxVersion: sql<number>`coalesce(max(version), 0)::int` })
    .from(assessmentConfigs);

  const [copy] = await db
    .insert(assessmentConfigs)
    .values({
      version: maxVersion + 1,
      status: "draft",
      title: source.title as { de: string; en: string },
      config: source.config,
      createdBy,
    })
    .returning();
  return copy;
}
