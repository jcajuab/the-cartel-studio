import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SalesTrendPoint } from "@/features/dashboard/queries";
import { formatPhp } from "@/lib/format";

interface SalesTrendCardProps {
  points: SalesTrendPoint[];
}

export function SalesTrendCard({ points }: SalesTrendCardProps) {
  const maxTotal = Math.max(...points.map((point) => point.total), 1);

  return (
    <Card className="rounded-2xl bg-card/80">
      <CardHeader className="flex-row items-center justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">Sales Trend</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Last 7 days</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-48 items-end gap-2 rounded-2xl bg-background/40 p-3 sm:gap-4 lg:h-56">
          {points.map((point) => {
            const height = Math.max(
              6,
              Math.round((point.total / maxTotal) * 100),
            );

            return (
              <div
                key={point.date}
                className="flex h-full min-w-0 flex-1 flex-col justify-end gap-3"
              >
                <div className="flex min-h-0 flex-1 items-end">
                  <div
                    className="w-full rounded-t-2xl bg-muted transition-colors hover:bg-foreground"
                    style={{ height: `${height}%` }}
                    title={`${point.label}: ${formatPhp(point.total)}`}
                  />
                </div>
                <div className="space-y-1 text-center">
                  <p className="truncate text-[0.65rem] text-muted-foreground">
                    {point.label}
                  </p>
                  <p className="truncate font-mono text-[0.62rem] tabular-nums">
                    {formatPhp(point.total)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
