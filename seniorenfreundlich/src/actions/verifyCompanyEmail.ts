"use server";

import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/auth/getCurrentUser";
import { getCompanyByOwner, updateCompany } from "@/src/services/companyService";
import { writeAuditEvent } from "@/src/services/auditService";

const MAX_ATTEMPTS = 5;

export type VerifyCompanyEmailState = {
  error?: string;
  attemptsLeft?: number;
};

export async function verifyCompanyEmailAction(
  _prev: VerifyCompanyEmailState,
  formData: FormData
): Promise<VerifyCompanyEmailState> {
  const { userId } = await getCurrentUser();
  const company = await getCompanyByOwner(userId);

  if (!company) {
    return { error: "Unternehmensprofil nicht gefunden." };
  }

  if (company.verificationStatus === "verified") {
    redirect("/dashboard");
  }

  if (!company.verificationToken) {
    return {
      error:
        "Kein aktiver Verifizierungscode gefunden. Bitte senden Sie einen neuen Code.",
    };
  }

  // Check token expiry
  if (
    !company.verificationTokenExpiresAt ||
    company.verificationTokenExpiresAt < new Date()
  ) {
    await updateCompany(company.id, {
      verificationToken: null,
      verificationTokenExpiresAt: null,
      verificationAttempts: 0,
      verificationStatus: "unverified",
    });
    return {
      error: "Der Code ist abgelaufen. Bitte senden Sie einen neuen Code.",
    };
  }

  const attempts = company.verificationAttempts ?? 0;

  // Guard: too many attempts (shouldn't normally reach here due to prior clears)
  if (attempts >= MAX_ATTEMPTS) {
    await updateCompany(company.id, {
      verificationToken: null,
      verificationTokenExpiresAt: null,
      verificationAttempts: 0,
      verificationStatus: "unverified",
    });
    return {
      error: "Zu viele Fehlversuche. Bitte senden Sie einen neuen Code.",
    };
  }

  const inputCode = (formData.get("code") as string | null)?.trim() ?? "";
  const inputHash = createHash("sha256").update(inputCode).digest("hex");

  if (inputHash !== company.verificationToken) {
    const newAttempts = attempts + 1;

    if (newAttempts >= MAX_ATTEMPTS) {
      // Lock out: clear token
      await updateCompany(company.id, {
        verificationToken: null,
        verificationTokenExpiresAt: null,
        verificationAttempts: 0,
        verificationStatus: "unverified",
      });
      return {
        error: "Zu viele Fehlversuche. Bitte senden Sie einen neuen Code.",
      };
    }

    await updateCompany(company.id, { verificationAttempts: newAttempts });
    const attemptsLeft = MAX_ATTEMPTS - newAttempts;
    return {
      error: `Falscher Code. Noch ${attemptsLeft} ${attemptsLeft === 1 ? "Versuch" : "Versuche"}.`,
      attemptsLeft,
    };
  }

  // Code correct — mark as verified
  await updateCompany(company.id, {
    verificationStatus: "verified",
    verifiedAt: new Date(),
    verificationToken: null,
    verificationTokenExpiresAt: null,
    verificationAttempts: 0,
  });

  await writeAuditEvent({
    entityType: "company",
    entityId: company.id,
    action: "email_verified",
    actorId: userId,
  });

  redirect("/dashboard");
}
