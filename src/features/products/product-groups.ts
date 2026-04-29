export const PRODUCT_GROUPS = [
  { id: "all", name: "All", prefix: null },
  { id: "beer", name: "Beer", prefix: "BEER-" },
  { id: "spirits", name: "Spirits", prefix: "SPRT-" },
  { id: "cocktails", name: "Cocktails", prefix: "CKTL-" },
  { id: "mixers", name: "Mixers", prefix: "MIX-" },
  { id: "food", name: "Food", prefix: "FOOD-" },
] as const;

export type ProductGroupId = (typeof PRODUCT_GROUPS)[number]["id"];

export function getProductGroup(id?: string | null) {
  return PRODUCT_GROUPS.find((group) => group.id === id) ?? PRODUCT_GROUPS[0];
}

export function groupForSku(sku: string) {
  return (
    PRODUCT_GROUPS.find(
      (group) => group.prefix !== null && sku.startsWith(group.prefix),
    ) ?? PRODUCT_GROUPS[0]
  );
}
