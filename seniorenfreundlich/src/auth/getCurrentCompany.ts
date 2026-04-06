import { getCompanyByOwner, type Company } from "@/src/services/companyService";
import { getCurrentUser } from "./getCurrentUser";

export async function getCurrentCompany(): Promise<Company | null> {
  const { userId } = await getCurrentUser();
  return getCompanyByOwner(userId);
}
