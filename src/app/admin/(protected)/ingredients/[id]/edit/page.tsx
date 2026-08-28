import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { IngredientForm } from "@/components/admin/IngredientForm";
import { updateIngredientAction } from "@/app/actions/ingredients";

export const dynamic = "force-dynamic";

export default async function EditIngredientPage({ params }: PageProps<"/admin/ingredients/[id]/edit">) {
  const { id } = await params;
  const [ingredient, providers, categories] = await Promise.all([
    prisma.ingredient.findUnique({ where: { id } }),
    prisma.provider.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!ingredient) notFound();

  const boundAction = updateIngredientAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-cioco-green">Editar insumo</h1>
      <IngredientForm
        action={boundAction}
        providers={providers.map((p) => ({ id: p.id, name: p.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        defaultValues={{
          name: ingredient.name,
          categoryId: ingredient.categoryId,
          purchaseUnit: ingredient.purchaseUnit,
          purchasePrice: Number(ingredient.purchasePrice),
          trackStock: ingredient.trackStock,
          stockQuantity: ingredient.stockQuantity !== null ? Number(ingredient.stockQuantity) : null,
          providerId: ingredient.providerId,
          active: ingredient.active,
        }}
      />
    </div>
  );
}
