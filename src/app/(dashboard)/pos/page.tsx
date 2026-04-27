import PosTerminal from "@/features/sales/components/pos-terminal";
import { getCategories, getProducts } from "@/features/sales/queries";

export default async function PosPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return <PosTerminal products={products} categories={categories} />;
}
