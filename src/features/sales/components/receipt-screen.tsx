"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, formatPhp } from "@/lib/format";

interface ReceiptItem {
  name: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

interface Props {
  transactionId: string;
  items: ReceiptItem[];
  total: number;
  categoryName: string;
  completedAt: Date;
  onNewSale: () => void;
}

export default function ReceiptScreen({
  transactionId,
  items,
  total,
  categoryName,
  completedAt,
  onNewSale,
}: Props) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-lg">Sale Complete</CardTitle>
          <p className="text-sm text-muted-foreground">
            {process.env.NEXT_PUBLIC_BRAND_NAME ?? "Cart"}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={`${item.name}-${item.qty}`}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.name} x{item.qty}
                </span>
                <span>{formatPhp(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold">{formatPhp(total)}</span>
          </div>

          <Separator />

          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Payment</span>
              <span className="font-medium text-foreground">
                {categoryName}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span>{formatDateTime(completedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction</span>
              <span className="font-mono text-xs">
                {transactionId.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button className="flex-1" onClick={onNewSale}>
              New Sale
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
