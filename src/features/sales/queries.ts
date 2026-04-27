import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";

export async function getProducts() {
  return db.select().from(products).orderBy(asc(products.name));
}

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}
