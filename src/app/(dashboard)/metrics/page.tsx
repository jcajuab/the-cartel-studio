import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryTile from "@/features/metrics/components/category-tile";
import {
  getCategoryDistribution,
  getTotalRevenue,
  getTransactionCounts,
} from "@/features/metrics/queries";
import { formatPhp } from "@/lib/format";

export default async function MetricsPage() {
  const [revenue, counts, categories] = await Promise.all([
    getTotalRevenue(),
    getTransactionCounts(),
    getCategoryDistribution(),
  ]);

  return (
    <div className="p-6 space-y-8">
      <p className="text-sm text-muted-foreground">
        Live from the ledger — drill any category to its journal entries.
      </p>

      {/* KPI tiles (not clickable) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net revenue (today&apos;s ledger)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {formatPhp(revenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {counts.completed}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {counts.completed} completed &middot; {counts.voided} voided
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category distribution — clickable */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">By category</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((metric) => (
            <CategoryTile key={metric.categoryId} metric={metric} />
          ))}
        </div>
      </div>
    </div>
  );
}
