import { and, asc, count, eq, ilike, or, sql } from "drizzle-orm";
import { cache } from "react";
import {
  getProductGroup,
  groupForSku,
  type ProductGroupId,
} from "@/features/products/product-groups";
import { db } from "@/lib/db";
import { products, transactionItems, transactions } from "@/lib/db/schema";

export interface InventoryFilters {
  group?: ProductGroupId;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface InventoryRow {
  id: string;
  sku: string;
  name: string;
  price: number;
  stockQty: number;
  soldToday: number;
  groupId: ProductGroupId;
  groupName: string;
  stockValue: number;
}

export interface InventorySummary {
  totalSkus: number;
  unitsOnHand: number;
  lowStockCount: number;
  criticalStockCount: number;
  stockValue: number;
}

function buildInventoryConditions(filters: InventoryFilters = {}) {
  const conditions = [];
  const group = getProductGroup(filters.group);

  if (group.prefix) {
    conditions.push(ilike(products.sku, `${group.prefix}%`));
  }

  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(or(ilike(products.name, term), ilike(products.sku, term)));
  }

  return conditions;
}

function mapInventoryRow(row: {
  id: string;
  sku: string;
  name: string;
  price: number;
  stockQty: number;
  soldToday: number;
}): InventoryRow {
  const group = groupForSku(row.sku);

  return {
    ...row,
    groupId: group.id,
    groupName: group.name,
    stockValue: row.price * row.stockQty,
  };
}

export const getInventoryRows = cache(function getInventoryRows(
  filters: InventoryFilters = {},
): Promise<InventoryRow[]> {
  const conditions = buildInventoryConditions(filters);
  const pageSize = filters.pageSize;
  const page = filters.page ?? 1;
  const offset = pageSize ? (page - 1) * pageSize : 0;

  const query = db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      price: products.price,
      stockQty: products.stockQty,
      soldToday: sql<number>`coalesce(sum(
        case when ${transactions.status} = 'COMPLETED'
          and ${transactions.createdAt} >= date_trunc('day', now())
          and ${transactions.createdAt} < date_trunc('day', now()) + interval '1 day'
        then ${transactionItems.qty}
        else 0
        end
      ), 0)`.mapWith(Number),
    })
    .from(products)
    .leftJoin(transactionItems, eq(transactionItems.productId, products.id))
    .leftJoin(transactions, eq(transactionItems.transactionId, transactions.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(
      products.id,
      products.sku,
      products.name,
      products.price,
      products.stockQty,
    )
    .orderBy(asc(products.name));

  if (!pageSize) return query.then((rows) => rows.map(mapInventoryRow));

  return query
    .limit(pageSize)
    .offset(offset)
    .then((rows) => rows.map(mapInventoryRow));
});

export const getInventoryCount = cache(async function getInventoryCount(
  filters: InventoryFilters = {},
): Promise<number> {
  const conditions = buildInventoryConditions(filters);
  const [row] = await db
    .select({ count: count().mapWith(Number) })
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return row?.count ?? 0;
});

export const getInventorySummary = cache(async function getInventorySummary(
  filters: InventoryFilters = {},
): Promise<InventorySummary> {
  const conditions = buildInventoryConditions(filters);
  const [row] = await db
    .select({
      totalSkus: count().mapWith(Number),
      unitsOnHand: sql<number>`coalesce(sum(${products.stockQty}), 0)`.mapWith(
        Number,
      ),
      lowStockCount:
        sql<number>`count(*) filter (where ${products.stockQty} <= 20)`.mapWith(
          Number,
        ),
      criticalStockCount:
        sql<number>`count(*) filter (where ${products.stockQty} < 5)`.mapWith(
          Number,
        ),
      stockValue:
        sql<number>`coalesce(sum(${products.price} * ${products.stockQty}), 0)`.mapWith(
          Number,
        ),
    })
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    totalSkus: row?.totalSkus ?? 0,
    unitsOnHand: row?.unitsOnHand ?? 0,
    lowStockCount: row?.lowStockCount ?? 0,
    criticalStockCount: row?.criticalStockCount ?? 0,
    stockValue: row?.stockValue ?? 0,
  };
});

export const getInventoryWithSoldTonight = cache(
  async function getInventoryWithSoldTonight(): Promise<InventoryRow[]> {
    return getInventoryRows();
  },
);
