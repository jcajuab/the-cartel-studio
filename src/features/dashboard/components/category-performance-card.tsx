import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryPerformanceMetric } from "@/features/dashboard/queries";
import { formatPhp } from "@/lib/format";

interface CategoryPerformanceCardProps {
  categories: CategoryPerformanceMetric[];
}

export function CategoryPerformanceCard({
  categories,
}: CategoryPerformanceCardProps) {
  const topCategories = categories.slice(0, 3);

  return (
    <Card size="sm" className="rounded-2xl bg-card/80">
      <CardHeader className="gap-1 pb-1">
        <CardTitle className="text-lg font-semibold">Payment Mix</CardTitle>
        <p className="text-xs text-muted-foreground">Top categories today</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {topCategories.length === 0 ? (
          <p className="py-5 text-center text-sm text-muted-foreground">
            No categories found.
          </p>
        ) : (
          topCategories.map((category) => (
            <div
              key={category.categoryId}
              className="rounded-xl border border-border/60 bg-background/40 p-2.5"
            >
              <div className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <p className="min-w-0 truncate font-medium leading-none">
                  {category.categoryName}
                </p>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-semibold tabular-nums">
                    {formatPhp(category.totalToday)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {category.transactionCountToday} today
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
