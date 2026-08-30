"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteSizeAction } from "@/app/actions/sizes";

export interface SizeRow {
  id: string;
  name: string;
  percent: number;
  active: boolean;
}

export function SizeTable({ sizes }: { sizes: SizeRow[] }) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la medida "${name}"? Si tiene presupuestos históricos, se desactivará en vez de borrarse.`)) {
      return;
    }
    const result = await deleteSizeAction(id);
    if (result.error) alert(result.error);
    router.refresh();
  }

  if (sizes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-cioco-green/30 bg-white/60 p-8 text-center text-sm text-cioco-green/60">
        Todavía no cargaste medidas. Creá al menos una para que los clientes puedan cotizar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-cioco-green/10 text-left text-xs uppercase tracking-wide text-cioco-green/50">
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">% del costo base</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sizes.map((s) => (
            <tr key={s.id} className="border-b border-cioco-green/5 last:border-0 hover:bg-cioco-cream/40">
              <td className="px-4 py-3 font-medium text-cioco-green">{s.name}</td>
              <td className="px-4 py-3 text-cioco-green/70">{s.percent}%</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    s.active ? "bg-cioco-green/10 text-cioco-green" : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {s.active ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <Link href={`/admin/sizes/${s.id}/edit`} className="text-cioco-green hover:underline">
                    Editar
                  </Link>
                  <button onClick={() => handleDelete(s.id, s.name)} className="text-red-600 hover:underline">
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
