"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, formatPhp } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface ReceiptItem {
  name: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

export interface CompletedReceipt {
  transactionId: string;
  items: ReceiptItem[];
  total: number;
  categoryName: string;
  completedAt: Date;
}

interface Props {
  receipt: CompletedReceipt;
  onNewSale: () => void;
}

export default function ReceiptScreen({ receipt, onNewSale }: Props) {
  const newSaleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    newSaleRef.current?.focus();
  }, []);

  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Cart";
  const shortTransactionId = receipt.transactionId.slice(0, 8).toUpperCase();
  const receiptRule = "*".repeat(30);

  return (
    <>
      <section className="flex h-full flex-col bg-card">
        <header className="border-b border-border px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Sale Complete
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {formatPhp(receipt.total)}
          </h2>
          <p className="text-xs text-muted-foreground">
            Order paid with {receipt.categoryName}
          </p>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 px-5 py-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Receipt
            </p>
            <div className="rounded-xl border border-border/70 bg-background/40 p-3">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{brandName}</span>
                <span className="font-mono">{shortTransactionId}</span>
              </div>
              <div className="space-y-2">
                {receipt.items.map((item) => (
                  <div
                    key={`${item.name}-${item.qty}-${item.subtotal}`}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="truncate">{item.name}</span>
                      <span className="ml-1 text-muted-foreground">
                        x{item.qty}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatPhp(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-3" />

              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold tabular-nums">
                  {formatPhp(receipt.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-medium">{receipt.categoryName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Date</span>
              <span className="text-right">
                {formatDateTime(receipt.completedAt)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Transaction</span>
              <Link
                href={`/transactions/${receipt.transactionId}`}
                className="font-mono text-xs underline-offset-4 hover:underline"
              >
                {shortTransactionId}
              </Link>
            </div>
          </div>

          <div className="mt-auto space-y-2">
            <Button ref={newSaleRef} className="w-full" onClick={onNewSale}>
              New Sale
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/transactions/${receipt.transactionId}`}
                className={cn(buttonVariants({ variant: "outline" }), "w-full")}
              >
                View Transaction
              </Link>
              <Button variant="outline" onClick={() => window.print()}>
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section aria-hidden="true" className="pos-print-receipt">
        <div className="receipt-paper">
          <header className="receipt-header">
            <h1>{brandName}</h1>
            <p>Official sales receipt</p>
            <p>{formatDateTime(receipt.completedAt)}</p>
          </header>

          <p className="receipt-rule">{receiptRule}</p>
          <h2>{receipt.categoryName.toUpperCase()} RECEIPT</h2>
          <p className="receipt-rule">{receiptRule}</p>

          <div className="receipt-row receipt-heading">
            <span>Description</span>
            <span>Price</span>
          </div>

          <div className="receipt-lines">
            {receipt.items.map((item) => (
              <div
                className="receipt-item"
                key={`print-${item.name}-${item.qty}-${item.subtotal}`}
              >
                <div>
                  <span>{item.name}</span>
                  <small>
                    {item.qty} x {formatPhp(item.unitPrice)}
                  </small>
                </div>
                <span>{formatPhp(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <p className="receipt-rule">{receiptRule}</p>

          <div className="receipt-total">
            <span>Total</span>
            <span>{formatPhp(receipt.total)}</span>
          </div>

          <div className="receipt-meta">
            <div className="receipt-row">
              <span>Payment</span>
              <span>{receipt.categoryName}</span>
            </div>
            <div className="receipt-row">
              <span>Transaction</span>
              <span>{shortTransactionId}</span>
            </div>
          </div>

          <p className="receipt-rule">{receiptRule}</p>
          <p className="receipt-thanks">THANK YOU!</p>
          <div className="receipt-barcode" />
          <p className="receipt-id">{receipt.transactionId}</p>
        </div>
      </section>
    </>
  );
}
