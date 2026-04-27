import { sql } from "drizzle-orm";
import { executeCheckout } from "@/features/sales/checkout";
import { executeVoid } from "@/features/void/void";
import { db } from "@/lib/db";
import {
  accounts,
  categories,
  journalEntries,
  products,
  transactionItems,
  transactions,
} from "@/lib/db/schema";
import {
  SEED_ACCOUNTS,
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  VOID_REASONS,
} from "./seed-data";

// ---- Minimal PRNG helpers (no external library) ----

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// weights may sum to any positive constant — normalised internally
function pickWeighted<T>(arr: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

function mergeDuplicates(
  items: { productId: string; qty: number }[],
): { productId: string; qty: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(item.productId, (map.get(item.productId) ?? 0) + item.qty);
  }
  return Array.from(map.entries()).map(([productId, qty]) => ({
    productId,
    qty,
  }));
}

// ---- Main ----

async function main() {
  // 1. Delete all rows in dependency order (children first)
  await db.delete(journalEntries);
  await db.delete(transactionItems);
  await db.delete(transactions);
  await db.delete(products);
  await db.delete(categories);
  await db.delete(accounts);

  // 2. Insert accounts; capture id-by-code map
  const accountRows = await db
    .insert(accounts)
    .values(
      SEED_ACCOUNTS.map((a) => ({ code: a.code, name: a.name, type: a.type })),
    )
    .returning();
  const accountIdByCode = new Map(accountRows.map((r) => [r.code, r.id]));

  // 3. Insert categories with FK to their asset accounts
  const categoryRows = await db
    .insert(categories)
    .values(
      SEED_CATEGORIES.map((c) => {
        const coaAssetAccountId = accountIdByCode.get(c.assetAccountCode);
        if (!coaAssetAccountId) {
          throw new Error(`Account not found for code: ${c.assetAccountCode}`);
        }
        return { name: c.name, coaAssetAccountId };
      }),
    )
    .returning();
  const categoryIds = categoryRows.map((r) => r.id);

  // 4. Insert products
  const productRows = await db
    .insert(products)
    .values(
      SEED_PRODUCTS.map((p) => ({
        sku: p.sku,
        name: p.name,
        price: p.price,
        stockQty: p.stockQty,
      })),
    )
    .returning();
  const productIds = productRows.map((r) => r.id);

  // 5. Generate 75 transactions via executeCheckout
  // Category weights: Cash 50, GCash 20, PayMaya 5, Credit Card 20, Bank Transfer 5
  // categoryIds order mirrors SEED_CATEGORIES: [Cash, GCash, PayMaya, Credit Card, Bank Transfer]
  const CATEGORY_WEIGHTS = [50, 20, 5, 20, 5];
  const N_TX = 75;
  const txIds: string[] = [];

  for (let i = 0; i < N_TX; i++) {
    const itemCount = randInt(1, 5);
    const rawItems = Array.from({ length: itemCount }, () => ({
      productId: pick(productIds),
      qty: randInt(1, 3),
    }));
    const merged = mergeDuplicates(rawItems);
    const categoryId = pickWeighted(categoryIds, CATEGORY_WEIGHTS);
    const { transactionId } = await executeCheckout(db, merged, categoryId);
    txIds.push(transactionId);
  }

  // 6. Void 2 transactions (spread across the set for realism)
  const toVoid = [txIds[Math.floor(N_TX * 0.3)], txIds[Math.floor(N_TX * 0.7)]];
  for (const tid of toVoid) {
    await executeVoid(db, tid, pick(VOID_REASONS), "Manager");
  }

  // 7. Balance assertion — diff must be exactly 0
  const result = await db.execute(
    sql`SELECT COALESCE(SUM(debit), 0) - COALESCE(SUM(credit), 0) AS diff FROM journal_entries`,
  );
  const diff = Number(
    (result as unknown as { diff: string | number }[])[0].diff,
  );
  if (diff !== 0) {
    throw new Error(`Ledger out of balance after seed: diff = ${diff}`);
  }

  // 8. Summary
  console.log("✓ Seed complete");
  console.log(`  accounts:     ${accountRows.length}`);
  console.log(`  categories:   ${categoryRows.length}`);
  console.log(`  products:     ${productRows.length}`);
  console.log(`  transactions: ${N_TX}`);
  console.log(`  voided:       ${toVoid.length}`);
  console.log("  ledger diff:  0");
  console.log("✓ Ledger balanced (diff = 0)");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
