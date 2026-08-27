import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { IngredientTable } from "@/components/admin/IngredientTable";

export const dynamic = "force-dynamic";

export default async function IngredientsPage() {
  const ingredients = await prisma.ingredient.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-cioco-green">Insumos</h1>
          <p className="text-sm text-cioco-green/60">Costos base para el cálculo de recetas y precios</p>
        </div>
        <Link href="/admin/ingredients/new" className="rounded-full bg-cioco-green px-4 py-2 text-sm font-semibold text-white">
          + Nuevo insumo
        </Link>
      </div>

      <IngredientTable
        ingredients={ingredients.map((i) => ({
          id: i.id,
          name: i.name,
          supplier: i.supplier,
          purchaseUnit: i.purchaseUnit,
          purchaseQuantity: Number(i.purchaseQuantity),
          purchasePrice: Number(i.purchasePrice),
          costPerBaseUnit: Number(i.costPerBaseUnit),
          active: i.active,
          updatedAt: i.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
