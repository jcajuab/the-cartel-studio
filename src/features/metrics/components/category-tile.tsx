import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryMetric } from "@/features/metrics/queries";
import { formatPhp } from "@/lib/format";

interface CategoryTileProps {
  metric: CategoryMetric;
}

export default function CategoryTile({ metric }: CategoryTileProps) {
  return (
    <Link href={`/ledger/${metric.accountId}`} className="block group/tile">
      <Card className="transition-colors hover:ring-foreground/30 cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {metric.categoryName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-semibold tabular-nums">
            {formatPhp(metric.total)}
          </p>
          <p className="text-xs text-muted-foreground">
            {metric.transactionCount}{" "}
            {metric.transactionCount === 1 ? "transaction" : "transactions"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
