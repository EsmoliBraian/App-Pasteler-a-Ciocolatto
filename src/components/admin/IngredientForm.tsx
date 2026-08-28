"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/app/actions/ingredients";

const PURCHASE_UNIT_LABELS: Record<string, string> = {
  KILOGRAM: "Kilogramo (kg)",
  GRAM: "Gramo (g)",
  LITER: "Litro (l)",
  MILLILITER: "Mililitro (ml)",
  UNIT: "Unidad",
};

const NEW_PROVIDER_VALUE = "__new__";
const NO_PROVIDER_VALUE = "";
const NEW_CATEGORY_VALUE = "__new__";
const NO_CATEGORY_VALUE = "";

interface IngredientFormProps {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  providers: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  defaultValues?: {
    name: string;
    categoryId: string | null;
    purchaseUnit: string;
    purchasePrice: number;
    trackStock: boolean;
    stockQuantity: number | null;
    providerId: string | null;
    active: boolean;
  };
}

export function IngredientForm({ action, providers, categories, defaultValues }: IngredientFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const [trackStock, setTrackStock] = useState(defaultValues?.trackStock ?? false);
  const [providerChoice, setProviderChoice] = useState(defaultValues?.providerId ?? NO_PROVIDER_VALUE);
  const [categoryChoice, setCategoryChoice] = useState(defaultValues?.categoryId ?? NO_CATEGORY_VALUE);
  const [unit, setUnit] = useState(defaultValues?.purchaseUnit ?? "KILOGRAM");

  useEffect(() => {
    if (state.ok) router.push("/admin/ingredients");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
      <Field label="Nombre">
        <input name="name" required defaultValue={defaultValues?.name} className="input" />
      </Field>

      <Field label="Categoría (opcional)">
        <select value={categoryChoice} onChange={(e) => setCategoryChoice(e.target.value)} className="input">
          <option value={NO_CATEGORY_VALUE}>— Sin categoría —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value={NEW_CATEGORY_VALUE}>+ Cargar categoría nueva…</option>
        </select>
        <input
          type="hidden"
          name="categoryId"
          value={categoryChoice === NEW_CATEGORY_VALUE ? "" : categoryChoice}
        />
        {categoryChoice === NEW_CATEGORY_VALUE && (
          <input
            name="newCategoryName"
            placeholder="Nombre de la categoría nueva"
            className="input mt-2"
            autoFocus
          />
        )}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Unidad">
          <select name="purchaseUnit" value={unit} onChange={(e) => setUnit(e.target.value)} className="input">
            {Object.entries(PURCHASE_UNIT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Costo ($ por ${PURCHASE_UNIT_LABELS[unit]?.match(/\((.*)\)/)?.[1] ?? "unidad"})`}>
          <input
            name="purchasePrice"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaultValues?.purchasePrice}
            className="input"
          />
        </Field>
      </div>

      <Field label="Proveedor (opcional)">
        <select
          value={providerChoice}
          onChange={(e) => setProviderChoice(e.target.value)}
          className="input"
        >
          <option value={NO_PROVIDER_VALUE}>— Sin proveedor —</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
          <option value={NEW_PROVIDER_VALUE}>+ Cargar proveedor nuevo…</option>
        </select>
        <input
          type="hidden"
          name="providerId"
          value={providerChoice === NEW_PROVIDER_VALUE ? "" : providerChoice}
        />
        {providerChoice === NEW_PROVIDER_VALUE && (
          <input name="newProviderName" placeholder="Nombre del proveedor nuevo" className="input mt-2" autoFocus />
        )}
      </Field>

      <div className="rounded-xl border border-cioco-green/15 p-3">
        <label className="flex items-center gap-2 text-sm text-cioco-green">
          <input
            type="checkbox"
            name="trackStock"
            checked={trackStock}
            onChange={(e) => setTrackStock(e.target.checked)}
          />
          Controlar stock de este insumo
        </label>
        {trackStock && (
          <Field label={`Stock actual (${PURCHASE_UNIT_LABELS[unit]?.match(/\((.*)\)/)?.[1] ?? "unidad"})`}>
            <input
              name="stockQuantity"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaultValues?.stockQuantity ?? 0}
              className="input mt-2"
            />
          </Field>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-cioco-green">
        <input type="checkbox" name="active" defaultChecked={defaultValues?.active ?? true} />
        Insumo activo
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && state.affectedRecipes !== undefined && state.affectedRecipes > 0 && (
        <p className="text-sm text-cioco-gold">
          Precio actualizado — este cambio afecta a {state.affectedRecipes} receta(s).
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-cioco-green px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/ingredients")}
          className="rounded-full px-6 py-2.5 text-sm font-medium text-cioco-green/70"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-cioco-green/60">{label}</span>
      {children}
    </label>
  );
}
