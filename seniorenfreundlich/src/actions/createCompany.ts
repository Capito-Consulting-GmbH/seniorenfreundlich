"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/auth/getCurrentUser";
import {
  createCompany,
  getCompanyByOwner,
  getCompanyBySlug,
} from "@/src/services/companyService";
import { writeAuditEvent } from "@/src/services/auditService";
import { createCompanySchema } from "@/src/validators/company";

export type CreateCompanyState = {
  errors?: { name?: string[]; slug?: string[]; _form?: string[] };
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
  };

  const parsed = createCompanySchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, slug } = parsed.data;

  // Slug uniqueness check
  const slugTaken = await getCompanyBySlug(slug);
  if (slugTaken) {
    return { errors: { slug: ["Dieser Slug ist bereits vergeben."] } };
  }

  const company = await createCompany({
    name,
    slug,
    ownerClerkUserId: userId,
    country: "DE",
  });

  await writeAuditEvent({
    entityType: "company",
    entityId: company.id,
    action: "created",
    actorId: userId,
  });

  redirect("/dashboard/profile");
}
