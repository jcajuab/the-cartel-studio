"use client";

import { useActionState, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { completeCheckout } from "@/features/sales/actions";
import { formatPhp } from "@/lib/format";
import ReceiptScreen from "./receipt-screen";

type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  stockQty: number;
};

type Category = {
  id: string;
  name: string;
};

type CheckoutState =
  | null
  | { error: string }
  | { transactionId: string; total: number };

interface Props {
  products: Product[];
  categories: Category[];
}

export default function PosTerminal({ products, categories }: Props) {
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [completedAt] = useState<Date>(new Date());

  const [state, dispatch, isPending] = useActionState<CheckoutState, FormData>(
    async (_prev, _formData) => {
      const items = Array.from(cart.entries()).map(([productId, qty]) => ({
        productId,
        qty,
      }));
      if (!categoryId) return { error: "Please select a category" };
      try {
        return await completeCheckout(items, categoryId);
      } catch (err) {
        return {
          error: err instanceof Error ? err.message : "Checkout failed",
        };
      }
    },
    null,
  );

  const cartItems = useMemo(() => {
    return Array.from(cart.entries()).map(([productId, qty]) => {
      const product = products.find((p) => p.id === productId) as Product;
      return { product, qty, subtotal: product.price * qty };
    });
  }, [cart, products]);

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.subtotal, 0),
    [cartItems],
  );

  function addToCart(productId: string) {
    setCart((prev) => {
      const next = new Map(prev);
      next.set(productId, (next.get(productId) ?? 0) + 1);
      return next;
    });
  }

  function setQty(productId: string, qty: number) {
    setCart((prev) => {
      const next = new Map(prev);
      if (qty <= 0) {
        next.delete(productId);
      } else {
        next.set(productId, qty);
      }
      return next;
    });
  }

  function resetSale() {
    setCart(new Map());
    setCategoryId(null);
  }

  const isCheckoutState = (
    s: CheckoutState,
  ): s is { transactionId: string; total: number } =>
    s !== null && "transactionId" in s;

  if (isCheckoutState(state)) {
    const selectedCategory = categories.find((c) => c.id === categoryId);
    return (
      <ReceiptScreen
        transactionId={state.transactionId}
        items={cartItems.map((i) => ({
          name: i.product.name,
          qty: i.qty,
          unitPrice: i.product.price,
          subtotal: i.subtotal,
        }))}
        total={state.total}
        categoryName={selectedCategory?.name ?? "Unknown"}
        completedAt={completedAt}
        onNewSale={resetSale}
      />
    );
  }

  const canCheckout = cart.size > 0 && categoryId !== null && !isPending;

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Product Grid */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <h1 className="text-xl font-semibold">POS Terminal</h1>
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 gap-3 pr-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => addToCart(product.id)}
              >
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm leading-tight">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <p className="text-sm font-semibold text-primary">
                    {formatPhp(product.price)}
                  </p>
                  <Badge
                    variant={product.stockQty < 5 ? "destructive" : "secondary"}
                    className="mt-1 text-xs"
                  >
                    {product.stockQty} left
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart Sidebar */}
      <div className="flex w-80 flex-col gap-4">
        <Card className="flex flex-1 flex-col overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cart</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden p-4 pt-0">
            {cart.size === 0 ? (
              <p className="text-sm text-muted-foreground">
                Click products to add them to the cart
              </p>
            ) : (
              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-2">
                  {cartItems.map(({ product, qty, subtotal }) => (
                    <div key={product.id} className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm leading-tight">
                          {product.name}
                        </span>
                        <span className="shrink-0 text-sm font-medium">
                          {formatPhp(subtotal)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 text-xs"
                          onClick={() => setQty(product.id, qty - 1)}
                        >
                          -
                        </Button>
                        <span className="w-6 text-center text-sm">{qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 text-xs"
                          onClick={() => setQty(product.id, qty + 1)}
                        >
                          +
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          @ {formatPhp(product.price)}
                        </span>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="space-y-3 border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">{formatPhp(total)}</span>
              </div>

              <Select
                value={categoryId ?? ""}
                onValueChange={(v) => setCategoryId(v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {state !== null && "error" in state && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}

              <form action={dispatch}>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canCheckout}
                >
                  {isPending ? "Processing..." : "Complete Checkout"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
