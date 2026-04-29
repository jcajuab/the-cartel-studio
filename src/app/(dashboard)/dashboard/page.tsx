import {
  Archive02Icon,
  Book04Icon,
  Invoice01Icon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryPerformanceCard } from "@/features/dashboard/components/category-performance-card";
import { DashboardKpiCard } from "@/features/dashboard/components/dashboard-kpi-card";
import { DashboardScrollFade } from "@/features/dashboard/components/dashboard-scroll-fade";
import { SalesTrendCard } from "@/features/dashboard/components/sales-trend-card";
import {
  getCategoryPerformance,
  getDashboardSummary,
  getInventoryRiskProducts,
  getRecentDashboardTransactions,
  getSalesTrend,
} from "@/features/dashboard/queries";
import { formatDateTime, formatPhp } from "@/lib/format";

const QUICK_LINKS: {
  href: string;
  label: string;
  icon: IconSvgElement;
}[] = [
  { href: "/pos", label: "POS", icon: ShoppingCart01Icon },
  { href: "/transactions", label: "Transactions", icon: Invoice01Icon },
  { href: "/inventory", label: "Inventory", icon: Archive02Icon },
  { href: "/ledger", label: "Ledger", icon: Book04Icon },
];
const KPI_SKELETONS = ["net", "completed", "ticket", "voids", "stock"];
const CARD_ROW_SKELETONS = ["first", "second", "third"];

export default function DashboardPage() {
  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0,transparent_28rem)] p-4 lg:p-6 min-[1800px]:h-full min-[1800px]:overflow-hidden">
      <div className="flex min-h-0 flex-col gap-4 min-[1800px]:h-full">
        <Suspense fallback={<KpiGridSkeleton />}>
          <DashboardKpis />
        </Suspense>

        <section className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="grid min-h-0 gap-4 xl:grid-rows-[auto_minmax(0,1fr)]">
            <Suspense fallback={<SalesTrendSkeleton />}>
              <SalesTrendSection />
            </Suspense>

            <div className="grid min-h-0 items-stretch gap-4 xl:grid-cols-[20rem_minmax(0,1fr)] min-[1800px]:grid-cols-[31rem_minmax(0,1fr)]">
              <QuickLinksPanel />

              <Suspense fallback={<RecentTransactionsSkeleton />}>
                <RecentTransactionsSection />
              </Suspense>
            </div>
          </div>

          <aside className="grid min-h-0 gap-4 xl:grid-rows-[auto_minmax(0,1fr)]">
            <Suspense fallback={<PaymentMixSkeleton />}>
              <PaymentMixSection />
            </Suspense>

            <Suspense fallback={<OperationsSkeleton />}>
              <OperationsSection />
            </Suspense>
          </aside>
        </section>
      </div>
    </div>
  );
}

async function DashboardKpis() {
  const summary = await getDashboardSummary();

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <DashboardKpiCard
        label="Net Revenue"
        value={formatPhp(summary.netRevenueToday)}
        detail="Sales Revenue ledger, net of reversals today"
        tone="success"
      />
      <DashboardKpiCard
        label="Completed"
        value={summary.completedSalesToday.toLocaleString("en-PH")}
        detail="Completed checkout transactions today"
      />
      <DashboardKpiCard
        label="Avg Ticket"
        value={formatPhp(summary.averageTicketToday)}
        detail="Completed sales total divided by sales count"
      />
      <DashboardKpiCard
        label="Voids"
        value={summary.voidedSalesToday.toLocaleString("en-PH")}
        detail={`${formatPhp(summary.voidedAmountToday)} voided today`}
        tone={summary.voidedSalesToday > 0 ? "warning" : "default"}
      />
      <DashboardKpiCard
        label="Stock Risk"
        value={summary.lowStockCount.toLocaleString("en-PH")}
        detail={`${summary.criticalStockCount} critical below 5 units`}
        tone={summary.criticalStockCount > 0 ? "danger" : "warning"}
      />
    </section>
  );
}

async function SalesTrendSection() {
  const trend = await getSalesTrend();
  return <SalesTrendCard points={trend} />;
}

