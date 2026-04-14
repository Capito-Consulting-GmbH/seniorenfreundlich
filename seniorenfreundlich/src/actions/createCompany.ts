"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/auth/getCurrentUser";
import {
  createCompany,
  getCompanyByOwner,
  getCompanyBySlug,
} from "@/src/services/companyService";
import { writeAuditEvent } from "@/src/services/auditService";
import { onboardCompanySchema } from "@/src/validators/company";

export type CreateCompanyState = {
  errors?: {
    name?: string[];
    slug?: string[];
    hrbNumber?: string[];
    email?: string[];
    phone?: string[];
    website?: string[];
    address?: string[];
    city?: string[];
    postalCode?: string[];
    description?: string[];
    _form?: string[];
  };
};

export async function createCompanyAction(
  _prev: CreateCompanyState,
  formData: FormData
): Promise<CreateCompanyState> {
  const { userId } = await getCurrentUser();

  // One company per user
  const existing = await getCompanyByOwner(userId);
  if (existing) {
    return { errors: { _form: ["Du hast bereits ein Unternehmensprofil."] } };
  }

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    hrbNumber: formData.get("hrbNumber") || undefined,
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    website: formData.get("website") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    postalCode: formData.get("postalCode") || undefined,
    description: formData.get("description") || undefined,
  };

  const parsed = onboardCompanySchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, slug, hrbNumber, email, phone, website, address, city, postalCode, description } =
    parsed.data;

  // Slug uniqueness check
  const slugTaken = await getCompanyBySlug(slug);
  if (slugTaken) {
    return { errors: { slug: ["Dieser Slug ist bereits vergeben."] } };
  }

  // Normalize website URL
  let normalizedWebsite = website || null;
  if (normalizedWebsite && !/^https?:\/\//i.test(normalizedWebsite)) {
    normalizedWebsite = `https://${normalizedWebsite}`;
  }

  const company = await createCompany({
    name,
    slug,
    ownerUserId: userId,
    hrbNumber: hrbNumber || null,
    email,
    phone: phone || null,
    website: normalizedWebsite,
    address: address || null,
    city: city || null,
    postalCode: postalCode || null,
    description: description || null,
    country: "DE",
    verificationStatus: "unverified",
  });

  await writeAuditEvent({
    entityType: "company",
    entityId: company.id,
    action: "created",
    actorId: userId,
  });

  redirect("/dashboard/onboarding");
}
