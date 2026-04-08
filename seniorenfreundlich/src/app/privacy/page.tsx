import type { Metadata } from "next";
import { LegalShell } from "@/src/components/LegalShell";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | Seniorenfreundlich.de",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Datenschutzerklärung">
      <p className="rounded bg-amber-50 p-3 text-sm text-amber-700">
        Diese Datenschutzerklärung wird von einem Rechtsanwalt geprüft und vervollständigt.
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>[Unternehmensname, Adresse, Kontakt — siehe Impressum]</p>

      <h2>2. Erhobene Daten</h2>
      <p>
        Wir erheben und verarbeiten folgende personenbezogene Daten, wenn Sie unsere
        Dienste nutzen: Name, E-Mail-Adresse, Unternehmensdaten sowie Zahlungsinformationen
        (verarbeitet durch Mollie B.V.).
      </p>

      <h2>3. Zweck der Verarbeitung</h2>
      <p>
        Die Daten werden ausschließlich zur Erbringung unserer Zertifizierungsleistung,
        zur Kommunikation mit Ihnen und zur Abwicklung von Zahlungen verwendet.
      </p>

      <h2>4. Weitergabe an Dritte</h2>
      <p>
        Daten werden nur an Dienstleister weitergegeben, die zur Erbringung unserer
        Leistungen notwendig sind (Clerk Inc. für Authentifizierung, Mollie B.V. für
        Zahlungen, Brevo SAS für E-Mail-Versand). Alle Partner sind vertraglich zur
        Einhaltung der DSGVO verpflichtet.
      </p>

      <h2>5. Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
        Verarbeitung sowie Datenübertragbarkeit. Wenden Sie sich hierzu an [E-Mail-Adresse].
      </p>

      <h2>6. Cookies und Tracking</h2>
      <p>
        Diese Website verwendet Cookies. Ihre Einwilligung wird über Cookiebot eingeholt.
        Analyse-Daten werden via Google Analytics 4 nur bei erteilter Einwilligung erhoben.
      </p>

      <h2>7. Kontakt Datenschutz</h2>
      <p>[Datenschutzbeauftragter oder Kontaktadresse]</p>
    </LegalShell>
  );
}
