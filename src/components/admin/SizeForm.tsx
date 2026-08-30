"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/app/actions/sizes";

interface SizeFormProps {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  defaultValues?: {
    name: string;
    percent: number;
    active: boolean;
    sortOrder: number;
  };
}

export function SizeForm({ action, defaultValues }: SizeFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, { ok: false });

  useEffect(() => {
    if (state.ok) router.push("/admin/sizes");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
      <Field label="Nombre">
        <input
          name="name"
          required
          placeholder="Ej: Hasta 10 personas"
          defaultValue={defaultValues?.name}
          className="input"
        />
      </Field>

      <Field label="Porcentaje del costo de insumos (100 = receta base completa)">
        <input
          name="percent"
          type="number"
          step="any"
          min="0"
          required
          defaultValue={defaultValues?.percent}
          className="input"
        />
      </Field>

      <Field label="Orden">
        <input name="sortOrder" type="number" defaultValue={defaultValues?.sortOrder ?? 0} className="input" />
      </Field>

      <label className="flex items-center gap-2 text-sm text-cioco-green">
        <input type="checkbox" name="active" defaultChecked={defaultValues?.active ?? true} />
        Medida activa (visible para clientes)
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
        <button
          type="button"
          onClick={() => router.push("/admin/sizes")}
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
