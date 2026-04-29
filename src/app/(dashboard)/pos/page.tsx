import { Suspense } from "react";
import { PosPageLoading } from "@/components/shell/page-loading";
import PosTerminal from "@/features/sales/components/pos-terminal";
import { getCategories, getProducts } from "@/features/sales/queries";

export default function PosPage() {
  return (
    <Suspense fallback={<PosPageLoading />}>
      <PosTerminalData />
    </Suspense>
  );
}

async function PosTerminalData() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return <PosTerminal products={products} categories={categories} />;
}
