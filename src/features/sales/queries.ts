import { asc } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";

export const getProducts = cache(async function getProducts() {
  return db.select().from(products).orderBy(asc(products.name));
});

export const getCategories = cache(async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
});
