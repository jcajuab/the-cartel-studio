import {
  getInventoryRows,
  type InventoryFilters,
} from "@/features/inventory/queries";
import {
  getProductGroup,
  type ProductGroupId,
} from "@/features/products/product-groups";
import { formatPhp } from "@/lib/format";

const CSV_COLUMNS = [
  "Product",
  "SKU",
  "Category",
  "Price",
  "Current Stock",
  "Sold Today",
  "Stock Value",
];

function csvEscape(value: string | number) {
  const text = String(value);
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function filtersFromUrl(url: URL): InventoryFilters {
  const group = getProductGroup(url.searchParams.get("group"));

  return {
    group: group.id as ProductGroupId,
    q: url.searchParams.get("q")?.trim() || undefined,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = filtersFromUrl(url);
  const rows = await getInventoryRows(filters);
  const group = getProductGroup(filters.group);

  const csvRows = [
    CSV_COLUMNS,
    ...rows.map((row) => [
      row.name,
      row.sku,
      row.groupName,
      formatPhp(row.price),
      row.stockQty,
      row.soldToday,
      formatPhp(row.stockValue),
    ]),
  ];

  const csv = csvRows
    .map((row) => row.map((value) => csvEscape(value)).join(","))
    .join("\n");
  const filename = `inventory-${group.id}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
