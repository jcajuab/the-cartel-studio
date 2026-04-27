import { NextResponse } from "next/server";
import { getBalanceCheck } from "@/features/accounting/queries";

export async function GET() {
  const result = await getBalanceCheck();
  return NextResponse.json(result, { status: result.balanced ? 200 : 500 });
}