function QuickLinksPanel() {
  return (
    <Card className="flex h-full rounded-2xl bg-card/80">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg font-semibold">Quick Links</CardTitle>
        <p className="text-xs text-muted-foreground">
          Jump to the core workflows
        </p>
      </CardHeader>
      <CardContent className="grid min-h-0 flex-1 grid-cols-2 gap-3 pb-3">
        {QUICK_LINKS.map((item) => (
          <Link
            aria-label={item.label}
            href={item.href}
            key={item.href}
            title={item.label}
            className="group/link relative flex min-h-24 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background/40 p-3 text-center transition hover:border-foreground/30 hover:bg-background/70 focus-visible:border-foreground/40"
          >
            <HugeiconsIcon
              icon={item.icon}
              size={30}
              strokeWidth={1.8}
              className="transition group-hover/link:scale-90 group-hover/link:opacity-20 group-focus-visible/link:scale-90 group-focus-visible/link:opacity-20"
            />
            <span className="absolute inset-x-2 bottom-4 translate-y-2 text-sm font-semibold opacity-0 transition group-hover/link:translate-y-0 group-hover/link:opacity-100 group-focus-visible/link:translate-y-0 group-focus-visible/link:opacity-100">
              {item.label}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

async function RecentTransactionsSection() {
  const recentTransactions = await getRecentDashboardTransactions();

  return (
    <Card className="flex min-h-0 rounded-2xl bg-card/80 xl:h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Recent Transactions
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Latest checkout activity
        </p>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        {recentTransactions.length === 0 ? (
          <p className="rounded-xl border border-border/60 py-5 text-center text-sm text-muted-foreground">
            No transactions found.
          </p>
        ) : (
          <DashboardScrollFade
            className="max-h-[22rem] xl:h-full xl:max-h-full"
            contentClassName="space-y-2 pr-1"
          >
            {recentTransactions.map((transaction) => (
              <Link
                href={`/transactions?transactionId=${transaction.id}`}
                key={transaction.id}
                className="block rounded-xl border border-border/60 bg-background/40 p-2.5 transition hover:border-foreground/30 hover:bg-background/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {transaction.categoryName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.createdAt
                        ? formatDateTime(transaction.createdAt)
                        : "No timestamp"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-semibold tabular-nums">
                      {formatPhp(transaction.total)}
                    </p>
                    <Badge
                      variant={
                        transaction.status === "COMPLETED"
                          ? "default"
                          : "destructive"
                      }
                      className="mt-1"
                    >
                      {transaction.status === "COMPLETED"
                        ? "Completed"
                        : "Voided"}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </DashboardScrollFade>
        )}
      </CardContent>
    </Card>
  );
}

async function PaymentMixSection() {
  const categories = await getCategoryPerformance();
  return <CategoryPerformanceCard categories={categories} />;
}

async function OperationsSection() {
  const [summary, categories, inventoryRisk] = await Promise.all([
    getDashboardSummary(),
    getCategoryPerformance(),
    getInventoryRiskProducts(),
  ]);
  const topCategory = categories.find((category) => category.totalToday > 0);

  return (
    <Card size="sm" className="min-h-0 rounded-2xl bg-card/80 xl:h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg font-semibold">Operations</CardTitle>
        <p className="text-xs text-muted-foreground">
          Stock pressure and ledger health
        </p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border/60 bg-background/40 p-2.5">
            <p className="text-xs text-muted-foreground">Top category</p>
            <p className="mt-0.5 truncate text-base font-semibold">
              {topCategory?.categoryName ?? "No sales"}
            </p>
            <p className="text-xs text-muted-foreground">
              {topCategory
                ? formatPhp(topCategory.totalToday)
                : "No checkout activity"}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/40 p-2.5">
            <p className="text-xs text-muted-foreground">Ledger diff</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums">
              {formatPhp(summary.ledgerDiff)}
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.ledgerBalanced ? "Balanced" : "Needs review"}
            </p>
          </div>
        </div>

        {inventoryRisk.length === 0 ? (
          <p className="rounded-xl border border-border/60 py-4 text-center text-sm text-muted-foreground">
            No low-stock products.
          </p>
        ) : (
          <div className="min-h-0 space-y-2 overflow-y-auto pr-1">
            {inventoryRisk.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.sku} · sold {product.soldToday} today
                  </p>
                </div>
                <Badge
                  variant={product.stockQty < 5 ? "destructive" : "outline"}
                  className="shrink-0"
                >
                  {product.stockQty}
                </Badge>
              </div>
            ))}
          </div>
        )}
        {inventoryRisk.length <= 3 && (
          <p className="mt-auto border-t border-border/60 pt-3 text-center text-xs text-muted-foreground">
            Operations review complete
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function KpiGridSkeleton() {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {KPI_SKELETONS.map((item) => (
        <Card className="rounded-2xl bg-card/80 py-3" key={item}>
          <CardContent className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function SalesTrendSkeleton() {
  return (
    <Card className="rounded-2xl bg-card/80">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-3 w-16" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 rounded-2xl lg:h-56" />
      </CardContent>
    </Card>
  );
}

function RecentTransactionsSkeleton() {
  return (
    <Card className="flex h-full rounded-2xl bg-card/80">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-28" />
      </CardHeader>
      <CardContent className="space-y-2">
        {CARD_ROW_SKELETONS.map((item) => (
          <Skeleton className="h-[4.6rem] rounded-xl" key={item} />
        ))}
      </CardContent>
    </Card>
  );
}

function PaymentMixSkeleton() {
  return (
    <Card size="sm" className="rounded-2xl bg-card/80">
      <CardHeader className="pb-1">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-3 w-24" />
      </CardHeader>
      <CardContent className="space-y-2">
        {CARD_ROW_SKELETONS.map((item) => (
          <Skeleton className="h-14 rounded-xl" key={item} />
        ))}
      </CardContent>
    </Card>
  );
}

function OperationsSkeleton() {
  return (
    <Card size="sm" className="rounded-2xl bg-card/80">
      <CardHeader className="pb-1">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-36" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        {CARD_ROW_SKELETONS.map((item) => (
          <Skeleton className="h-14 rounded-xl" key={item} />
        ))}
      </CardContent>
    </Card>
  );
}
