import type { Metadata } from "next";
import { LegalShell } from "@/src/components/LegalShell";

export const metadata: Metadata = {
  title: "Impressum | Seniorenfreundlich.de",
};

export default function ImpressumPage() {
  return (
    <LegalShell title="Impressum">
      <p className="text-sm text-amber-700 bg-amber-50 rounded p-3 mb-6">
        Dieses Impressum wird von einem Rechtsanwalt geprüft und vervollständigt.
      </p>

      <h2>Angaben gemäß § 5 TMG</h2>
      <p>
        [Unternehmensname]<br />
        [Straße und Hausnummer]<br />
        [PLZ] [Stadt]<br />
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: [Telefonnummer]<br />
        E-Mail: [E-Mail-Adresse]
      </p>

      <h2>Vertreten durch</h2>
      <p>[Geschäftsführer / Inhaber]</p>

      <h2>Registereintrag</h2>
      <p>
        Registergericht: [Amtsgericht]<br />
        Registernummer: [HRB-Nummer]
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
        [USt-IdNr.]
      </p>

      <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
      <p>
        [Name]<br />
        [Anschrift]
      </p>
    </LegalShell>
  );
}
