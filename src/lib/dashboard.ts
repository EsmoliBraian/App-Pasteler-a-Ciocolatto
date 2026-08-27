import "server-only";
import { prisma } from "@/lib/prisma";
import { getAdminProducts } from "@/lib/products";

export async function getDashboardStats() {
  const [ingredientCount, sponges, fillings, decorations, recentQuotes] = await Promise.all([
    prisma.ingredient.count({ where: { active: true } }),
    getAdminProducts("SPONGE"),
    getAdminProducts("FILLING"),
    getAdminProducts("DECORATION"),
    prisma.quote.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { items: true } }),
  ]);

  const allProducts = [...sponges, ...fillings, ...decorations];
  const totalProductionCost = allProducts.reduce((sum, p) => sum + (p.breakdown?.cost ?? 0), 0);

  return {
    ingredientCount,
    spongeCount: sponges.length,
    fillingCount: fillings.length,
    decorationCount: decorations.length,
    totalProductionCost,
    recentQuotes,
  };
}
