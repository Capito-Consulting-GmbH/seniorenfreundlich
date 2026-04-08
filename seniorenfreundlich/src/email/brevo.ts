import { BrevoClient } from "@getbrevo/brevo";
import * as Sentry from "@sentry/nextjs";
import { env } from "@/src/env";

type BadgeIssuedEmailArgs = {
  toEmail: string;
  companyName: string;
  companySlug: string;
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
