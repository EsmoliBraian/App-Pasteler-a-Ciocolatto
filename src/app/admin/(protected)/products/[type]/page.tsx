import Link from "next/link";
import { resolveProductTypeSlug } from "@/lib/product-type-routes";
import { getAdminProducts } from "@/lib/products";
import { ProductTable } from "@/components/admin/ProductTable";

export const dynamic = "force-dynamic";

export default async function ProductTypeListPage({ params }: PageProps<"/admin/products/[type]">) {
  const { type: slug } = await params;
  const { type, label } = resolveProductTypeSlug(slug);
  const products = await getAdminProducts(type);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-cioco-green">{label}</h1>
          <p className="text-sm text-cioco-green/60">Precios calculados a partir de costo + margen configurado</p>
        </div>
        <Link href={`/admin/products/${slug}/new`} className="rounded-full bg-cioco-green px-4 py-2 text-sm font-semibold text-white">
          + Nuevo
        </Link>
      </div>

      <ProductTable
        type={type}
        editBasePath={`/admin/products/${slug}`}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          isCustom: p.isCustom,
          active: p.active,
          decorationCategory: p.decorationCategory,
          cost: p.breakdown?.cost ?? null,
          marginPercent: p.breakdown?.marginPercent ?? null,
          price: p.price,
        }))}
      />
    </div>
  );
}
