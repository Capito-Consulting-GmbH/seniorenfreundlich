import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ─── better-auth core tables ─────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  // better-auth admin plugin
  role: text("role").default("user"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // better-auth admin plugin
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ─── application tables ───────────────────────────────────────────────────────

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "failed",
  "expired",
  "refunded",
]);

export const badgeStatusEnum = pgEnum("badge_status", ["active", "revoked"]);

export const tierEnum = pgEnum("tier", ["basic", "standard", "premium"]);

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ownerUserId: text("owner_user_id").notNull(),
    // [domain] fields — seniorenfreundlich.org specific
    description: text("description"),
    website: text("website"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    city: text("city"),
    postalCode: text("postal_code"),
    country: text("country").default("DE"),
    logoUrl: text("logo_url"),
    // ─── registration / verification ──────────────────────────────────────────
    hrbNumber: text("hrb_number"),
    verificationStatus: text("verification_status").default("unverified").notNull(),
    verificationToken: text("verification_token"),
    verificationTokenExpiresAt: timestamp("verification_token_expires_at"),
    verificationAttempts: integer("verification_attempts").default(0).notNull(),
    verifiedAt: timestamp("verified_at"),
    pendingMolliePaymentId: text("pending_mollie_payment_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("companies_slug_idx").on(t.slug),
    index("companies_owner_idx").on(t.ownerUserId),
  ]
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    molliePaymentId: text("mollie_payment_id"),
    mollieOrderId: text("mollie_order_id"),
    amount: integer("amount").notNull(), // stored in cents, e.g. 9900 = 99.00 EUR
    currency: text("currency").notNull().default("EUR"),
    status: orderStatusEnum("status").notNull().default("pending"),
    tier: tierEnum("tier").notNull().default("basic"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("orders_company_idx").on(t.companyId)]
);

export const badges = pgTable(
  "badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    assertionId: uuid("assertion_id").notNull().defaultRandom(),
    status: badgeStatusEnum("status").notNull().default("active"),
    tier: tierEnum("tier").notNull().default("basic"),
    issuedAt: timestamp("issued_at").defaultNow().notNull(),
    revokedAt: timestamp("revoked_at"),
  },
  (t) => [
    index("badges_company_idx").on(t.companyId),
    uniqueIndex("badges_assertion_idx").on(t.assertionId),
  ]
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    actorId: text("actor_id").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("audit_events_entity_idx").on(t.entityId)]
);

// ─── Assessment tables ────────────────────────────────────────────────────────

export const assessmentConfigStatusEnum = pgEnum("assessment_config_status", [
  "draft",
  "active",
  "archived",
]);

export const assessmentSubmissionStatusEnum = pgEnum(
  "assessment_submission_status",
  ["draft", "submitted", "under_review", "approved", "rejected"]
);

export const assessmentConfigs = pgTable(
  "assessment_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    version: integer("version").notNull().unique(),
    status: assessmentConfigStatusEnum("status").notNull().default("draft"),
    tier: tierEnum("tier").notNull().default("basic"),
    title: jsonb("title").notNull().$type<{ de: string; en: string }>(),
    config: jsonb("config").notNull().$type<Record<string, unknown>>(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("assessment_configs_status_idx").on(t.status),
    index("assessment_configs_tier_idx").on(t.tier),
    uniqueIndex("assessment_configs_active_tier_idx")
      .on(t.tier)
      .where(sql`status = 'active'`),
  ]
);

export const assessmentSubmissions = pgTable(
  "assessment_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    configId: uuid("config_id")
      .notNull()
      .references(() => assessmentConfigs.id),
    status: assessmentSubmissionStatusEnum("status").notNull().default("draft"),
    adminNotes: text("admin_notes"),
    reviewedBy: text("reviewed_by").references(() => user.id),
    reviewedAt: timestamp("reviewed_at"),
    submittedAt: timestamp("submitted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("assessment_submissions_company_idx").on(t.companyId),
    index("assessment_submissions_config_idx").on(t.configId),
    index("assessment_submissions_status_idx").on(t.status),
  ]
);

export const assessmentAnswers = pgTable(
  "assessment_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => assessmentSubmissions.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    value: jsonb("value").notNull().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("assessment_answers_submission_question_idx").on(
      t.submissionId,
      t.questionId
    ),
  ]
);

export const assessmentFiles = pgTable("assessment_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  answerId: uuid("answer_id")
    .notNull()
    .references(() => assessmentAnswers.id, { onDelete: "cascade" }),
  blobUrl: text("blob_url").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const assessmentConfigsRelations = relations(
  assessmentConfigs,
  ({ many }) => ({
    submissions: many(assessmentSubmissions),
  })
);

export const assessmentSubmissionsRelations = relations(
  assessmentSubmissions,
  ({ one, many }) => ({
    config: one(assessmentConfigs, {
      fields: [assessmentSubmissions.configId],
      references: [assessmentConfigs.id],
    }),
    company: one(companies, {
      fields: [assessmentSubmissions.companyId],
      references: [companies.id],
    }),
    answers: many(assessmentAnswers),
  })
);

export const assessmentAnswersRelations = relations(
  assessmentAnswers,
  ({ one, many }) => ({
    submission: one(assessmentSubmissions, {
      fields: [assessmentAnswers.submissionId],
      references: [assessmentSubmissions.id],
    }),
    files: many(assessmentFiles),
  })
);

export const assessmentFilesRelations = relations(
  assessmentFiles,
  ({ one }) => ({
    answer: one(assessmentAnswers, {
      fields: [assessmentFiles.answerId],
      references: [assessmentAnswers.id],
    }),
  })
);
