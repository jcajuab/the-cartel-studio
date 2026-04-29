import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DETAIL_ROWS = ["total", "category", "created"];
const POS_CATEGORIES = ["cat-1", "cat-2", "cat-3", "cat-4", "cat-5"];
const POS_PRODUCTS = [
  "product-1",
  "product-2",
  "product-3",
  "product-4",
  "product-5",
  "product-6",
  "product-7",
  "product-8",
  "product-9",
];

function skeletonKeys(prefix: string, length: number) {
  return Array.from({ length }, (_, index) => `${prefix}-${index + 1}`);
}

export function TablePageLoading({
  columns = 4,
  rows = 6,
  showToolbar = false,
}: {
  columns?: number;
  rows?: number;
  showToolbar?: boolean;
}) {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {showToolbar ? (
        <div className="flex flex-wrap items-end gap-3">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-20" />
        </div>
      ) : (
        <Skeleton className="h-4 w-80 max-w-full" />
      )}

      <TableLoadingBlock columns={columns} rows={rows} />
    </div>
  );
}

export function TableLoadingBlock({
  columns = 4,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <div
        className="grid gap-3 border-b border-border/60 bg-muted/30 p-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {skeletonKeys("head", columns).map((key) => (
          <Skeleton className="h-4" key={key} />
        ))}
      </div>
      <div className="divide-y divide-border/60">
        {skeletonKeys("row", rows).map((rowKey) => (
          <div
            className="grid gap-3 p-3"
            key={rowKey}
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {skeletonKeys(rowKey, columns).map((cellKey) => (
              <Skeleton className="h-4" key={cellKey} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailPageLoading() {
  return (
    <div className="max-w-3xl space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-3">
          {DETAIL_ROWS.map((row) => (
            <div className="flex justify-between gap-4" key={row}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>

      <TableLoadingBlock columns={4} rows={4} />
    </div>
  );
}

export function PosPageLoading() {
  return (
    <div className="grid min-h-full gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-6">
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {POS_CATEGORIES.map((category) => (
            <Skeleton className="h-9 w-28 rounded-full" key={category} />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {POS_PRODUCTS.map((product) => (
            <Skeleton className="h-32 rounded-xl" key={product} />
          ))}
        </div>
      </section>
      <aside className="space-y-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </aside>
    </div>
  );
}
