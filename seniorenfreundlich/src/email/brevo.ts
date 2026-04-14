import { BrevoClient } from "@getbrevo/brevo";
import * as Sentry from "@sentry/nextjs";
import { env } from "@/src/env";

type BadgeIssuedEmailArgs = {
  toEmail: string;
  companyName: string;
  companySlug: string;
};

type VerificationCodeEmailArgs = {
  toEmail: string;
  companyName: string;
  code: string;
};

const defaultSender = {
  email: "no-reply@seniorenfreundlich.de",
  name: "Seniorenfreundlich",
};

const brevo = new BrevoClient({
  apiKey: env.BREVO_API_KEY,
});

export async function sendBadgeIssuedEmail({
  toEmail,
  companyName,
  companySlug,
}: BadgeIssuedEmailArgs): Promise<void> {
  const certificateUrl = `${env.NEXT_PUBLIC_APP_URL}/certificate/${companySlug}`;
  const dashboardUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/badge`;

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: defaultSender,
      to: [{ email: toEmail }],
      subject: "Ihr Seniorenfreundlich-Siegel ist aktiv",
      htmlContent: `
        <p>Hallo ${companyName},</p>
        <p>Ihr Seniorenfreundlich-Siegel wurde erfolgreich aktiviert.</p>
        <p>Zertifikat: <a href="${certificateUrl}">${certificateUrl}</a></p>
        <p>Embed-Code und Verwaltung: <a href="${dashboardUrl}">${dashboardUrl}</a></p>
        <p>Viele Gruesse<br/>Seniorenfreundlich.de</p>
      `,
    });
  } catch (error) {
    Sentry.captureException(error);
  }
}

export async function sendVerificationCodeEmail({
  toEmail,
  companyName,
  code,
}: VerificationCodeEmailArgs): Promise<void> {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: defaultSender,
      to: [{ email: toEmail }],
      subject: "Ihr Bestätigungscode für Seniorenfreundlich",
      htmlContent: `
        <p>Hallo ${companyName},</p>
        <p>Ihr Bestätigungscode lautet:</p>
        <p style="font-size:2rem;font-weight:bold;letter-spacing:0.3em;margin:16px 0;">${code}</p>
        <p>Der Code ist <strong>1 Stunde</strong> gültig.</p>
        <p>Falls Sie keine Registrierung bei Seniorenfreundlich.de vorgenommen haben, ignorieren Sie diese E-Mail bitte.</p>
        <p>Viele Grüße<br/>Seniorenfreundlich.de</p>
      `,
    });
  } catch (error) {
    Sentry.captureException(error);
  }
}
