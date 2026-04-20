/**
 * Seed script — populates the database with realistic lifecycle data for local development.
 *
 * Usage: npx tsx scripts/seed.ts
 *
 * Guards:
 *  - Requires DATABASE_URL env var (same as app)
 *  - Refuses to run if NODE_ENV=production
 *  - Idempotent: checks for existing data before inserting
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import {
  user,
  account,
  companies,
  assessmentConfigs,
  assessmentSubmissions,
  assessmentAnswers,
  badges,
  orders,
  auditEvents,
} from "../src/db/schema";

// ─── Guards ───────────────────────────────────────────────────────────────────

if (process.env.NODE_ENV === "production") {
  console.error("🚫  Seed script must not run in production.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("🚫  DATABASE_URL env var is required.");
  process.exit(1);
}

const db = drizzle(neon(process.env.DATABASE_URL!));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function ensureUser(id: string, name: string, email: string, role: string) {
  // Check by email (unique) — the pre-seeded ID may differ
  const existing = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (existing[0]) {
    console.log(`  ✓ user ${email} already exists`);
    return existing[0];
  }
  const [u] = await db
    .insert(user)
    .values({
      id,
      name,
      email,
      emailVerified: true,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  // Insert account row for email/password login (only if not already present)
  const existingAcct = await db.select().from(account)
    .where(and(eq(account.userId, u.id), eq(account.providerId, "credential"))).limit(1);
  if (!existingAcct[0]) {
    await db.insert(account).values({
      id: `acct-${u.id}`,
      accountId: u.id,
      providerId: "credential",
      userId: u.id,
      // bcrypt hash of "Password1!" — do NOT use in production
      password: "$2b$10$9/ShqflmHHKUCk4ylB97QucUJz5lIhA3IYRRjXbKJCjxFiOsKbNB6",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log(`  + created user ${email}`);
  return u;
}

async function ensureCompany(id: string, name: string, ownerUserId: string, verified: boolean) {
  const slug = slugify(name);
  // Check by slug (unique) — existing company may have a different UUID
  const existing = await db.select().from(companies).where(eq(companies.slug, slug)).limit(1);
  if (existing[0]) {
    console.log(`  ✓ company ${name} already exists`);
    return existing[0];
  }
  const [c] = await db
    .insert(companies)
    .values({
      id,
      name,
      slug: slugify(name),
      ownerUserId,
      email: `info@${slugify(name)}.de`,
      website: `https://www.${slugify(name)}.de`,
      city: "Berlin",
      country: "DE",
      verificationStatus: verified ? "verified" : "unverified",
      verifiedAt: verified ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  console.log(`  + created company ${name}`);
  return c;
}

async function ensureConfig(
  id: string,
  version: number,
  tier: "basic" | "standard" | "premium",
  status: "draft" | "active" | "archived",
  createdBy: string
) {
  // First try to find by our fixed ID
  const existById = await db.select().from(assessmentConfigs)
    .where(eq(assessmentConfigs.id, id)).limit(1);
  if (existById[0]) {
    console.log(`  ✓ config v${version} (${tier}) already exists`);
    return existById[0];
  }
  // Also check if an active config for this tier already exists (created by app, not seed)
  const existByTier = await db.select().from(assessmentConfigs)
    .where(and(eq(assessmentConfigs.tier, tier), eq(assessmentConfigs.status, "active"))).limit(1);
  if (existByTier[0]) {
    console.log(`  ✓ active config for tier ${tier} already exists (id=${existByTier[0].id})`);
    return existByTier[0];
  }
  const tierLabel = { basic: "Basic", standard: "Standard", premium: "Premium" }[tier];
  const [c] = await db
    .insert(assessmentConfigs)
    .values({
      id,
      version,
      tier,
      status,
      title: { de: `Seniorenfreundlich ${tierLabel}-Fragebogen`, en: `Seniorenfreundlich ${tierLabel} Questionnaire` },
      config: buildSampleConfig(tier),
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  console.log(`  + created config v${version} (${tier}, ${status})`);
  return c;
}

function buildSampleConfig(tier: "basic" | "standard" | "premium") {
  const extraSections = tier === "premium" ? 2 : tier === "standard" ? 1 : 0;
  const sections = [
    {
      id: "section-1",
      title: { de: "Barrierefreiheit", en: "Accessibility" },
      questions: [
        {
          id: "q1",
          type: "yes-no",
          required: true,
          label: { de: "Ist der Eingang barrierefrei zugänglich?", en: "Is the entrance accessible without barriers?" },
        },
        {
          id: "q2",
          type: "single-choice",
          required: true,
          label: { de: "Wie viele Stufen hat der Eingang?", en: "How many steps does the entrance have?" },
          options: [
            { id: "option-1", label: { de: "Keine", en: "None" } },
            { id: "option-2", label: { de: "1–2", en: "1–2" } },
            { id: "option-3", label: { de: "3 oder mehr", en: "3 or more" } },
          ],
        },
      ],
    },
    {
      id: "section-2",
      title: { de: "Personal", en: "Staff" },
      questions: [
        {
          id: "q3",
          type: "yes-no",
          required: true,
          label: { de: "Wurde Personal in seniorengerechter Kommunikation geschult?", en: "Has staff been trained in senior-friendly communication?" },
        },
        {
          id: "q4",
          type: "textarea",
          required: false,
          label: { de: "Beschreiben Sie die Schulungsmaßnahmen.", en: "Describe the training measures." },
        },
      ],
    },
  ];
  for (let i = 0; i < extraSections; i++) {
    sections.push({
      id: `section-extra-${i + 1}`,
      title: { de: `Erweiterte Kriterien ${i + 1}`, en: `Extended Criteria ${i + 1}` },
      questions: [
        {
          id: `q-extra-${i + 1}`,
          type: "yes-no",
          required: true,
          label: { de: "Wird ein Seniorenrabatt angeboten?", en: "Is a senior discount offered?" },
        },
      ],
    });
  }
  return { sections };
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

// Fixed UUIDs for deterministic/idempotent seeding
const IDS = {
  // Users (text IDs via better-auth)
  userAdmin:    "seed-admin-00000000-0000-0000-0000-000000000001",
  userAcme:     "seed-user-00000000-0000-0000-0000-000000000002",
  userBaum:     "seed-user-00000000-0000-0000-0000-000000000003",
  userTreff:    "seed-user-00000000-0000-0000-0000-000000000004",
  userAltJung:  "seed-user-00000000-0000-0000-0000-000000000005",
  // Companies (uuid)
  companyAcme:  "10000000-0000-0000-0000-000000000001",
  companyBaum:  "10000000-0000-0000-0000-000000000002",
  companyTreff: "10000000-0000-0000-0000-000000000003",
  companyAltJ:  "10000000-0000-0000-0000-000000000004",
  // Configs (uuid)
  configBasic:    "20000000-0000-0000-0000-000000000001",
  configStandard: "20000000-0000-0000-0000-000000000002",
  configPremium:  "20000000-0000-0000-0000-000000000003",
  // Submissions (uuid)
  subAcmeBasic:       "30000000-0000-0000-0000-000000000001",
  subBaumStandard:    "30000000-0000-0000-0000-000000000002",
  subTreffDraft:      "30000000-0000-0000-0000-000000000003",
  subAcmeRejected:    "30000000-0000-0000-0000-000000000004",
  // Answers (uuid)
  ansAcme1: "40000000-0000-0000-0000-000000000001",
  ansAcme2: "40000000-0000-0000-0000-000000000002",
  ansAcme3: "40000000-0000-0000-0000-000000000003",
  ansAcme4: "40000000-0000-0000-0000-000000000004",
  // Orders (uuid)
  orderAcmeBasic: "50000000-0000-0000-0000-000000000001",
  // Badges (uuid)
  badgeAcmeBasic: "60000000-0000-0000-0000-000000000001",
  // Audit events (uuid)
  audit1: "70000000-0000-0000-0000-000000000001",
  audit2: "70000000-0000-0000-0000-000000000002",
  audit3: "70000000-0000-0000-0000-000000000003",
  audit4: "70000000-0000-0000-0000-000000000004",
  audit5: "70000000-0000-0000-0000-000000000005",
} as const;

async function seed() {
  console.log("\n🌱 Seeding database…\n");

  // ─── Users ────────────────────────────────────────────────────────────────
  console.log("👤 Users:");
  const admin    = await ensureUser(IDS.userAdmin,   "Admin User",   "admin@seniorenfreundlich.org", "admin");
  const userAcme = await ensureUser(IDS.userAcme,    "Lena Müller",  "lena@acme.de",                "user");
  const userBaum = await ensureUser(IDS.userBaum,    "Thomas Bauer", "thomas@baumgarten.de",         "user");
  const userTreff   = await ensureUser(IDS.userTreff,   "Petra Scholz",  "petra@seniorentreff.de",  "user");
  const userAltJung = await ensureUser(IDS.userAltJung, "Klaus Richter", "klaus@altundjung.de",      "user");

  // ─── Configs (one per tier, all active) ──────────────────────────────────
  console.log("\n📋 Assessment configs:");
  const configBasic    = await ensureConfig(IDS.configBasic,    100, "basic",    "active", admin.id);
  const configStandard = await ensureConfig(IDS.configStandard, 101, "standard", "active", admin.id);
  const configPremium  = await ensureConfig(IDS.configPremium,  102, "premium",  "active", admin.id);

  // ─── Companies ────────────────────────────────────────────────────────────
  console.log("\n🏢 Companies:");
  const companyAcme  = await ensureCompany(IDS.companyAcme,  "Acme GmbH",         userAcme.id,    true);
  const companyBaum  = await ensureCompany(IDS.companyBaum,  "Baumgarten Pflege", userBaum.id,    true);
  const companyTreff = await ensureCompany(IDS.companyTreff, "Senioren Treff",    userTreff.id,   false);
  const companyAltJ  = await ensureCompany(IDS.companyAltJ,  "Alt und Jung KG",   userAltJung.id, true);

  // ─── Submissions ─────────────────────────────────────────────────────────
  console.log("\n📝 Submissions:");

  // Acme: basic submission — approved
  const existAcmeBasic = await db.select().from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.id, IDS.subAcmeBasic)).limit(1);
  if (!existAcmeBasic[0]) {
    await db.insert(assessmentSubmissions).values({
      id: IDS.subAcmeBasic,
      companyId: companyAcme.id,
      configId: configBasic.id,
      status: "approved",
      reviewedBy: admin.id,
      reviewedAt: new Date(Date.now() - 7 * 86400_000),
      submittedAt: new Date(Date.now() - 10 * 86400_000),
      createdAt: new Date(Date.now() - 14 * 86400_000),
      updatedAt: new Date(Date.now() - 7 * 86400_000),
    });
    await db.insert(assessmentAnswers).values([
      { id: IDS.ansAcme1, submissionId: IDS.subAcmeBasic, questionId: "q1", value: true  as unknown as Record<string, unknown>, createdAt: new Date(), updatedAt: new Date() },
      { id: IDS.ansAcme2, submissionId: IDS.subAcmeBasic, questionId: "q2", value: { selected: "option-1" }, createdAt: new Date(), updatedAt: new Date() },
      { id: IDS.ansAcme3, submissionId: IDS.subAcmeBasic, questionId: "q3", value: true  as unknown as Record<string, unknown>, createdAt: new Date(), updatedAt: new Date() },
      { id: IDS.ansAcme4, submissionId: IDS.subAcmeBasic, questionId: "q4", value: { text: "Jährliche Schulungen für alle Mitarbeiter." }, createdAt: new Date(), updatedAt: new Date() },
    ]);
    console.log("  + created approved basic submission for Acme");
  } else {
    console.log("  ✓ Acme basic submission already exists");
  }

  // Baumgarten: standard submission — under_review
  const existBaumStd = await db.select().from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.id, IDS.subBaumStandard)).limit(1);
  if (!existBaumStd[0]) {
    await db.insert(assessmentSubmissions).values({
      id: IDS.subBaumStandard,
      companyId: companyBaum.id,
      configId: configStandard.id,
      status: "under_review",
      reviewedBy: admin.id,
      reviewedAt: new Date(Date.now() - 1 * 86400_000),
      submittedAt: new Date(Date.now() - 3 * 86400_000),
      createdAt: new Date(Date.now() - 5 * 86400_000),
      updatedAt: new Date(Date.now() - 1 * 86400_000),
    });
    console.log("  + created under_review standard submission for Baumgarten");
  } else {
    console.log("  ✓ Baumgarten standard submission already exists");
  }

  // Senioren Treff: basic submission — draft
  const existTreffDraft = await db.select().from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.id, IDS.subTreffDraft)).limit(1);
  if (!existTreffDraft[0]) {
    await db.insert(assessmentSubmissions).values({
      id: IDS.subTreffDraft,
      companyId: companyTreff.id,
      configId: configBasic.id,
      status: "draft",
      createdAt: new Date(Date.now() - 2 * 86400_000),
      updatedAt: new Date(Date.now() - 1 * 86400_000),
    });
    console.log("  + created draft basic submission for Senioren Treff");
  } else {
    console.log("  ✓ Senioren Treff draft submission already exists");
  }

  // Acme: standard submission — rejected
  const existAcmeRejected = await db.select().from(assessmentSubmissions)
    .where(eq(assessmentSubmissions.id, IDS.subAcmeRejected)).limit(1);
  if (!existAcmeRejected[0]) {
    await db.insert(assessmentSubmissions).values({
      id: IDS.subAcmeRejected,
      companyId: companyAcme.id,
      configId: configStandard.id,
      status: "rejected",
      adminNotes: "Bitte Nachweise zur Schulung einreichen.",
      reviewedBy: admin.id,
      reviewedAt: new Date(Date.now() - 4 * 86400_000),
      submittedAt: new Date(Date.now() - 6 * 86400_000),
      createdAt: new Date(Date.now() - 8 * 86400_000),
      updatedAt: new Date(Date.now() - 4 * 86400_000),
    });
    console.log("  + created rejected standard submission for Acme");
  } else {
    console.log("  ✓ Acme rejected submission already exists");
  }

  // ─── Orders ───────────────────────────────────────────────────────────────
  console.log("\n💳 Orders:");
  const existOrderAcme = await db.select().from(orders)
    .where(eq(orders.id, IDS.orderAcmeBasic)).limit(1);
  if (!existOrderAcme[0]) {
    await db.insert(orders).values({
      id: IDS.orderAcmeBasic,
      companyId: companyAcme.id,
      molliePaymentId: "tr_seed_acme_basic_00000001",
      amount: 4900,
      currency: "EUR",
      status: "paid",
      tier: "basic",
      createdAt: new Date(Date.now() - 6 * 86400_000),
      updatedAt: new Date(Date.now() - 6 * 86400_000),
    });
    console.log("  + created paid basic order for Acme");
  } else {
    console.log("  ✓ Acme basic order already exists");
  }

  // ─── Badges ───────────────────────────────────────────────────────────────
  console.log("\n🏅 Badges:");
  const existBadgeAcme = await db.select().from(badges)
    .where(eq(badges.id, IDS.badgeAcmeBasic)).limit(1);
  if (!existBadgeAcme[0]) {
    await db.insert(badges).values({
      id: IDS.badgeAcmeBasic,
      companyId: companyAcme.id,
      assertionId: "a1b2c3d4-5e6f-0000-0000-000000000001",
      status: "active",
      tier: "basic",
      issuedAt: new Date(Date.now() - 6 * 86400_000),
    });
    console.log("  + created active basic badge for Acme");
  } else {
    console.log("  ✓ Acme basic badge already exists");
  }

  // ─── Audit events ─────────────────────────────────────────────────────────
  console.log("\n📋 Audit events:");
  const existAudit = await db.select().from(auditEvents)
    .where(eq(auditEvents.id, IDS.audit1)).limit(1);
  if (!existAudit[0]) {
    await db.insert(auditEvents).values([
      {
        id: IDS.audit1,
        entityType: "assessment_submission",
        entityId: IDS.subAcmeBasic,
        action: "assessment_approved",
        actorId: admin.id,
        metadata: { companyId: companyAcme.id },
        createdAt: new Date(Date.now() - 7 * 86400_000),
      },
      {
        id: IDS.audit2,
        entityType: "order",
        entityId: IDS.orderAcmeBasic,
        action: "payment_confirmed",
        actorId: "mollie:webhook",
        metadata: { paymentId: "tr_seed_acme_basic_00000001", tier: "basic" },
        createdAt: new Date(Date.now() - 6 * 86400_000),
      },
      {
        id: IDS.audit3,
        entityType: "badge",
        entityId: IDS.badgeAcmeBasic,
        action: "badge_active",
        actorId: "mollie:webhook",
        metadata: { companyId: companyAcme.id, tier: "basic" },
        createdAt: new Date(Date.now() - 6 * 86400_000),
      },
      {
        id: IDS.audit4,
        entityType: "assessment_submission",
        entityId: IDS.subBaumStandard,
        action: "assessment_review_started",
        actorId: admin.id,
        createdAt: new Date(Date.now() - 1 * 86400_000),
      },
      {
        id: IDS.audit5,
        entityType: "assessment_submission",
        entityId: IDS.subAcmeRejected,
        action: "assessment_rejected",
        actorId: admin.id,
        metadata: { notes: "Bitte Nachweise zur Schulung einreichen." },
        createdAt: new Date(Date.now() - 4 * 86400_000),
      },
    ]);
    console.log("  + created 5 audit events");
  } else {
    console.log("  ✓ Audit events already exist");
  }

  console.log("\n✅  Seed complete.\n");
  console.log("  Admin login:  admin@seniorenfreundlich.org / Password1!");
  console.log("  User (Acme):  lena@acme.de / Password1!");
  console.log("  User (Baum):  thomas@baumgarten.de / Password1!");
  console.log("  User (Treff): petra@seniorentreff.de / Password1!");
  console.log("");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
