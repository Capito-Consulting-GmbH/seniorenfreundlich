import { NextResponse } from "next/server";
import { getCurrentCompany } from "@/src/auth/getCurrentCompany";
import { getLatestOrderByCompany } from "@/src/services/orderService";

export async function GET() {
  let company = null;
  try {
    company = await getCurrentCompany();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!company) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const order = await getLatestOrderByCompany(company.id);

  return NextResponse.json({ status: order?.status ?? null });
}
