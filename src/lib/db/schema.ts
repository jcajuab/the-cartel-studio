import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---- Enums ----

export const accountTypeEnum = pgEnum("account_type", [
  "Asset",
  "Liability",
  "Equity",
  "Revenue",
  "Expense",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "COMPLETED",
  "VOIDED",
]);

// ---- Tables ----

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").unique().notNull(),
  name: text("name").unique().notNull(),
  type: accountTypeEnum("type").notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  coaAssetAccountId: uuid("coa_asset_account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "restrict" }),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  sku: text("sku").unique().notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  stockQty: integer("stock_qty").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: transactionStatusEnum("status").notNull().default("COMPLETED"),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  total: integer("total").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  voidedAt: timestamp("voided_at"),
  voidReason: text("void_reason"),
  voidedByRole: text("voided_by_role"),
});

export const transactionItems = pgTable("transaction_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "restrict" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  qty: integer("qty").notNull(),
  unitPrice: integer("unit_price").notNull(),
});

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "restrict" }),
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "restrict" }),
    debit: integer("debit").notNull().default(0),
    credit: integer("credit").notNull().default(0),
    postedAt: timestamp("posted_at").defaultNow(),
    isReversal: boolean("is_reversal").notNull().default(false),
  },
  (table) => [
    check(
      "journal_entry_single_sided",
      sql`${table.debit} >= 0 AND ${table.credit} >= 0 AND (${table.debit} = 0 OR ${table.credit} = 0)`,
    ),
  ],
);
