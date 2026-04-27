import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getJournalEntries } from "@/features/accounting/queries";
import { formatDateTime, formatPhp } from "@/lib/format";

export default async function JournalPage() {
  const entries = await getJournalEntries();

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Journal</h1>
        <p className="text-sm text-muted-foreground">
          All journal entries, newest first.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No journal entries found.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posted At</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead>Reversal</TableHead>
              <TableHead>Transaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDateTime(entry.postedAt)}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground mr-2">
                    {entry.accountCode}
                  </span>
                  <span className="font-medium">{entry.accountName}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {entry.accountType}
                  </Badge>
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
