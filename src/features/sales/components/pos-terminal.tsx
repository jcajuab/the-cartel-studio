"use client";

import {
  Add01Icon,
  BankIcon,
  BarrelIcon,
  Cash01Icon,
  CreditCardIcon,
  DrinkIcon,
  IceCubesIcon,
  MinusSignIcon,
  QrCodeIcon,
  Restaurant02Icon,
  SmartPhone01Icon,
  SoftDrinkIcon,
  SteakIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { completeCheckout } from "@/features/sales/actions";
import { useScrollFade } from "@/hooks/use-scroll-fade";
import { formatPhp } from "@/lib/format";
import { cn } from "@/lib/utils";
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

const MENU_GROUPS = [
  { id: "all", name: "All", prefix: null, icon: Restaurant02Icon },
  { id: "beer", name: "Beer", prefix: "BEER-", icon: DrinkIcon },
  { id: "spirits", name: "Spirits", prefix: "SPRT-", icon: BarrelIcon },
  { id: "cocktails", name: "Cocktails", prefix: "CKTL-", icon: IceCubesIcon },
  { id: "mixers", name: "Mixers", prefix: "MIX-", icon: SoftDrinkIcon },
  { id: "food", name: "Food", prefix: "FOOD-", icon: SteakIcon },
] as const;

const PAYMENT_ICONS: Record<string, typeof Cash01Icon> = {
  Cash: Cash01Icon,
  GCash: SmartPhone01Icon,
  PayMaya: QrCodeIcon,
  "Credit Card": CreditCardIcon,
  "Bank Transfer": BankIcon,
};

function groupForSku(sku: string) {
  return (
    MENU_GROUPS.find((g) => g.prefix && sku.startsWith(g.prefix)) ??
    MENU_GROUPS[0]
  );
}

export default function PosTerminal({ products, categories }: Props) {
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [completedAt] = useState<Date>(new Date());

  const [state, dispatch, isPending] = useActionState<CheckoutState, FormData>(
    async (_prev, _formData) => {
      const items = Array.from(cart.entries()).map(([productId, qty]) => ({
        productId,
        qty,
      }));
      if (!categoryId) return { error: "Please select a payment method" };
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

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    for (const group of MENU_GROUPS) {
      if (group.prefix) {
        counts[group.id] = products.filter((p) =>
          p.sku.startsWith(group.prefix),
        ).length;
      }
    }
    return counts;
  }, [products]);

  const visibleProducts = useMemo(() => {
    const group = MENU_GROUPS.find((g) => g.id === activeGroup);
    if (!group?.prefix) return products;
    return products.filter((p) => p.sku.startsWith(group.prefix));
  }, [products, activeGroup]);

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

  const tabsFade = useScrollFade<HTMLElement>("horizontal");
  const productsFade = useScrollFade<HTMLDivElement>(
    "vertical",
    '[data-slot="scroll-area-viewport"]',
  );
  const itemsFade = useScrollFade<HTMLDivElement>(
    "vertical",
    '[data-slot="scroll-area-viewport"]',
  );

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
    <div className="flex h-full gap-4 overflow-hidden p-4 lg:gap-6 lg:p-6">
      {/* MENU */}
      <section className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden">
        <div className="relative">
          <nav
            ref={tabsFade.ref}
            aria-label="Menu categories"
            className="flex shrink-0 gap-2 overflow-x-auto pb-1"
          >
            {MENU_GROUPS.map((group) => {
              const isActive = activeGroup === group.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveGroup(group.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition",
                    isActive
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border bg-card hover:bg-accent",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <HugeiconsIcon icon={group.icon} size={16} />
                  </span>
                  <span>
                    <span className="block text-sm font-medium leading-tight">
                      {group.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {groupCounts[group.id] ?? 0} items
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-background/70 to-transparent transition-opacity duration-200",
              tabsFade.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-background/70 to-transparent transition-opacity duration-200",
              tabsFade.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        <div ref={productsFade.ref} className="relative min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 pr-3">
              {visibleProducts.map((product) => {
                const qty = cart.get(product.id) ?? 0;
                const group = groupForSku(product.sku);
                const outOfStock = product.stockQty <= 0;
                return (
                  <div
                    key={product.id}
                    className={cn(
                      "flex flex-col gap-3 rounded-2xl border bg-card p-3 transition",
                      qty > 0
                        ? "border-primary ring-1 ring-primary"
                        : "border-border",
                      outOfStock && "opacity-60",
                    )}
                  >
                    <div className="flex h-24 items-center justify-center rounded-xl bg-muted/60">
                      <HugeiconsIcon
                        icon={group.icon}
                        size={32}
                        className="text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {group.name}
                      </p>
                      <p className="text-sm font-medium leading-tight">
                        {product.name}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {formatPhp(product.price)}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setQty(product.id, qty - 1)}
                          disabled={qty === 0}
                          aria-label={`Decrease ${product.name}`}
                        >
                          <HugeiconsIcon icon={MinusSignIcon} size={12} />
                        </Button>
                        <span className="w-5 text-center text-xs font-medium tabular-nums">
                          {qty}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setQty(product.id, qty + 1)}
                          disabled={outOfStock || qty >= product.stockQty}
                          aria-label={`Add ${product.name}`}
                        >
                          <HugeiconsIcon icon={Add01Icon} size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-background/70 to-transparent transition-opacity duration-200",
              productsFade.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-background/70 to-transparent transition-opacity duration-200",
              productsFade.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </section>

      {/* ORDER PANEL */}
      <aside className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card 2xl:w-[360px]">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Current Order
            </p>
            <p className="mt-1.5 text-lg font-semibold leading-none">
              {cart.size === 0
                ? "No items yet"
                : `${cart.size} ${cart.size === 1 ? "item" : "items"}`}
            </p>
          </div>
          {cart.size > 0 && (
            <button
              type="button"
              onClick={resetSale}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear
            </button>
          )}
        </header>

        <div ref={itemsFade.ref} className="relative min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="px-5 py-4">
              <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
                Ordered Items
              </p>
              {cart.size === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Tap items in the menu to start an order.
                </p>
              ) : (
                <ul className="space-y-3">
                  {cartItems.map(({ product, qty, subtotal }) => (
                    <li
                      key={product.id}
                      className="flex items-baseline justify-between gap-3 text-sm"
                    >
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="text-muted-foreground tabular-nums">
                          {qty}x
                        </span>
                        <span className="truncate">{product.name}</span>
                      </span>
                      <span className="shrink-0 font-medium tabular-nums">
                        {formatPhp(subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ScrollArea>
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-card/70 to-transparent transition-opacity duration-200",
              itemsFade.start ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-card/70 to-transparent transition-opacity duration-200",
              itemsFade.end ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        <footer className="space-y-5 border-t border-border px-5 py-4">
          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
              Payment Summary
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatPhp(total)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span>Total Payable</span>
                <span className="tabular-nums">{formatPhp(total)}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
              Payment Method
            </p>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isActive = categoryId === cat.id;
                const icon = PAYMENT_ICONS[cat.name] ?? CreditCardIcon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    aria-pressed={isActive}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs transition",
                      isActive
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                        : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <HugeiconsIcon icon={icon} size={16} />
                    <span className="font-medium leading-tight">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {state !== null && "error" in state && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <form action={dispatch}>
            <Button type="submit" className="w-full" disabled={!canCheckout}>
              {isPending ? "Processing..." : "Place Order"}
            </Button>
          </form>
        </footer>
      </aside>
    </div>
  );
}
