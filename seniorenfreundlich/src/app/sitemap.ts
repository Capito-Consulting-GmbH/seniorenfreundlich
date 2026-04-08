import type { MetadataRoute } from "next";
import { env } from "@/src/env";
import { listCertifiedCompanies } from "@/src/services/companyService";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_APP_URL;

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, priority: 1.0, changeFrequency: "weekly" },
    { url: `${base}/companies`, priority: 0.9, changeFrequency: "daily" },
    { url: `${base}/imprint`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${base}/privacy`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${base}/terms`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${base}/cancellation`, priority: 0.3, changeFrequency: "yearly" },
  ];

  // Dynamic company + certificate pages — only certified (active badge) companies
  let companyRoutes: MetadataRoute.Sitemap = [];
  try {
    const { rows } = await listCertifiedCompanies({ page: 1 });
    // Fetch all — paginator defaults to 12, iterate if needed
    // For MVP a single fetch is sufficient; extend with pagination if directory grows
    companyRoutes = rows.flatMap((company) => [
      {
        url: `${base}/companies/${company.slug}`,
        priority: 0.8,
        changeFrequency: "weekly" as const,
        lastModified: company.updatedAt,
      },
      {
        url: `${base}/certificate/${company.slug}`,
        priority: 0.7,
        changeFrequency: "weekly" as const,
        lastModified: company.updatedAt,
      },
    ]);
  } catch {
    // DB unavailable at build time — return static routes only
  }

  return [...staticRoutes, ...companyRoutes];
}
