"use client";

import { useEffect, useId, useState } from "react";
import { formatARS } from "@/lib/pricing";

export interface IngredientOption {
  id: string;
  name: string;
  costPerBaseUnit: number;
  purchaseUnit: string;
}

interface Row {
  key: string;
  ingredientId: string;
  quantity: string;
}

const UNIT_SUFFIX: Record<string, string> = {
  KILOGRAM: "g",
  GRAM: "g",
  LITER: "ml",
  MILLILITER: "ml",
  UNIT: "u",
};

export function RecipeEditor({
  ingredientOptions,
  initialRows,
  onCostChange,
}: {
  ingredientOptions: IngredientOption[];
  initialRows: { ingredientId: string; quantity: number }[];
  onCostChange?: (cost: number) => void;
}) {
  const uid = useId();
  const [rows, setRows] = useState<Row[]>(
    initialRows.length > 0
      ? initialRows.map((r, i) => ({ key: `${uid}-${i}`, ingredientId: r.ingredientId, quantity: String(r.quantity) }))
      : []
  );

  const cost = rows.reduce((sum, r) => {
    const ing = ingredientOptions.find((o) => o.id === r.ingredientId);
    const qty = Number(r.quantity);
    if (!ing || Number.isNaN(qty)) return sum;
    return sum + qty * ing.costPerBaseUnit;
  }, 0);

  useEffect(() => {
    onCostChange?.(cost);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cost]);

  function addRow() {
    setRows((prev) => [
      ...prev,
      { key: `${uid}-${prev.length}-${Date.now()}`, ingredientId: ingredientOptions[0]?.id ?? "", quantity: "" },
    ]);
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  const serialized = JSON.stringify(
    rows
      .filter((r) => r.ingredientId && Number(r.quantity) > 0)
      .map((r) => ({ ingredientId: r.ingredientId, quantity: Number(r.quantity) }))
  );

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="ingredientsJson" value={serialized} readOnly />

      {ingredientOptions.length === 0 && (
        <p className="text-sm text-cioco-green/50">Cargá insumos primero para poder armar la receta.</p>
      )}

      {rows.map((row) => {
        const ing = ingredientOptions.find((o) => o.id === row.ingredientId);
        return (
          <div key={row.key} className="flex items-center gap-2">
            <select
              value={row.ingredientId}
              onChange={(e) => updateRow(row.key, { ingredientId: e.target.value })}
              className="input flex-1"
            >
              {ingredientOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="cantidad"
              value={row.quantity}
              onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
              className="input w-28"
            />
            <span className="w-6 text-xs text-cioco-green/50">{ing ? UNIT_SUFFIX[ing.purchaseUnit] : ""}</span>
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              className="text-red-500 hover:text-red-700"
              aria-label="Quitar ingrediente"
            >
              ✕
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addRow}
        disabled={ingredientOptions.length === 0}
        className="self-start rounded-full bg-cioco-green/10 px-4 py-1.5 text-xs font-semibold text-cioco-green disabled:opacity-40"
      >
        + Agregar ingrediente
      </button>

      <p className="text-sm text-cioco-green/70">
        Costo de receta: <span className="font-semibold text-cioco-brown">{formatARS(cost)}</span>
      </p>
    </div>
  );
}
