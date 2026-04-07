"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/src/auth/getCurrentUser";
import {
  getCompanyByOwner,
  updateCompany,
} from "@/src/services/companyService";
import { writeAuditEvent } from "@/src/services/auditService";
import { updateCompanySchema } from "@/src/validators/company";

export type UpdateCompanyProfileState = {
  success?: boolean;
  logoUrl?: string;
  errors?: {
    name?: string[];
    description?: string[];
    website?: string[];
    phone?: string[];
    email?: string[];
    address?: string[];
    city?: string[];
    postalCode?: string[];
    _form?: string[];
  };
};

export async function updateCompanyProfileAction(
  _prev: UpdateCompanyProfileState,
  formData: FormData
): Promise<UpdateCompanyProfileState> {
  const { userId } = await getCurrentUser();

  let company;
  try {
    company = await getCompanyByOwner(userId);
  } catch {
    return {
      errors: {
        _form: ["Datenbank aktuell nicht erreichbar. Bitte in 10-20 Sekunden erneut versuchen."],
      },
    };
  }

  if (!company) {
    return { errors: { _form: ["Kein Unternehmensprofil gefunden."] } };
  }

  const raw = {
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    website: formData.get("website") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    postalCode: formData.get("postalCode") || undefined,
  };

  if (typeof raw.website === "string" && raw.website.trim().length > 0) {
    const website = raw.website.trim();
    raw.website = /^https?:\/\//i.test(website) ? website : `https://${website}`;
  }

  const parsed = updateCompanySchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // Optional logo — handled in the same form submission
  let logoUrl: string | undefined;
  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(logoFile.type)) {
      return { errors: { _form: ["Nur JPEG, PNG, WebP oder SVG erlaubt."] } };
    }
    if (logoFile.size > 2 * 1024 * 1024) {
      return { errors: { _form: ["Datei darf maximal 2 MB groß sein."] } };
    }
    const ext = logoFile.name.split(".").pop() ?? "jpg";
    const blob = await put(`logos/${company.id}.${ext}`, logoFile, {
      access: "public",
      contentType: logoFile.type,
    });
    logoUrl = blob.url;
  }

  try {
    await updateCompany(company.id, {
      ...parsed.data,
      ...(logoUrl ? { logoUrl } : {}),
    });
  } catch {
    return {
      errors: {
        _form: ["Speichern fehlgeschlagen, da die Datenbank nicht erreichbar war. Bitte erneut versuchen."],
      },
    };
  }

  try {
    await writeAuditEvent({
      entityType: "company",
      entityId: company.id,
      action: "profile_updated",
      actorId: userId,
      metadata: logoUrl ? { logoUploaded: true } : undefined,
    });
  } catch {
    // Audit failure must not break the main flow
  }

  revalidatePath("/dashboard/profile");
  return { success: true, ...(logoUrl ? { logoUrl } : {}) };
}
