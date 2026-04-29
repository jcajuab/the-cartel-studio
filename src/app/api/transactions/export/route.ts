import type { TransactionFilters } from "@/features/transactions/queries";
import {
  getCurrentMonthKey,
  getTransactions,
} from "@/features/transactions/queries";
import { formatDateTime, formatPhp } from "@/lib/format";

const CSV_COLUMNS = [
  "Date",
  "Reference ID",
  "Payment Category",
  "Items",
  "Status",
  "Amount",
];

function csvEscape(value: string | number) {
  const text = String(value);
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function shortReference(id: string) {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

function itemLabel(count: number) {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

function displayAmount(status: "COMPLETED" | "VOIDED", total: number) {
  if (status === "VOIDED") return `-${formatPhp(total)}`;
  return formatPhp(total);
}

function filtersFromUrl(url: URL): TransactionFilters {
  const status = url.searchParams.get("status");

  return {
    month: url.searchParams.get("month") ?? getCurrentMonthKey(),
    status: status === "COMPLETED" || status === "VOIDED" ? status : undefined,
    categoryId: url.searchParams.get("categoryId") ?? undefined,
    q: url.searchParams.get("q")?.trim() || undefined,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = filtersFromUrl(url);
  const rows = await getTransactions(filters);

  const csvRows = [
    CSV_COLUMNS,
    ...rows.map((row) => [
      row.createdAt ? formatDateTime(row.createdAt) : "",
      shortReference(row.id),
      row.categoryName,
      itemLabel(row.itemCount),
      row.status === "COMPLETED" ? "Completed" : "Voided",
      displayAmount(row.status, row.total),
    ]),
  ];

  const csv = csvRows
    .map((row) => row.map((value) => csvEscape(value)).join(","))
    .join("\n");
  const filename = `transactions-${filters.month ?? getCurrentMonthKey()}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
