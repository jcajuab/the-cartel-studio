import { eq, inArray, sql } from "drizzle-orm";
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

// Accepts either the top-level db singleton or a transaction handle (tx).
// PgTransaction extends PgDatabase so it shares the same query interface.
type TxClient = PgTransaction<
  PostgresJsQueryResultHKT,
  Record<string, unknown>,
  Record<string, never>
>;
export type Db = typeof DbClient | TxClient;

export interface CheckoutItem {
  productId: string;
  qty: number;
}

export async function executeCheckout(
  db: Db,
  items: CheckoutItem[],
  categoryId: string,
): Promise<{ transactionId: string; total: number }> {
  // 1. Validate: at least one item with qty > 0
  if (!items.length) throw new Error("Cart is empty");
  for (const item of items) {
    if (item.qty < 1)
      throw new Error(`Invalid qty for product ${item.productId}`);
  }

  return (db as typeof DbClient).transaction(async (tx) => {
    // 2. Fetch products and compute total in centavos
    const productIds = items.map((i) => i.productId);
    const rows = await tx
      .select({ id: products.id, price: products.price, name: products.name })
      .from(products)
      .where(inArray(products.id, productIds));

    const priceMap = new Map(rows.map((r) => [r.id, r.price]));
    let total = 0;
    for (const item of items) {
      const price = priceMap.get(item.productId);
      if (!price) throw new Error(`Product not found: ${item.productId}`);
      total += price * item.qty;
    }

    // 3. Fetch the category's coaAssetAccountId
    const [category] = await tx
      .select({ coaAssetAccountId: categories.coaAssetAccountId })
      .from(categories)
      .where(eq(categories.id, categoryId));
    if (!category) throw new Error(`Category not found: ${categoryId}`);

    // 4. Fetch the Sales Revenue account by code "4000"
    // US-005 seed will create this account with code "4000"
    const [revenueAccount] = await tx
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.code, "4000"));
    if (!revenueAccount)
      throw new Error('Sales Revenue account (code "4000") not found');

    // 5. Insert transaction row (status defaults to COMPLETED)
    const [txRow] = await tx
      .insert(transactions)
      .values({ categoryId, total })
      .returning({ id: transactions.id });

    // 6. Insert transaction items with unitPrice snapshot
    await tx.insert(transactionItems).values(
      items.map((item) => ({
        transactionId: txRow.id,
        productId: item.productId,
        qty: item.qty,
        // Price was validated to exist above when computing total
        unitPrice: priceMap.get(item.productId) as number,
      })),
    );

    // 7. Decrement stockQty for each product inside the same transaction
    for (const item of items) {
      await tx
        .update(products)
        .set({ stockQty: sql`${products.stockQty} - ${item.qty}` })
        .where(eq(products.id, item.productId));
    }

    // 8. Insert two journal entries (double-entry)
    //    Row 1: Debit category asset account
    //    Row 2: Credit Sales Revenue account
    await tx.insert(journalEntries).values([
      {
        accountId: category.coaAssetAccountId,
        transactionId: txRow.id,
        debit: total,
        credit: 0,
        isReversal: false,
      },
      {
        accountId: revenueAccount.id,
        transactionId: txRow.id,
        debit: 0,
        credit: total,
        isReversal: false,
      },
    ]);

    // 9. Return result
    return { transactionId: txRow.id, total };
  });
}
