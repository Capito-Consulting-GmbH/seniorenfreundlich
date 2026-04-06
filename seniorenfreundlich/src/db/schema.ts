import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "failed",
  "expired",
  "refunded",
]);

export const badgeStatusEnum = pgEnum("badge_status", ["active", "revoked"]);

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ownerClerkUserId: text("owner_clerk_user_id").notNull(),
    // [domain] fields — seniorenfreundlich.de specific
    description: text("description"),
    website: text("website"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    city: text("city"),
    postalCode: text("postal_code"),
    country: text("country").default("DE"),
    logoUrl: text("logo_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("companies_slug_idx").on(t.slug),
    index("companies_owner_idx").on(t.ownerClerkUserId),
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
