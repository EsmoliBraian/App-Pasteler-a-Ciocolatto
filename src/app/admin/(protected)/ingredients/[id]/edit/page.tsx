import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { IngredientForm } from "@/components/admin/IngredientForm";
import { updateIngredientAction } from "@/app/actions/ingredients";

export default async function EditIngredientPage({ params }: PageProps<"/admin/ingredients/[id]/edit">) {
  const { id } = await params;
  const ingredient = await prisma.ingredient.findUnique({ where: { id } });
  if (!ingredient) notFound();

  const boundAction = updateIngredientAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-cioco-green">Editar insumo</h1>
      <IngredientForm
        action={boundAction}
        defaultValues={{
          name: ingredient.name,
          supplier: ingredient.supplier,
          purchaseUnit: ingredient.purchaseUnit,
          purchaseQuantity: Number(ingredient.purchaseQuantity),
          purchasePrice: Number(ingredient.purchasePrice),
          active: ingredient.active,
        }}
      />
    </div>
  );
}
