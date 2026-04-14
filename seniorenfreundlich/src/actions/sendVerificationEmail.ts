"use server";

import { randomInt, createHash } from "crypto";
import { getCurrentUser } from "@/src/auth/getCurrentUser";
import { getCompanyByOwner, updateCompany } from "@/src/services/companyService";
import { sendVerificationCodeEmail } from "@/src/email/brevo";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export type SendVerificationEmailState = {
  success?: boolean;
  email?: string;
  error?: string;
};

export async function sendVerificationEmailAction(
  _prev: SendVerificationEmailState,
  _formData: FormData
): Promise<SendVerificationEmailState> {
  const { userId } = await getCurrentUser();
  const company = await getCompanyByOwner(userId);

  if (!company) {
    return { error: "Unternehmensprofil nicht gefunden." };
  }

  if (!company.email) {
    return { error: "Keine Unternehmens-E-Mail hinterlegt." };
  }

  if (company.verificationStatus === "verified") {
    return { error: "Ihr Unternehmen ist bereits verifiziert." };
  }

  // Generate a cryptographically secure 6-digit code
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const tokenHash = createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await updateCompany(company.id, {
    verificationToken: tokenHash,
    verificationTokenExpiresAt: expiresAt,
    verificationAttempts: 0,
    verificationStatus: "pending",
  });

  await sendVerificationCodeEmail({
    toEmail: company.email,
    companyName: company.name,
    code,
  });

  return { success: true, email: company.email };
}
