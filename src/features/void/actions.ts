"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { executeVoid } from "./void";

export async function voidTransaction(
  transactionId: string,
  reason: string,
  role: string,
): Promise<{ error?: string }> {
  try {
    await executeVoid(db, transactionId, reason, role);
    refresh();
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Void failed" };
  }
}
