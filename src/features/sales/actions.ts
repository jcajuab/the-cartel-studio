"use server";

import { refresh } from "next/cache";
import { db } from "@/lib/db";
import { type CheckoutItem, executeCheckout } from "./checkout";

export async function completeCheckout(
  items: CheckoutItem[],
  categoryId: string,
): Promise<{ transactionId: string; total: number }> {
  const result = await executeCheckout(db, items, categoryId);
  refresh();
  return result;
}
