import { z } from "zod";

export const slugSchema = z
  .string()
  .min(2, "Mindestens 2 Zeichen")
  .max(60, "Maximal 60 Zeichen")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt (z.B. mein-unternehmen)"
  );

const nameSchema = z
  .string()
  .min(2, "Mindestens 2 Zeichen")
  .max(120, "Maximal 120 Zeichen")
  .regex(/[a-zA-ZäöüÄÖÜß]/, "Der Name muss mindestens einen Buchstaben enthalten");

export const createCompanySchema = z.object({
  name: nameSchema,
  slug: slugSchema,
});

export const onboardCompanySchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  hrbNumber: z.string().max(50, "Maximal 50 Zeichen").optional().or(z.literal("")),
  email: z.string().email("Bitte eine gültige E-Mail-Adresse eingeben"),
  phone: z.string().max(30).optional().or(z.literal("")),
  website: z
    .string()
    .url("Bitte eine gültige URL eingeben (z.B. https://example.de)")
    .optional()
    .or(z.literal("")),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Bitte eine gültige Postleitzahl eingeben")
    .optional()
    .or(z.literal("")),
  description: z.string().max(1000, "Maximal 1000 Zeichen").optional(),
});

export const updateCompanySchema = z.object({
  name: nameSchema,
  description: z.string().max(1000, "Maximal 1000 Zeichen").optional(),
  website: z
    .string()
    .url("Bitte eine gültige URL eingeben (z.B. https://example.de)")
    .optional()
    .or(z.literal("")),
  phone: z.string().max(30).optional(),
  email: z
    .string()
    .email("Bitte eine gültige E-Mail-Adresse eingeben")
    .optional()
    .or(z.literal("")),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Bitte eine gültige Postleitzahl eingeben")
    .optional()
    .or(z.literal("")),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type OnboardCompanyInput = z.infer<typeof onboardCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
