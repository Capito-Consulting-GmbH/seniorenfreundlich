import { NextResponse } from "next/server";
import { env } from "@/src/env";

export async function GET() {
  const base = env.NEXT_PUBLIC_APP_URL;

  const badgeClass = {
    "@context": "https://w3id.org/openbadges/v2",
    type: "BadgeClass",
    id: `${base}/api/openbadges/badgeclass`,
    name: "Seniorenfreundlich-Siegel",
    description:
      "Ausgezeichnet für Unternehmen, die seniorenfreundliche Leistungen, Barrierefreiheit und besondere Rücksicht auf ältere Kunden nachweislich umsetzen.",
    image: `${base}/badge.png`,
    criteria: {
      narrative:
        "Das Unternehmen hat die Kriterien für das Seniorenfreundlich-Siegel erfüllt und wurde durch Seniorenfreundlich.org geprüft und zertifiziert.",
    },
    issuer: `${base}/api/openbadges/issuer`,
  };

  return NextResponse.json(badgeClass, {
    headers: { "Content-Type": "application/ld+json" },
  });
}
