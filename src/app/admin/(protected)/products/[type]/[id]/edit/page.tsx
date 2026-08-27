import { notFound } from "next/navigation";
import { resolveProductTypeSlug } from "@/lib/product-type-routes";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProductAction } from "@/app/actions/products";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[type]/[id]/edit">) {
  const { type: slug, id } = await params;
  const { type, label } = resolveProductTypeSlug(slug);

  const [product, ingredients, settings] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { recipe: { include: { ingredients: true } } },
    }),
    prisma.ingredient.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    getSettings(),
  ]);

  if (!product || product.type !== type) notFound();

  const boundAction = updateProductAction.bind(null, id, type);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-cioco-green">Editar — {label}</h1>
      <ProductForm
        type={type}
        action={boundAction}
        listPath={`/admin/products/${slug}`}
        defaultMarginPercent={Number(settings.defaultMarginPercent)}
        marginMethod={settings.marginMethod}
        roundingIncrement={settings.roundingIncrement}
        ingredientOptions={ingredients.map((i) => ({
          id: i.id,
          name: i.name,
          costPerBaseUnit: Number(i.costPerBaseUnit),
          purchaseUnit: i.purchaseUnit,
        }))}
        defaultValues={{
          name: product.name,
          description: product.description,
          colorHex: product.colorHex,
          visualStyle: product.visualStyle,
          decorationCategory: product.decorationCategory,
          isCustom: product.isCustom,
          marginPercent: product.marginPercent !== null ? Number(product.marginPercent) : null,
          active: product.active,
          sortOrder: product.sortOrder,
          ingredients: product.recipe?.ingredients.map((ri) => ({ ingredientId: ri.ingredientId, quantity: Number(ri.quantity) })) ?? [],
        }}
      />
    </div>
  );
}
