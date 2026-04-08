import { NextResponse } from "next/server";
import { getBadgeByAssertionId } from "@/src/services/badgeService";
import { getCompanyBySlug } from "@/src/services/companyService";
import { eq } from "drizzle-orm";
import { db } from "@/src/db/db";
import { companies } from "@/src/db/schema";
import { env } from "@/src/env";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const base = env.NEXT_PUBLIC_APP_URL;

  const badge = await getBadgeByAssertionId(id);

  // Per Open Badges v2 spec: unknown assertion ID should return 404
  if (!badge) {
    return NextResponse.json({ error: "Assertion not found" }, { status: 404 });
  }

  // Fetch the associated company
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, badge.companyId))
    .limit(1);

  const assertion: Record<string, unknown> = {
    "@context": "https://w3id.org/openbadges/v2",
    type: "Assertion",
    id: `${base}/api/openbadges/assertion/${badge.assertionId}`,
    badge: `${base}/api/openbadges/badgeclass`,
    recipient: {
      type: "url",
      identity: company
        ? `${base}/companies/${company.slug}`
        : `${base}/companies`,
      hashed: false,
    },
    issuedOn: badge.issuedAt.toISOString(),
    verification: {
      type: "hosted",
    },
  };

  // Open Badges v2: revoked assertions include revoked: true
  if (badge.status === "revoked") {
    assertion.revoked = true;
    if (badge.revokedAt) {
      assertion.revocationReason = `Revoked on ${badge.revokedAt.toISOString()}`;
    }
  }

  return NextResponse.json(assertion, {
    headers: { "Content-Type": "application/ld+json" },
  });
}
