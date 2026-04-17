import { NextResponse } from "next/server";
import { env } from "@/src/env";

export async function GET() {
  const issuer = {
    "@context": "https://w3id.org/openbadges/v2",
    type: "Issuer",
    id: `${env.NEXT_PUBLIC_APP_URL}/api/openbadges/issuer`,
    name: "Seniorenfreundlich.org",
    url: env.NEXT_PUBLIC_APP_URL,
    email: "info@seniorenfreundlich.org",
    description:
      "Seniorenfreundlich.org zertifiziert Unternehmen, die besondere Rücksicht auf die Bedürfnisse älterer Menschen nehmen.",
  };

  return NextResponse.json(issuer, {
    headers: { "Content-Type": "application/ld+json" },
  });
}
