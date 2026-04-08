import type { Metadata } from "next";
import { LegalShell } from "@/src/components/LegalShell";

export const metadata: Metadata = {
  title: "Widerrufsbelehrung | Seniorenfreundlich.de",
};

export default function CancellationPage() {
  return (
    <LegalShell title="Widerrufsbelehrung">
      <p className="rounded bg-amber-50 p-3 text-sm text-amber-700">
        Diese Widerrufsbelehrung wird von einem Rechtsanwalt geprüft und vervollständigt.
      </p>

      <h2>Widerrufsrecht</h2>
      <p>
        Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen
        Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des
        Vertragsabschlusses.
      </p>
      <p>
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns ([Unternehmensname], [Adresse],
        [E-Mail]) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter
        Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen,
        informieren.
      </p>

      <h2>Folgen des Widerrufs</h2>
      <p>
        Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von
        Ihnen erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem
        Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags
        bei uns eingegangen ist.
      </p>

      <h2>Erlöschen des Widerrufsrechts</h2>
      <p>
        Das Widerrufsrecht erlischt vorzeitig, wenn wir mit der Ausführung der
        Dienstleistung begonnen haben und Sie ausdrücklich zugestimmt haben, dass wir
        mit der Ausführung der Dienstleistung vor Ablauf der Widerrufsfrist beginnen,
        und Sie Ihre Kenntnis davon bestätigt haben, dass Sie durch Ihre Zustimmung mit
        Beginn der Ausführung des Vertrags Ihr Widerrufsrecht verlieren.
      </p>
    </LegalShell>
  );
}
