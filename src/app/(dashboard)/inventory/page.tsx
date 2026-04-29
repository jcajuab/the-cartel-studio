import Link from "next/link";
import { Suspense } from "react";
import { TablePageLoading } from "@/components/shell/page-loading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InventoryHeaderActions } from "@/features/inventory/components/inventory-header-actions";
import { InventoryTableScrollFade } from "@/features/inventory/components/inventory-table-scroll-fade";
import { InventoryToolbar } from "@/features/inventory/components/inventory-toolbar";
import { StockBadge } from "@/features/inventory/components/stock-badge";
import {
  getInventoryCount,
  getInventoryRows,
  getInventorySummary,
  type InventoryFilters,
} from "@/features/inventory/queries";
import {
  getProductGroup,
  PRODUCT_GROUPS,
  type ProductGroupId,
} from "@/features/products/product-groups";
import { formatPhp } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PAGE_SIZE = 25;

function getStringParam(
  params: { [key: string]: string | string[] | undefined },
  key: string,
): string | undefined {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function buildFilters(params: {
  [key: string]: string | string[] | undefined;
}): InventoryFilters {
  const pageParam = Number(getStringParam(params, "page") ?? "1");
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const group = getProductGroup(getStringParam(params, "group"));

  return {
    group: group.id as ProductGroupId,
    q: getStringParam(params, "q"),
    page,
    pageSize: PAGE_SIZE,
  };
}

function buildHref(
  params: { [key: string]: string | string[] | undefined },
  key: string,
  value?: string,
) {
  const next = new URLSearchParams();

  for (const [paramKey, paramValue] of Object.entries(params)) {
    if (typeof paramValue === "string" && paramValue) {
      next.set(paramKey, paramValue);
    }
  }

  if (value) {
    next.set(key, value);
  } else {
    next.delete(key);
  }
  if (key !== "page") {
    next.delete("page");
  }

  const query = next.toString();
  return query ? `/inventory?${query}` : "/inventory";
}

function numberLabel(value: number) {
  return value.toLocaleString("en-PH");
}

export default async function InventoryPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = buildFilters(sp);

  return (
    <>
      <InventoryHeaderActions />
      <Suspense
        fallback={<TablePageLoading columns={7} rows={8} showToolbar />}
      >
        <InventoryContent filters={filters} searchParams={sp} />
      </Suspense>
    </>
  );
}

async function InventoryContent({
  filters,
  searchParams,
}: {
  filters: InventoryFilters;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [inventoryRows, summary, totalRows] = await Promise.all([
    getInventoryRows(filters),
    getInventorySummary(filters),
    getInventoryCount(filters),
  ]);

  const activeGroup = filters.group ?? "all";
  const currentPage = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(currentPage * PAGE_SIZE, totalRows);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:p-6">
      <section className="grid shrink-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <InventoryMetricCard
          label="Total SKUs"
          value={numberLabel(summary.totalSkus)}
          detail="Products in the current view"
        />
        <InventoryMetricCard
          label="Units On Hand"
          value={numberLabel(summary.unitsOnHand)}
          detail="Current sellable stock count"
        />
        <InventoryMetricCard
          label="Low Stock"
          value={numberLabel(summary.lowStockCount)}
          detail={`${numberLabel(summary.criticalStockCount)} critical below 5 units`}
          tone={summary.criticalStockCount > 0 ? "danger" : "default"}
        />
        <InventoryMetricCard
          label="Stock Value"
          value={formatPhp(summary.stockValue)}
          detail="Menu-price value of current stock"
        />
      </section>

      <Card className="min-h-0 flex-1 gap-0 rounded-2xl bg-card/80 py-0">
        <div className="flex shrink-0 overflow-x-auto border-b border-border/60 px-4">
          {PRODUCT_GROUPS.map((group) => {
            const isActive = activeGroup === group.id;
            return (
              <Link
                href={buildHref(
                  searchParams,
                  "group",
                  group.id === "all" ? undefined : group.id,
                )}
                key={group.id}
                className={cn(
                  "relative mr-7 flex h-11 shrink-0 items-center text-sm transition last:mr-0",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {group.name}
                {isActive ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                ) : null}
              </Link>
            );
          })}
        </div>

        <InventoryToolbar />

        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          {inventoryRows.length === 0 ? (
            <p className="flex min-h-0 flex-1 items-center justify-center py-10 text-center text-sm text-muted-foreground">
              No products match the current filters.
            </p>
          ) : (
            <InventoryTableScrollFade className="flex-1">
              <Table className="table-fixed">
                <colgroup>
                  <col className="w-[24%]" />
                  <col className="w-[13%]" />
                  <col className="w-[13%]" />
                  <col className="w-[12%]" />
                  <col className="w-[13%]" />
                  <col className="w-[12%]" />
                  <col className="w-[13%]" />
                </colgroup>
                <TableHeader className="sticky top-0 z-10 bg-card [&_tr]:border-b">
                  <TableRow>
                    <TableHead className="h-11 px-4">Product</TableHead>
                    <TableHead className="h-11 px-4">SKU</TableHead>
                    <TableHead className="h-11 px-4">Category</TableHead>
                    <TableHead className="h-11 px-4 text-right">
                      Price
                    </TableHead>
                    <TableHead className="h-11 px-4 text-right">
                      Current Stock
                    </TableHead>
                    <TableHead className="h-11 px-4 text-right">
                      Sold Today
                    </TableHead>
                    <TableHead className="h-11 px-4 text-right">
                      Stock Value
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryRows.map((row) => (
                    <TableRow key={row.id} className="h-10">
                      <TableCell className="px-4 font-medium">
                        {row.name}
                      </TableCell>
                      <TableCell className="px-4 font-mono text-xs text-muted-foreground">
                        {row.sku}
                      </TableCell>
                      <TableCell className="px-4">
                        <Badge variant="outline">{row.groupName}</Badge>
                      </TableCell>
                      <TableCell className="px-4 text-right font-mono font-medium tabular-nums">
                        {formatPhp(row.price)}
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <StockBadge stockQty={row.stockQty} />
                      </TableCell>
                      <TableCell className="px-4 text-right font-mono text-xs tabular-nums">
                        {row.soldToday > 0 ? (
                          <span className="text-foreground">
                            {numberLabel(row.soldToday)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 text-right font-mono font-medium tabular-nums">
                        {formatPhp(row.stockValue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </InventoryTableScrollFade>
          )}
          <div className="flex shrink-0 flex-col gap-2 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {numberLabel(startRow)}-{numberLabel(endRow)} of{" "}
              {numberLabel(totalRows)}
            </p>
            <div className="flex items-center gap-2">
              <Link
                aria-disabled={currentPage <= 1}
                href={buildHref(
                  searchParams,
                  "page",
                  currentPage > 2 ? String(currentPage - 1) : undefined,
                )}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  currentPage <= 1 && "pointer-events-none opacity-50",
                )}
              >
                Previous
              </Link>
              <span className="min-w-16 text-center tabular-nums">
                Page {numberLabel(currentPage)} of {numberLabel(totalPages)}
              </span>
              <Link
                aria-disabled={currentPage >= totalPages}
                href={buildHref(searchParams, "page", String(currentPage + 1))}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  currentPage >= totalPages && "pointer-events-none opacity-50",
                )}
              >
                Next
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InventoryMetricCard({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "danger";
}) {
  return (
    <Card
      className={cn(
        "rounded-2xl bg-card/80 py-3",
        tone === "danger" && "border-destructive/30",
      )}
    >
      <CardContent className="space-y-3">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p className="line-clamp-2 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
