import { prisma } from "@/lib/prisma";
import { IngredientForm } from "@/components/admin/IngredientForm";
import { createIngredientAction } from "@/app/actions/ingredients";

export const dynamic = "force-dynamic";

export default async function NewIngredientPage() {
  const [providers, categories] = await Promise.all([
    prisma.provider.findMany({ orderBy: { name: "asc" } }),
    prisma.ingredient.findMany({
      where: { category: { not: null } },
      distinct: ["category"],
      select: { category: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-cioco-green">Nuevo insumo</h1>
      <IngredientForm
        action={createIngredientAction}
        providers={providers.map((p) => ({ id: p.id, name: p.name }))}
        categorySuggestions={categories.map((c) => c.category!).filter(Boolean)}
      />
    </div>
  );
}
