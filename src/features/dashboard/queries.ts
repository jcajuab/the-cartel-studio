import { asc, desc, eq, lte, sql } from "drizzle-orm";
import { cache } from "react";
import { getBalanceCheck } from "@/features/accounting/queries";
import { db } from "@/lib/db";
import {
  accounts,
  categories,
  journalEntries,
  products,
  transactionItems,
  transactions,
} from "@/lib/db/schema";

const TODAY_SQL = sql`date_trunc('day', now())`;

export interface DashboardSummary {
  netRevenueToday: number;
  completedSalesToday: number;
  averageTicketToday: number;
  voidedSalesToday: number;
  voidedAmountToday: number;
  lowStockCount: number;
  criticalStockCount: number;
  ledgerBalanced: boolean;
  ledgerDiff: number;
}

export interface SalesTrendPoint {
  date: string;
  label: string;
  total: number;
}

export interface CategoryPerformanceMetric {
  categoryId: string;
  categoryName: string;
  accountId: string;
  accountCode: string;
  totalToday: number;
  transactionCountToday: number;
}

export interface InventoryRiskProduct {
  id: string;
  sku: string;
  name: string;
  stockQty: number;
  soldToday: number;
}

export interface RecentDashboardTransaction {
  id: string;
  status: "COMPLETED" | "VOIDED";
  total: number;
  createdAt: Date | null;
  categoryName: string;
}

export const getDashboardSummary = cache(
  async function getDashboardSummary(): Promise<DashboardSummary> {
    const [revenueRow, completedRow, voidedRow, stockRow, balanceCheck] =
      await Promise.all([
        db
          .select({
            revenue:
              sql<number>`coalesce(sum(${journalEntries.credit}), 0) - coalesce(sum(${journalEntries.debit}), 0)`.mapWith(
                Number,
              ),
          })
          .from(journalEntries)
          .innerJoin(accounts, eq(journalEntries.accountId, accounts.id))
          .where(
            sql`${accounts.code} = '4000' and ${journalEntries.postedAt} >= ${TODAY_SQL}`,
          ),
        db
          .select({
            count: sql<number>`count(*)`.mapWith(Number),
            total: sql<number>`coalesce(sum(${transactions.total}), 0)`.mapWith(
              Number,
            ),
          })
          .from(transactions)
          .where(
            sql`${transactions.status} = 'COMPLETED' and ${transactions.createdAt} >= ${TODAY_SQL}`,
          ),
        db
          .select({
            count: sql<number>`count(*)`.mapWith(Number),
            total: sql<number>`coalesce(sum(${transactions.total}), 0)`.mapWith(
              Number,
            ),
          })
          .from(transactions)
          .where(
            sql`${transactions.status} = 'VOIDED' and ${transactions.voidedAt} >= ${TODAY_SQL}`,
          ),
        db
          .select({
            low: sql<number>`count(*) filter (where ${products.stockQty} <= 20)`.mapWith(
              Number,
            ),
            critical:
              sql<number>`count(*) filter (where ${products.stockQty} < 5)`.mapWith(
                Number,
              ),
          })
          .from(products),
        getBalanceCheck(),
      ]);

    const completed = completedRow[0];
    const voided = voidedRow[0];
    const stock = stockRow[0];
    const completedCount = completed?.count ?? 0;
    const completedTotal = completed?.total ?? 0;

    return {
      netRevenueToday: revenueRow[0]?.revenue ?? 0,
      completedSalesToday: completedCount,
      averageTicketToday:
        completedCount > 0 ? Math.round(completedTotal / completedCount) : 0,
      voidedSalesToday: voided?.count ?? 0,
      voidedAmountToday: voided?.total ?? 0,
      lowStockCount: stock?.low ?? 0,
      criticalStockCount: stock?.critical ?? 0,
      ledgerBalanced: balanceCheck.balanced,
      ledgerDiff: balanceCheck.diff,
    };
  },
);

export const getSalesTrend = cache(async function getSalesTrend(): Promise<
  SalesTrendPoint[]
> {
  const rows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${journalEntries.postedAt}), 'YYYY-MM-DD')`,
      total:
        sql<number>`coalesce(sum(${journalEntries.credit}), 0) - coalesce(sum(${journalEntries.debit}), 0)`.mapWith(
          Number,
        ),
    })
    .from(journalEntries)
    .innerJoin(accounts, eq(journalEntries.accountId, accounts.id))
    .where(
      sql`${accounts.code} = '4000' and ${journalEntries.postedAt} >= ${TODAY_SQL} - interval '6 days'`,
    )
    .groupBy(sql`date_trunc('day', ${journalEntries.postedAt})`)
    .orderBy(sql`date_trunc('day', ${journalEntries.postedAt})`);

  const totalsByDate = new Map(rows.map((row) => [row.date, row.total]));
  const formatter = new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
  });

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);

    return {
      date: key,
      label: formatter.format(date),
      total: totalsByDate.get(key) ?? 0,
    };
  });
});

export const getCategoryPerformance = cache(
  async function getCategoryPerformance(): Promise<
    CategoryPerformanceMetric[]
  > {
    return db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        accountId: accounts.id,
        accountCode: accounts.code,
        totalToday:
          sql<number>`coalesce(sum(case when ${journalEntries.postedAt} >= ${TODAY_SQL} then ${journalEntries.debit} - ${journalEntries.credit} else 0 end), 0)`.mapWith(
            Number,
          ),
        transactionCountToday:
          sql<number>`count(distinct case when ${transactions.status} = 'COMPLETED' and ${transactions.createdAt} >= ${TODAY_SQL} then ${transactions.id} end)`.mapWith(
            Number,
          ),
      })
      .from(categories)
      .innerJoin(accounts, eq(categories.coaAssetAccountId, accounts.id))
      .leftJoin(journalEntries, eq(journalEntries.accountId, accounts.id))
      .leftJoin(transactions, eq(journalEntries.transactionId, transactions.id))
      .groupBy(categories.id, categories.name, accounts.id, accounts.code)
      .orderBy(
        sql`coalesce(sum(case when ${journalEntries.postedAt} >= ${TODAY_SQL} then ${journalEntries.debit} - ${journalEntries.credit} else 0 end), 0) desc`,
      );
  },
);

export const getInventoryRiskProducts = cache(
  async function getInventoryRiskProducts(): Promise<InventoryRiskProduct[]> {
    return db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        stockQty: products.stockQty,
        soldToday: sql<number>`coalesce(sum(
        case when ${transactions.status} = 'COMPLETED'
          and ${transactions.createdAt} >= ${TODAY_SQL}
        then ${transactionItems.qty}
        else 0
        end
      ), 0)`.mapWith(Number),
      })
      .from(products)
      .leftJoin(transactionItems, eq(transactionItems.productId, products.id))
      .leftJoin(
        transactions,
        eq(transactionItems.transactionId, transactions.id),
      )
      .where(lte(products.stockQty, 20))
      .groupBy(products.id, products.sku, products.name, products.stockQty)
      .orderBy(asc(products.stockQty), asc(products.name))
      .limit(3);
  },
);

export const getRecentDashboardTransactions = cache(
  async function getRecentDashboardTransactions(): Promise<
    RecentDashboardTransaction[]
  > {
    return db
      .select({
        id: transactions.id,
        status: transactions.status,
        total: transactions.total,
        createdAt: transactions.createdAt,
        categoryName: categories.name,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .orderBy(desc(transactions.createdAt))
      .limit(10);
  },
);
