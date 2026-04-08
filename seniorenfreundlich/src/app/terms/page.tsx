import type { Metadata } from "next";
import { LegalShell } from "@/src/components/LegalShell";

export const metadata: Metadata = {
  title: "AGB | Seniorenfreundlich.de",
};

export default function TermsPage() {
  return (
    <LegalShell title="Allgemeine Geschäftsbedingungen">
      <p className="rounded bg-amber-50 p-3 text-sm text-amber-700">
        Diese AGB werden von einem Rechtsanwalt geprüft und vervollständigt.
      </p>

      <h2>§ 1 Geltungsbereich</h2>
      <p>
        Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen
        Seniorenfreundlich.de ([Unternehmensname]) und Unternehmen, die das
        Seniorenfreundlich-Siegel erwerben.
      </p>

      <h2>§ 2 Vertragsgegenstand</h2>
      <p>
        Seniorenfreundlich.de verleiht gegen einmalige Gebühr das
        „Seniorenfreundlich-Siegel" als digitales Zertifikat (Open Badge). Das Siegel
        berechtigt zur Nutzung des zugehörigen Zeichens auf eigenen Kommunikationsmitteln
        für die Laufzeit des aktiven Siegels.
      </p>

      <h2>§ 3 Vertragsschluss und Zahlung</h2>
      <p>
        Der Vertrag kommt durch Abschluss des Bestellprozesses auf der Plattform und
        erfolgreiche Zahlung zustande. Die Zahlung erfolgt einmalig über den
        Zahlungsdienstleister Mollie B.V.
      </p>

      <h2>§ 4 Widerruf</h2>
      <p>
        Verbraucher haben das gesetzliche Widerrufsrecht. Näheres entnehmen Sie der
        <a href="/cancellation"> Widerrufsbelehrung</a>.
      </p>

      <h2>§ 5 Haftung</h2>
      <p>
        [Haftungsausschluss und -beschränkungen — durch Rechtsanwalt auszufüllen]
      </p>

      <h2>§ 6 Anwendbares Recht</h2>
      <p>Es gilt das Recht der Bundesrepublik Deutschland.</p>
    </LegalShell>
  );
}
