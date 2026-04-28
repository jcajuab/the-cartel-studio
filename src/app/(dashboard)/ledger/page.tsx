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
import { getAccounts } from "@/features/accounting/queries";
import { formatPhp } from "@/lib/format";

function displayBalance(balance: number, type: string): number {
  // Liability / Equity / Revenue accumulate as credits, so raw debit-credit is negative.
  // Negate for intuitive display (positive = healthy).
  if (type === "Liability" || type === "Equity" || type === "Revenue") {
    return -balance;
  }
  return balance;
}

export default async function LedgerPage() {
  const accounts = await getAccounts();

  return (
    <div className="p-6 space-y-6">
      <p className="text-sm text-muted-foreground">
        Live balances from journal entries — every sale and void posts here.
      </p>

      {accounts.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No accounts found.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {account.code}
                </TableCell>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{account.type}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatPhp(displayBalance(account.balance, account.type))}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/ledger/${account.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
