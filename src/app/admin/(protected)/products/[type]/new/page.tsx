import { resolveProductTypeSlug } from "@/lib/product-type-routes";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "@/app/actions/products";

export default async function NewProductPage({ params }: PageProps<"/admin/products/[type]/new">) {
  const { type: slug } = await params;
  const { type, label } = resolveProductTypeSlug(slug);

  const [ingredients, settings] = await Promise.all([
    prisma.ingredient.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    getSettings(),
  ]);

  const boundAction = createProductAction.bind(null, type);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-cioco-green">Nuevo — {label}</h1>
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
      />
    </div>
  );
}
