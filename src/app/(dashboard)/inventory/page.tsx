import { Suspense } from "react";
import { TableLoadingBlock } from "@/components/shell/page-loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockBadge } from "@/features/inventory/components/stock-badge";
import { getInventoryWithSoldTonight } from "@/features/inventory/queries";

export default function InventoryPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      <p className="text-sm text-muted-foreground">
        Stock vs sold tonight — restored automatically when transactions are
        voided.
      </p>

      <Suspense fallback={<TableLoadingBlock columns={4} rows={8} />}>
        <InventoryTable />
      </Suspense>
    </div>
  );
}

async function InventoryTable() {
  const rows = await getInventoryWithSoldTonight();

  return (
    <>
      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No products found.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead className="text-right">Sold Tonight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-mono">
                  {row.sku}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {row.stockQty}
                    </span>
                    <StockBadge stockQty={row.stockQty} />
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {row.soldTonight > 0 ? (
                    <span className="text-foreground">{row.soldTonight}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
