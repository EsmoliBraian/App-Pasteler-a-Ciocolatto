"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatARS } from "@/lib/pricing";
import { deleteProductAction } from "@/app/actions/products";
import type { ProductType } from "@prisma/client";

export interface ProductRow {
  id: string;
  name: string;
  isCustom: boolean;
  active: boolean;
  decorationCategory: string | null;
  cost: number | null;
  marginPercent: number | null;
  price: number | null;
}

export function ProductTable({
  products,
  type,
  editBasePath,
}: {
  products: ProductRow[];
  type: ProductType;
  editBasePath: string;
}) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"? Si tiene presupuestos históricos, se desactivará en vez de borrarse.`)) return;
    const result = await deleteProductAction(id, type);
    if (result.error) alert(result.error);
    router.refresh();
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-cioco-green/30 bg-white/60 p-8 text-center text-sm text-cioco-green/60">
        Todavía no hay productos cargados en esta categoría.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-cioco-green/10 text-left text-xs uppercase tracking-wide text-cioco-green/50">
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Costo</th>
            <th className="px-4 py-3">Margen</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-cioco-green/5 last:border-0 hover:bg-cioco-cream/40">
              <td className="px-4 py-3 font-medium text-cioco-green">{p.name}</td>
              <td className="px-4 py-3 text-cioco-green/70">{p.isCustom ? "—" : formatARS(p.cost)}</td>
              <td className="px-4 py-3 text-cioco-green/70">{p.isCustom ? "—" : `${p.marginPercent}%`}</td>
              <td className="px-4 py-3 font-semibold text-cioco-brown">{p.isCustom ? "A confirmar" : formatARS(p.price)}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    p.active ? "bg-cioco-green/10 text-cioco-green" : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {p.active ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`${editBasePath}/${p.id}/edit`} className="text-cioco-green hover:underline">
                    Editar
                  </Link>
                  <button onClick={() => handleDelete(p.id, p.name)} className="text-red-600 hover:underline">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
