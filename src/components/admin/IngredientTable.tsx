"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteIngredientAction } from "@/app/actions/ingredients";
import { formatARS } from "@/lib/pricing";

const UNIT_LABEL: Record<string, string> = {
  KILOGRAM: "/kg",
  GRAM: "/g",
  LITER: "/l",
  MILLILITER: "/ml",
  UNIT: "/u",
};

export interface IngredientRow {
  id: string;
  name: string;
  categoryName: string | null;
  providerName: string | null;
  purchaseUnit: string;
  purchasePrice: number;
  costPerBaseUnit: number;
  trackStock: boolean;
  stockQuantity: number | null;
  active: boolean;
  updatedAt: string;
}

export function IngredientTable({ ingredients }: { ingredients: IngredientRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ingredients;
    return ingredients.filter((ing) =>
      [ing.name, ing.categoryName, ing.providerName].some((field) => field?.toLowerCase().includes(query))
    );
  }, [ingredients, search]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar el insumo "${name}"? Si está usado en alguna receta, se desactivará en vez de borrarse.`)) {
      return;
    }
    const result = await deleteIngredientAction(id);
    if (result.error) alert(result.error);
    router.refresh();
  }

  if (ingredients.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-cioco-green/30 bg-white/60 p-8 text-center text-sm text-cioco-green/60">
        Todavía no cargaste insumos. Creá el primero para poder armar recetas.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre, categoría o proveedor…"
        className="input max-w-sm"
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cioco-green/30 bg-white/60 p-8 text-center text-sm text-cioco-green/60">
          Ningún insumo coincide con &quot;{search}&quot;.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-cioco-green/10 text-left text-xs uppercase tracking-wide text-cioco-green/50">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Costo</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((ing) => (
                <tr key={ing.id} className="border-b border-cioco-green/5 last:border-0 hover:bg-cioco-cream/40">
                  <td className="px-4 py-3 font-medium text-cioco-green">{ing.name}</td>
                  <td className="px-4 py-3 text-cioco-green/60">{ing.categoryName ?? "—"}</td>
                  <td className="px-4 py-3 text-cioco-green/60">{ing.providerName ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-cioco-brown">
                    {formatARS(ing.purchasePrice)}
                    {UNIT_LABEL[ing.purchaseUnit]}
                  </td>
                  <td className="px-4 py-3 text-cioco-green/70">
                    {ing.trackStock ? `${ing.stockQuantity ?? 0} ${UNIT_LABEL[ing.purchaseUnit]?.slice(1)}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        ing.active ? "bg-cioco-green/10 text-cioco-green" : "bg-neutral-200 text-neutral-500"
                      }`}
                    >
                      {ing.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/ingredients/${ing.id}/edit`} className="text-cioco-green hover:underline">
                        Editar
                      </Link>
                      <button onClick={() => handleDelete(ing.id, ing.name)} className="text-red-600 hover:underline">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
