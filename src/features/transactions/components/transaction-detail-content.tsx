import { PrinterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
import { TransactionPrintButton } from "@/features/transactions/components/transaction-print-button";
import type { getTransactionDetail } from "@/features/transactions/queries";
import VoidDialog from "@/features/void/components/void-dialog";
import { formatDateTime, formatPhp } from "@/lib/format";
import { cn } from "@/lib/utils";

type TransactionDetail = NonNullable<
  Awaited<ReturnType<typeof getTransactionDetail>>
>;
type Transaction = TransactionDetail["transaction"];
type LineItem = TransactionDetail["items"][number];
type JournalEntry = TransactionDetail["entries"][number];

interface TransactionDetailContentProps {
  detail: TransactionDetail;
}

export function TransactionDetailContent({
  detail,
}: TransactionDetailContentProps) {
  const { transaction, items, entries } = detail;
  const shortId = formatShortId(transaction.id);
  const createdAt = transaction.createdAt
    ? formatDateTime(transaction.createdAt)
    : "No timestamp";
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-5">
        <TransactionSummary
          transaction={transaction}
          shortId={shortId}
          createdAt={createdAt}
          itemCount={itemCount}
        />
        <DetailList transaction={transaction} createdAt={createdAt} />
        {transaction.status === "VOIDED" && (
          <VoidedDetails transaction={transaction} />
        )}
        <LineItems items={items} total={transaction.total} />
        <JournalEntries entries={entries} />
      </div>

      <div className="shrink-0 border-t border-border/60 bg-popover px-5 py-4">
        <div
          className={cn(
            "grid grid-cols-1 gap-2",
            transaction.status === "COMPLETED" && "sm:grid-cols-2",
          )}
        >
          <TransactionPrintButton className="w-full">
            <HugeiconsIcon icon={PrinterIcon} data-icon="inline-start" />
            Print Receipt
          </TransactionPrintButton>
          {transaction.status === "COMPLETED" ? (
            <VoidDialog
              transactionId={transaction.id}
              label="Void Transaction"
              className="w-full"
            />
          ) : null}
        </div>
      </div>

      <TransactionPrintReceipt
        transaction={transaction}
        items={items}
        shortId={shortId}
        createdAt={createdAt}
      />
    </div>
  );
}

export function TransactionDetailNotFound({
  transactionId,
}: {
  transactionId: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-5 pb-6">
      <div className="w-full rounded-xl border border-border/70 bg-background/40 p-4 text-sm">
        <p className="font-medium">Transaction not found</p>
        <p className="mt-1 text-muted-foreground">
          No transaction exists for this reference.
        </p>
        <p className="mt-3 break-all font-mono text-xs text-muted-foreground">
          {transactionId}
        </p>
      </div>
    </div>
  );
}

function TransactionSummary({
  transaction,
  shortId,
  createdAt,
  itemCount,
}: {
  transaction: Transaction;
  shortId: string;
  createdAt: string;
  itemCount: number;
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-background/45 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                transaction.status === "COMPLETED" ? "default" : "destructive"
              }
            >
              {statusLabel(transaction.status)}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              #{shortId}
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {transaction.categoryName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{createdAt}</p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={cn(
              "font-mono text-2xl font-semibold tabular-nums",
              transaction.status === "VOIDED" && "text-destructive",
            )}
          >
            {transaction.status === "VOIDED" ? "-" : ""}
            {formatPhp(transaction.total)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatItemCount(itemCount)}
          </p>
        </div>
      </div>
    </section>
  );
}

function DetailList({
  transaction,
  createdAt,
}: {
  transaction: Transaction;
  createdAt: string;
}) {
  return (
    <Card className="rounded-xl bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <DetailRow label="Transaction ID" value={transaction.id} mono />
        <DetailRow label="Transaction Date" value={createdAt} />
        <DetailRow label="Payment" value={transaction.categoryName} />
        <DetailRow
          label="Status"
          value={statusLabel(transaction.status)}
          valueClassName={
            transaction.status === "VOIDED" ? "text-destructive" : undefined
          }
        />
        <DetailRow label="Amount" value={formatPhp(transaction.total)} mono />
      </CardContent>
    </Card>
  );
}

