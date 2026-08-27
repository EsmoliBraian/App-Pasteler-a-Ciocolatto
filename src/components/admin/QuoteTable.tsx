"use client";

import Link from "next/link";
import { formatARS } from "@/lib/pricing";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONTACTED: "Contactado",
  CONFIRMED: "Confirmado",
  REJECTED: "Rechazado",
  COMPLETED: "Completado",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  COMPLETED: "bg-neutral-200 text-neutral-700",
};

export interface QuoteRow {
  id: string;
  createdAt: string;
  spongeName: string;
  status: string;
  total: number | null;
}

export function QuoteTable({ quotes }: { quotes: QuoteRow[] }) {
  if (quotes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-cioco-green/30 bg-white/60 p-8 text-center text-sm text-cioco-green/60">
        No hay presupuestos que coincidan con el filtro.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-cioco-green/10 text-left text-xs uppercase tracking-wide text-cioco-green/50">
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Torta</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => (
            <tr key={q.id} className="border-b border-cioco-green/5 last:border-0 hover:bg-cioco-cream/40">
              <td className="px-4 py-3 text-cioco-green/70">
                {new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(q.createdAt))}
              </td>
              <td className="px-4 py-3 font-medium text-cioco-green">{q.spongeName}</td>
              <td className="px-4 py-3 font-semibold text-cioco-brown">{q.total ? formatARS(q.total) : "A confirmar"}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLOR[q.status] ?? ""}`}>
                  {STATUS_LABEL[q.status] ?? q.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/quotes/${q.id}`} className="text-cioco-green hover:underline">
                  Ver detalle
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
