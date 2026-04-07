"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/src/auth/getCurrentUser";
import {
  getCompanyByOwner,
  updateCompany,
} from "@/src/services/companyService";
import { writeAuditEvent } from "@/src/services/auditService";

export type UploadLogoState = {
  success?: boolean;
  logoUrl?: string;
  error?: string;
};

export async function uploadLogoAction(
  _prev: UploadLogoState,
  formData: FormData
): Promise<UploadLogoState> {
  const { userId } = await getCurrentUser();

  const company = await getCompanyByOwner(userId);
  if (!company) {
    return { error: "Kein Unternehmensprofil gefunden." };
  }

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Bitte eine Bilddatei auswählen." };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Nur JPEG, PNG, WebP oder SVG erlaubt." };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { error: "Datei darf maximal 2 MB groß sein." };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `logos/${company.id}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });

  await updateCompany(company.id, { logoUrl: blob.url });

  await writeAuditEvent({
    entityType: "company",
    entityId: company.id,
    action: "logo_uploaded",
    actorId: userId,
    metadata: { logoUrl: blob.url },
  });

  revalidatePath("/dashboard/profile");
  return { success: true, logoUrl: blob.url };
}
