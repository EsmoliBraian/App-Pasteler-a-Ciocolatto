"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/app/actions/products";
import { RecipeEditor, type IngredientOption } from "@/components/admin/RecipeEditor";
import { applyMargin, applyRounding, formatARS } from "@/lib/pricing";
import type { ProductType, MarginMethod } from "@prisma/client";

const DECORATION_STYLES = [
  { value: "chantilly", label: "Chantilly (dollops)" },
  { value: "ganache", label: "Ganache (drip)" },
  { value: "meringue", label: "Merengue (picos)" },
  { value: "rustic", label: "Rústica (textura)" },
  { value: "seminaked", label: "Semi naked" },
  { value: "dripcake", label: "Drip cake (goteo largo)" },
  { value: "custom", label: "Personalizado (sin cobertura)" },
];

const DECORATION_CATEGORIES = [
  { value: "CLASSIC", label: "Clásicas" },
  { value: "SPECIAL", label: "Especiales" },
  { value: "FRUIT", label: "Frutas" },
  { value: "CUSTOM", label: "Personalizado" },
];

interface ProductFormProps {
  type: ProductType;
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  ingredientOptions: IngredientOption[];
  defaultMarginPercent: number;
  marginMethod: MarginMethod;
  roundingIncrement: number;
  listPath: string;
  defaultValues?: {
    name: string;
    description: string | null;
    colorHex: string | null;
    visualStyle: string | null;
    decorationCategory: string | null;
    isCustom: boolean;
    marginPercent: number | null;
    active: boolean;
    sortOrder: number;
    ingredients: { ingredientId: string; quantity: number }[];
  };
}

export function ProductForm({
  type,
  action,
  ingredientOptions,
  defaultMarginPercent,
  marginMethod,
  roundingIncrement,
  listPath,
  defaultValues,
}: ProductFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, { ok: false });
  const [isCustom, setIsCustom] = useState(defaultValues?.isCustom ?? false);
  const [cost, setCost] = useState(0);
  const [marginOverride, setMarginOverride] = useState(
    defaultValues?.marginPercent !== null && defaultValues?.marginPercent !== undefined
      ? String(defaultValues.marginPercent)
      : ""
  );

  useEffect(() => {
    if (state.ok) router.push(listPath);
  }, [state.ok, router, listPath]);

  const effectiveMargin = marginOverride ? Number(marginOverride) : defaultMarginPercent;
  const price = applyRounding(applyMargin(cost, effectiveMargin, marginMethod), roundingIncrement);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
      <Field label="Nombre">
        <input name="name" required defaultValue={defaultValues?.name} className="input" />
      </Field>

      <Field label="Descripción (opcional)">
        <textarea name="description" rows={2} defaultValue={defaultValues?.description ?? ""} className="input" />
      </Field>

      {type !== "DECORATION" && (
        <Field label="Color representativo">
          <input
            type="color"
            name="colorHex"
            defaultValue={defaultValues?.colorHex ?? "#EADFC0"}
            className="h-10 w-20 rounded border border-cioco-green/20"
          />
        </Field>
      )}

      {type === "DECORATION" && (
        <>
          <label className="flex items-center gap-2 text-sm text-cioco-green">
            <input
              type="checkbox"
              name="isCustom"
              checked={isCustom}
              onChange={(e) => setIsCustom(e.target.checked)}
            />
            Es la opción &quot;Personalizado&quot; (sin receta, precio a confirmar)
          </label>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoría">
              <select name="decorationCategory" defaultValue={defaultValues?.decorationCategory ?? "CLASSIC"} className="input">
                {DECORATION_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estilo visual">
              <select name="visualStyle" defaultValue={defaultValues?.visualStyle ?? "chantilly"} className="input">
                {DECORATION_STYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </>
      )}

      {!isCustom && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-cioco-green/60">Receta</p>
          <RecipeEditor
            ingredientOptions={ingredientOptions}
            initialRows={defaultValues?.ingredients ?? []}
            onCostChange={setCost}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label={`Margen % (vacío = ${defaultMarginPercent}% por defecto)`}>
          <input
            name="marginPercent"
            type="number"
            step="0.1"
            min="0"
            value={marginOverride}
            onChange={(e) => setMarginOverride(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Orden">
          <input name="sortOrder" type="number" defaultValue={defaultValues?.sortOrder ?? 0} className="input" />
        </Field>
      </div>

      {!isCustom && (
        <div className="rounded-xl bg-cioco-cream p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-cioco-green/70">Costo</span>
            <span className="font-medium text-cioco-green">{formatARS(cost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cioco-green/70">Margen</span>
            <span className="font-medium text-cioco-green">{effectiveMargin}%</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-cioco-green/10 pt-1">
            <span className="font-semibold text-cioco-green">Precio de venta</span>
            <span className="font-bold text-cioco-brown">{formatARS(price)}</span>
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-cioco-green">
        <input type="checkbox" name="active" defaultChecked={defaultValues?.active ?? true} />
        Producto activo (visible para clientes)
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-cioco-green px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={() => router.push(listPath)} className="rounded-full px-6 py-2.5 text-sm font-medium text-cioco-green/70">
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
