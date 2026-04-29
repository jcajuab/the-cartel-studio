import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailPageLoading } from "@/components/shell/page-loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTransactionDetail } from "@/features/transactions/queries";
import VoidDialog from "@/features/void/components/void-dialog";
import { formatDateTime, formatPhp } from "@/lib/format";

interface Props {
  params: Promise<{ id: string }>;
}

export default function TransactionDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailPageLoading />}>
      <TransactionDetail params={params} />
    </Suspense>
  );
}

async function TransactionDetail({ params }: Props) {
  const { id } = await params;

  const detail = await getTransactionDetail(id);
  if (!detail) notFound();

  const { transaction: tx, items, entries } = detail;

  const shortId = `${tx.id.slice(0, 8)}…`;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-sm text-muted-foreground truncate">
            {shortId}
          </span>
          <Badge
            variant={tx.status === "COMPLETED" ? "default" : "destructive"}
          >
            {tx.status === "COMPLETED" ? "Completed" : "Voided"}
          </Badge>
        </div>
        {tx.status === "COMPLETED" && <VoidDialog transactionId={tx.id} />}
      </div>

      {/* Summary card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold font-mono">
              {formatPhp(tx.total)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category</span>
            <span>{tx.categoryName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{tx.createdAt ? formatDateTime(tx.createdAt) : "—"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Voided callout */}
      {tx.status === "VOIDED" && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 space-y-1 text-sm">
          <p className="font-semibold text-destructive">Transaction Voided</p>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Voided at</span>
            <span>{tx.voidedAt ? formatDateTime(tx.voidedAt) : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Voided by</span>
            <span>{tx.voidedByRole ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground shrink-0">Reason</span>
            <span className="text-right">{tx.voidReason ?? "—"}</span>
          </div>
        </div>
      )}

      {/* Line items */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Line Items</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Line Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={`${item.productName}-${item.unitPrice}`}>
                <TableCell>{item.productName}</TableCell>
                <TableCell className="text-right">{item.qty}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatPhp(item.unitPrice)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatPhp(item.lineTotal)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Journal entries */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Journal Entries</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead>Posted At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{entry.accountName ?? "—"}</span>
                    {entry.accountType && (
                      <span className="text-xs text-muted-foreground border border-muted rounded px-1">
                        {entry.accountType}
                      </span>
                    )}
                    {entry.isReversal && (
                      <Badge variant="outline" className="text-xs">
                        Reversal
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {entry.debit > 0 ? formatPhp(entry.debit) : ""}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {entry.credit > 0 ? formatPhp(entry.credit) : ""}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {entry.postedAt ? formatDateTime(entry.postedAt) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
