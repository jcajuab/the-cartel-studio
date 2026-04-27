import { and, eq, sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import type { db as DbClient } from "@/lib/db";
import {
  accounts,
  categories,
  journalEntries,
  products,
  transactionItems,
  transactions,
} from "@/lib/db/schema";

// Mirrors the Db type from checkout.ts — accepts the top-level db singleton
// or a transaction handle (tx) since PgTransaction shares the same query interface.
type TxClient = PgTransaction<
  PostgresJsQueryResultHKT,
  Record<string, unknown>,
  Record<string, never>
>;
export type Db = typeof DbClient | TxClient;

export async function executeVoid(
  db: Db,
  transactionId: string,
  reason: string,
  role: string,
): Promise<void> {
  // Validate role before touching the DB
  if (role !== "Manager") {
    throw new Error("Only a Manager may void a transaction");
  }

  // Validate reason is non-empty
  if (!reason.trim()) {
    throw new Error("Void reason must not be empty");
  }

  return (db as typeof DbClient).transaction(async (tx) => {
    // 1. Fetch the transaction — validate it exists and is COMPLETED
    const [txRow] = await tx
      .select({
        id: transactions.id,
        status: transactions.status,
        total: transactions.total,
        categoryId: transactions.categoryId,
      })
      .from(transactions)
      .where(eq(transactions.id, transactionId));

    if (!txRow) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }
    if (txRow.status !== "COMPLETED") {
      throw new Error(
        `Transaction ${transactionId} cannot be voided — current status: ${txRow.status}`,
      );
    }

    // 2. Fetch the category's coaAssetAccountId
    const [category] = await tx
      .select({ coaAssetAccountId: categories.coaAssetAccountId })
      .from(categories)
      .where(eq(categories.id, txRow.categoryId));
    if (!category) {
      throw new Error(`Category not found: ${txRow.categoryId}`);
    }

    // 3. Fetch the Sales Revenue account by code "4000"
    const [revenueAccount] = await tx
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.code, "4000"));
    if (!revenueAccount) {
      throw new Error('Sales Revenue account (code "4000") not found');
    }

    // 4. Update transaction to VOIDED with metadata
    await tx
      .update(transactions)
      .set({
        status: "VOIDED",
        voidedAt: new Date(),
        voidReason: reason,
        voidedByRole: role,
      })
      .where(and(eq(transactions.id, transactionId)));

    // 5. Fetch all items to restore inventory
    const items = await tx
      .select({
        productId: transactionItems.productId,
        qty: transactionItems.qty,
      })
      .from(transactionItems)
      .where(eq(transactionItems.transactionId, transactionId));

    // 6. Restore stockQty for each product (increment by item qty)
    for (const item of items) {
      await tx
        .update(products)
        .set({ stockQty: sql`${products.stockQty} + ${item.qty}` })
        .where(eq(products.id, item.productId));
    }

    // 7. Insert two reversing journal entries
    //    Row 1: Debit Sales Revenue (reverses the original Credit to Revenue)
    //    Row 2: Credit category asset account (reverses the original Debit to Asset)
    await tx.insert(journalEntries).values([
      {
        accountId: revenueAccount.id,
        transactionId,
        debit: txRow.total,
        credit: 0,
        isReversal: true,
      },
      {
        accountId: category.coaAssetAccountId,
        transactionId,
        debit: 0,
        credit: txRow.total,
        isReversal: true,
      },
    ]);
  });
}
