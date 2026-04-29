import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailPageLoading } from "@/components/shell/page-loading";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAccountLedger } from "@/features/accounting/queries";
import { formatDateTime, formatPhp } from "@/lib/format";

interface Props {
  params: Promise<{ accountId: string }>;
}

function displayBalance(balance: number, type: string): number {
  if (type === "Liability" || type === "Equity" || type === "Revenue") {
    return -balance;
  }
  return balance;
}

export default async function AccountLedgerPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailPageLoading />}>
      <AccountLedgerDetail params={params} />
    </Suspense>
  );
}

async function AccountLedgerDetail({ params }: Props) {
  const { accountId } = await params;
  const result = await getAccountLedger(accountId);

  if (!result) notFound();

  const { account, entries } = result;

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-muted-foreground">
            {account.code}
          </span>
          <span className="text-base font-semibold">{account.name}</span>
          <Badge variant="outline">{account.type}</Badge>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-lg font-mono font-medium">
            {formatPhp(displayBalance(account.balance, account.type))}
          </p>
          <p className="text-sm text-muted-foreground">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No journal entries for this account.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posted At</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead>Reversal</TableHead>
              <TableHead className="text-right">Running Balance</TableHead>
              <TableHead>Transaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDateTime(entry.postedAt)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {entry.debit > 0 ? formatPhp(entry.debit) : ""}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {entry.credit > 0 ? formatPhp(entry.credit) : ""}
                </TableCell>
                <TableCell>
                  {entry.isReversal && (
                    <Badge variant="destructive" className="text-xs">
                      Reversal
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {formatPhp(entry.runningBalance)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/transactions/${entry.transactionId}`}
                    className="text-sm font-mono hover:underline"
                  >
                    {entry.transactionId.slice(0, 8)}&hellip;
                  </Link>
                  {entry.transactionStatus === "VOIDED" && (
                    <Badge
                      variant="destructive"
                      className="ml-2 text-xs px-1 py-0"
                    >
                      Voided
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
