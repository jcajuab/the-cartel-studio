import { ViewIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
import { getCategories } from "@/features/sales/queries";
import {
  TransactionDetailContent,
  TransactionDetailNotFound,
} from "@/features/transactions/components/transaction-detail-content";
import { TransactionDetailSheet } from "@/features/transactions/components/transaction-detail-sheet";
import { TransactionHeaderActions } from "@/features/transactions/components/transaction-header-actions";
import { TransactionTableScrollFade } from "@/features/transactions/components/transaction-table-scroll-fade";
import { TransactionToolbar } from "@/features/transactions/components/transaction-toolbar";
import {
  getCurrentMonthKey,
  getTransactionCount,
  getTransactionDetail,
  getTransactionSummary,
  getTransactions,
  type TransactionFilters,
  type TransactionListRow,
} from "@/features/transactions/queries";
import { formatDateTime, formatPhp } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const STATUS_TABS: {
  label: string;
  value: "all" | "COMPLETED" | "VOIDED";
}[] = [
  { label: "All", value: "all" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Voided", value: "VOIDED" },
];
const PAGE_SIZE = 25;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getStringParam(
  params: { [key: string]: string | string[] | undefined },
  key: string,
): string | undefined {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function buildFilters(
  params: { [key: string]: string | string[] | undefined },
  defaultMonth: string,
): TransactionFilters {
  const status = getStringParam(params, "status");
  const pageParam = Number(getStringParam(params, "page") ?? "1");
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  return {
    month: getStringParam(params, "month") ?? defaultMonth,
    status: status === "COMPLETED" || status === "VOIDED" ? status : undefined,
    categoryId: getStringParam(params, "categoryId"),
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
    if (paramKey === "transactionId" && key !== "transactionId") continue;
    if (typeof paramValue === "string" && paramValue) {
      next.set(paramKey, paramValue);
    }
  }

  if (value) {
    next.set(key, value);
  } else {
    next.delete(key);
  }
  if (key !== "page" && key !== "transactionId") {
    next.delete("page");
  }

  const query = next.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

function buildTransactionHref(
  params: { [key: string]: string | string[] | undefined },
  transactionId: string,
) {
  return buildHref(params, "transactionId", transactionId);
}

function isUuid(value: string | undefined): value is string {
  return Boolean(value && UUID_PATTERN.test(value));
}

function shortReference(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function itemLabel(count: number) {
  return `${count.toLocaleString("en-PH")} ${count === 1 ? "item" : "items"}`;
}

function displayAmount(transaction: TransactionListRow) {
  if (transaction.status === "VOIDED")
    return `-${formatPhp(transaction.total)}`;
  return formatPhp(transaction.total);
}

export default async function TransactionsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const defaultMonth = getCurrentMonthKey();
  const filters = buildFilters(sp, defaultMonth);

  return (
    <>
      <TransactionHeaderActions defaultMonth={defaultMonth} />
      <Suspense
        fallback={<TablePageLoading columns={7} rows={8} showToolbar />}
      >
        <TransactionsContent filters={filters} searchParams={sp} />
      </Suspense>
    </>
  );
}

async function TransactionsContent({
  filters,
  searchParams,
}: {
  filters: TransactionFilters;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const selectedTransactionId = getStringParam(searchParams, "transactionId");
  const detailPromise = isUuid(selectedTransactionId)
    ? getTransactionDetail(selectedTransactionId)
    : Promise.resolve(null);
  const [txList, categories, summary, totalRows, selectedDetail] =
    await Promise.all([
      getTransactions(filters),
      getCategories(),
      getTransactionSummary(filters),
      getTransactionCount(filters),
      detailPromise,
    ]);

  const activeStatus = filters.status ?? "all";
  const currentPage = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(currentPage * PAGE_SIZE, totalRows);

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:p-6">
        <section className="grid shrink-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <TransactionMetricCard
            label="Net Sales"
            value={formatPhp(summary.netSales)}
            detail="Completed sales in selected filters"
          />
          <TransactionMetricCard
            label="Completed Sales"
            value={summary.completedCount.toLocaleString("en-PH")}
            detail="Checkout transactions completed"
          />
          <TransactionMetricCard
            label="Voided Amount"
            value={formatPhp(summary.voidedAmount)}
            detail="Voided transaction total"
            tone="danger"
          />
          <TransactionMetricCard
            label="Average Ticket"
            value={formatPhp(summary.averageTicket)}
            detail="Completed sales divided by count"
          />
        </section>

        <Card className="min-h-0 flex-1 gap-0 rounded-2xl bg-card/80 py-0">
          <div className="flex shrink-0 overflow-x-auto border-b border-border/60 px-4">
            {STATUS_TABS.map((tab) => {
              const isActive = activeStatus === tab.value;
              return (
                <Link
                  href={buildHref(
                    searchParams,
                    "status",
                    tab.value === "all" ? undefined : tab.value,
                  )}
                  key={tab.value}
                  className={cn(
                    "relative mr-7 flex h-11 shrink-0 items-center text-sm transition last:mr-0",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                  {isActive ? (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                  ) : null}
                </Link>
              );
            })}
          </div>

          <TransactionToolbar categories={categories} />

          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            {txList.length === 0 ? (
              <p className="flex min-h-0 flex-1 items-center justify-center py-10 text-center text-sm text-muted-foreground">
                No transactions match the current filters.
              </p>
            ) : (
              <TransactionTableScrollFade className="flex-1">
                <Table className="table-fixed">
                  <colgroup>
                    <col className="w-[22%]" />
                    <col className="w-[13%]" />
                    <col className="w-[17%]" />
                    <col className="w-[10%]" />
                    <col className="w-[11%]" />
                    <col className="w-[17%]" />
                    <col className="w-[10%]" />
                  </colgroup>
                  <TableHeader className="sticky top-0 z-10 bg-card [&_tr]:border-b">
                    <TableRow>
                      <TableHead className="h-11 px-4">Date</TableHead>
                      <TableHead className="h-11 px-4">Reference ID</TableHead>
                      <TableHead className="h-11 px-4">
                        Payment Category
                      </TableHead>
                      <TableHead className="h-11 px-4 text-right">
                        Items
                      </TableHead>
                      <TableHead className="h-11 px-4">Status</TableHead>
                      <TableHead className="h-11 px-4 text-right">
                        Amount
                      </TableHead>
                      <TableHead className="h-11 px-4 text-right">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txList.map((tx) => (
                      <TableRow key={tx.id} className="h-10">
                        <TableCell className="px-4 text-muted-foreground">
                          {tx.createdAt ? formatDateTime(tx.createdAt) : "—"}
                        </TableCell>
                        <TableCell className="px-4">
                          <Link
                            href={buildTransactionHref(searchParams, tx.id)}
                            className="font-mono text-xs text-foreground underline-offset-4 hover:underline"
                          >
                            #{shortReference(tx.id)}
                          </Link>
                        </TableCell>
                        <TableCell className="px-4 font-medium">
                          {tx.categoryName}
                        </TableCell>
                        <TableCell className="px-4 text-right font-mono text-xs">
                          {itemLabel(tx.itemCount)}
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge
                            variant={
                              tx.status === "COMPLETED"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {tx.status === "COMPLETED" ? "Completed" : "Voided"}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "px-4 text-right font-mono font-medium tabular-nums",
                            tx.status === "VOIDED" && "text-destructive",
                          )}
                        >
                          {displayAmount(tx)}
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <Link
                            href={buildTransactionHref(searchParams, tx.id)}
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                                size: "sm",
                              }),
                            )}
                          >
                            <HugeiconsIcon
                              icon={ViewIcon}
                              data-icon="inline-start"
                            />
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TransactionTableScrollFade>
            )}
            <div className="flex shrink-0 flex-col gap-2 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {startRow.toLocaleString("en-PH")}-
                {endRow.toLocaleString("en-PH")} of{" "}
                {totalRows.toLocaleString("en-PH")}
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
                  Page {currentPage.toLocaleString("en-PH")} of{" "}
                  {totalPages.toLocaleString("en-PH")}
                </span>
                <Link
                  aria-disabled={currentPage >= totalPages}
                  href={buildHref(
                    searchParams,
                    "page",
                    String(currentPage + 1),
                  )}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    currentPage >= totalPages &&
                      "pointer-events-none opacity-50",
                  )}
                >
                  Next
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedTransactionId ? (
        <TransactionDetailSheet
          closeHref={buildHref(searchParams, "transactionId")}
          open={Boolean(selectedTransactionId)}
        >
          {selectedDetail ? (
            <TransactionDetailContent detail={selectedDetail} />
          ) : (
            <TransactionDetailNotFound transactionId={selectedTransactionId} />
          )}
        </TransactionDetailSheet>
      ) : null}
    </>
  );
}

function TransactionMetricCard({
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
