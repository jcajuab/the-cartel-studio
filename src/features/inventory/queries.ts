import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, transactionItems, transactions } from "@/lib/db/schema";

export interface InventoryRow {
  id: string;
  sku: string;
  name: string;
  stockQty: number;
  soldTonight: number;
}

export async function getInventoryWithSoldTonight(): Promise<InventoryRow[]> {
  const rows = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      stockQty: products.stockQty,
      soldTonight: sql<number>`coalesce(sum(
        case when ${transactions.status} = 'COMPLETED'
          and ${transactions.createdAt} >= date_trunc('day', now())
        then ${transactionItems.qty}
        else 0
        end
      ), 0)`.mapWith(Number),
    })
    .from(products)
    .leftJoin(transactionItems, eq(transactionItems.productId, products.id))
    .leftJoin(transactions, eq(transactionItems.transactionId, transactions.id))
    .groupBy(products.id, products.sku, products.name, products.stockQty)
    .orderBy(asc(products.name));

  return rows;
}
