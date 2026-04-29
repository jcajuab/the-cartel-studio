import Link from "next/link";
import { Suspense } from "react";
import { TablePageLoading } from "@/components/shell/page-loading";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategories } from "@/features/sales/queries";
import TransactionFilters from "@/features/transactions/components/transaction-filters";
import {
  type TransactionFilters as Filters,
  getTransactions,
} from "@/features/transactions/queries";
import { formatDateTime, formatPhp } from "@/lib/format";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TransactionsPage({ searchParams }: Props) {
  const sp = await searchParams;

  const filters: Filters = {};

  const status = sp.status;
  if (status === "COMPLETED" || status === "VOIDED") {
    filters.status = status;
  }

  const categoryId = sp.categoryId;
  if (typeof categoryId === "string" && categoryId) {
    filters.categoryId = categoryId;
  }

  const dateFrom = sp.dateFrom;
  if (typeof dateFrom === "string" && dateFrom) {
    filters.dateFrom = new Date(dateFrom);
  }

  const dateTo = sp.dateTo;
  if (typeof dateTo === "string" && dateTo) {
    const d = new Date(dateTo);
    d.setDate(d.getDate() + 1);
    filters.dateTo = d;
  }

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <Suspense fallback={<TablePageLoading columns={4} rows={8} showToolbar />}>
      <TransactionsContent filters={filters} hasFilters={hasFilters} />
    </Suspense>
  );
}

async function TransactionsContent({
  filters,
  hasFilters,
}: {
  filters: Filters;
  hasFilters: boolean;
}) {
  const [txList, categories] = await Promise.all([
    getTransactions(filters),
    getCategories(),
  ]);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <TransactionFilters categories={categories} />

      {txList.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          {hasFilters
            ? "No transactions match the filters."
            : "No transactions found."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {txList.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="text-muted-foreground text-sm">
                  <Link
                    href={`/transactions/${tx.id}`}
                    className="hover:underline text-foreground"
                  >
                    {tx.createdAt ? formatDateTime(tx.createdAt) : "—"}
                  </Link>
                </TableCell>
                <TableCell>{tx.categoryName}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatPhp(tx.total)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      tx.status === "COMPLETED" ? "default" : "destructive"
                    }
                  >
                    {tx.status === "COMPLETED" ? "Completed" : "Voided"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
