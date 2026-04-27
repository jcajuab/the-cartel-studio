export const SEED_ACCOUNTS = [
  { code: "1100", name: "Cash", type: "Asset" as const },
  { code: "1110", name: "GCash", type: "Asset" as const },
  { code: "1120", name: "PayMaya", type: "Asset" as const },
  { code: "1130", name: "Credit Card", type: "Asset" as const },
  { code: "1140", name: "Bank Transfer", type: "Asset" as const },
  { code: "4000", name: "Sales Revenue", type: "Revenue" as const },
] as const;

export const SEED_CATEGORIES = [
  { name: "Cash", assetAccountCode: "1100" },
  { name: "GCash", assetAccountCode: "1110" },
  { name: "PayMaya", assetAccountCode: "1120" },
  { name: "Credit Card", assetAccountCode: "1130" },
  { name: "Bank Transfer", assetAccountCode: "1140" },
] as const;

export const SEED_PRODUCTS = [
  // Beers
  { sku: "BEER-SMP", name: "San Mig Pale Pilsen", price: 9000, stockQty: 200 },
  { sku: "BEER-SML", name: "San Mig Light", price: 9000, stockQty: 200 },
  { sku: "BEER-RH", name: "Red Horse", price: 9500, stockQty: 200 },
  { sku: "BEER-HEI", name: "Heineken", price: 14000, stockQty: 120 },
  { sku: "BEER-COR", name: "Corona", price: 15000, stockQty: 120 },
  // Spirits
  { sku: "SPRT-T5", name: "Tanduay Five Years", price: 9000, stockQty: 100 },
  { sku: "SPRT-JD", name: "Jack Daniel's", price: 22000, stockQty: 60 },
  { sku: "SPRT-ABS", name: "Absolut Vodka", price: 18000, stockQty: 60 },
  { sku: "SPRT-BAC", name: "Bacardi", price: 17000, stockQty: 60 },
  { sku: "SPRT-JC", name: "Jose Cuervo", price: 19000, stockQty: 60 },
  // Cocktails
  { sku: "CKTL-MAR", name: "Margarita", price: 25000, stockQty: 80 },
  { sku: "CKTL-MOJ", name: "Mojito", price: 24000, stockQty: 80 },
  { sku: "CKTL-LIT", name: "Long Island", price: 28000, stockQty: 60 },
  { sku: "CKTL-RC", name: "Rum Coke", price: 18000, stockQty: 100 },
  { sku: "CKTL-GT", name: "Gin Tonic", price: 19000, stockQty: 100 },
  // Mixers
  { sku: "MIX-COKE", name: "Coke", price: 6000, stockQty: 200 },
  { sku: "MIX-SPR", name: "Sprite", price: 6000, stockQty: 200 },
  { sku: "MIX-TON", name: "Tonic Water", price: 7000, stockQty: 150 },
  { sku: "MIX-SOD", name: "Soda Water", price: 6000, stockQty: 150 },
  { sku: "MIX-RB", name: "Red Bull", price: 12000, stockQty: 120 },
  // Food sides
  { sku: "FOOD-SIS", name: "Sisig", price: 28000, stockQty: 40 },
  { sku: "FOOD-PUL", name: "Pulutan Platter", price: 45000, stockQty: 30 },
  { sku: "FOOD-NAC", name: "Nachos", price: 22000, stockQty: 50 },
  { sku: "FOOD-BUF", name: "Buffalo Wings", price: 32000, stockQty: 40 },
  { sku: "FOOD-CAL", name: "Calamares", price: 26000, stockQty: 40 },
] as const;

export const VOID_REASONS = [
  "customer returned drink — flat",
  "wrong order — refunded",
  "split bill error — re-rang separately",
  "comp by manager — VIP",
] as const;