function VoidedDetails({ transaction }: { transaction: Transaction }) {
  return (
    <Card className="rounded-xl border-destructive/35 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-destructive">
          Void Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <DetailRow
          label="Voided At"
          value={
            transaction.voidedAt
              ? formatDateTime(transaction.voidedAt)
              : "No timestamp"
          }
        />
        <DetailRow
          label="Voided By"
          value={transaction.voidedByRole ?? "Not recorded"}
        />
        <DetailRow
          label="Reason"
          value={transaction.voidReason ?? "Not recorded"}
        />
      </CardContent>
    </Card>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  valueClassName,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "min-w-0 break-words text-right font-medium",
          mono && "font-mono text-xs tabular-nums",
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  );
}

function LineItems({ items, total }: { items: LineItem[]; total: number }) {
  return (
    <Card className="rounded-xl bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Line Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item.productName}-${item.unitPrice}-${index}`}
            className="rounded-lg border border-border/60 bg-background/35 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{item.productName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.qty} x {formatPhp(item.unitPrice)}
                </p>
              </div>
              <p className="shrink-0 font-mono font-semibold tabular-nums">
                {formatPhp(item.lineTotal)}
              </p>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-mono text-lg font-semibold tabular-nums">
            {formatPhp(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function JournalEntries({ entries }: { entries: JournalEntry[] }) {
  return (
    <Card className="rounded-xl bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Accounting Entries
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-9 pl-4">Account</TableHead>
              <TableHead className="h-9 text-right">Debit</TableHead>
              <TableHead className="h-9 pr-4 text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="max-w-36 whitespace-normal pl-4">
                  <div className="space-y-1">
                    <p className="font-medium">{entry.accountName ?? "—"}</p>
                    <div className="flex flex-wrap gap-1">
                      {entry.accountType && (
                        <Badge variant="outline">{entry.accountType}</Badge>
                      )}
                      {entry.isReversal && (
                        <Badge variant="destructive">Reversal</Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {entry.debit > 0 ? formatPhp(entry.debit) : ""}
                </TableCell>
                <TableCell className="pr-4 text-right font-mono text-xs">
                  {entry.credit > 0 ? formatPhp(entry.credit) : ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TransactionPrintReceipt({
  transaction,
  items,
  shortId,
  createdAt,
}: {
  transaction: Transaction;
  items: LineItem[];
  shortId: string;
  createdAt: string;
}) {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? "The Cartel Studio";
  const receiptRule = "*".repeat(30);

  return (
    <section aria-hidden="true" className="transaction-print-receipt">
      <div className="receipt-paper">
        <header className="receipt-header">
          <h1>{brandName}</h1>
          <p>Official sales receipt</p>
          <p>{createdAt}</p>
        </header>

        <p className="receipt-rule">{receiptRule}</p>
        <h2>{transaction.categoryName.toUpperCase()} RECEIPT</h2>
        <p className="receipt-rule">{receiptRule}</p>

        <div className="receipt-row receipt-heading">
          <span>Description</span>
          <span>Price</span>
        </div>

        <div className="receipt-lines">
          {items.map((item, index) => (
            <div
              className="receipt-item"
              key={`transaction-print-${item.productName}-${item.qty}-${index}`}
            >
              <div>
                <span>{item.productName}</span>
                <small>
                  {item.qty} x {formatPhp(item.unitPrice)}
                </small>
              </div>
              <span>{formatPhp(item.lineTotal)}</span>
            </div>
          ))}
        </div>

        <p className="receipt-rule">{receiptRule}</p>

        <div className="receipt-total">
          <span>Total</span>
          <span>{formatPhp(transaction.total)}</span>
        </div>

        <div className="receipt-meta">
          <div className="receipt-row">
            <span>Payment</span>
            <span>{transaction.categoryName}</span>
          </div>
          <div className="receipt-row">
            <span>Transaction</span>
            <span>{shortId}</span>
          </div>
        </div>

        <p className="receipt-rule">{receiptRule}</p>
        <p className="receipt-thanks">THANK YOU!</p>
        <div className="receipt-barcode" />
        <p className="receipt-id">{transaction.id}</p>
      </div>
    </section>
  );
}

function statusLabel(status: Transaction["status"]) {
  return status === "COMPLETED" ? "Completed" : "Voided";
}

function formatShortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function formatItemCount(count: number) {
  return `${count.toLocaleString("en-PH")} ${count === 1 ? "item" : "items"}`;
}
