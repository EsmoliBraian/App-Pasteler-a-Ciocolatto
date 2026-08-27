"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/app/actions/ingredients";

const PURCHASE_UNIT_LABELS: Record<string, string> = {
  KILOGRAM: "Kilogramo (kg)",
  GRAM: "Gramo (g)",
  LITER: "Litro (l)",
  MILLILITER: "Mililitro (ml)",
  UNIT: "Unidad",
};

interface IngredientFormProps {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  defaultValues?: {
    name: string;
    supplier: string | null;
    purchaseUnit: string;
    purchaseQuantity: number;
    purchasePrice: number;
    active: boolean;
  };
}

export function IngredientForm({ action, defaultValues }: IngredientFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, { ok: false });

  useEffect(() => {
    if (state.ok) router.push("/admin/ingredients");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
      <Field label="Nombre">
        <input name="name" required defaultValue={defaultValues?.name} className="input" />
      </Field>

      <Field label="Proveedor (opcional)">
        <input name="supplier" defaultValue={defaultValues?.supplier ?? ""} className="input" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Unidad de compra">
          <select name="purchaseUnit" defaultValue={defaultValues?.purchaseUnit ?? "KILOGRAM"} className="input">
            {Object.entries(PURCHASE_UNIT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cantidad comprada">
          <input
            name="purchaseQuantity"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaultValues?.purchaseQuantity}
            className="input"
          />
        </Field>
      </div>

      <Field label="Precio de compra ($)">
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
