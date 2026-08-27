import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { QuoteTable } from "@/components/admin/QuoteTable";
import type { QuoteStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES: { value: QuoteStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONTACTED", label: "Contactado" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "REJECTED", label: "Rechazado" },
  { value: "COMPLETED", label: "Completado" },
];

export default async function QuotesPage({ searchParams }: PageProps<"/admin/quotes">) {
  const { status } = await searchParams;
  const statusFilter = typeof status === "string" ? status : "ALL";

  const quotes = await prisma.quote.findMany({
    where: statusFilter !== "ALL" ? { status: statusFilter as QuoteStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: { where: { type: "SPONGE" } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl text-cioco-green">Presupuestos</h1>
        <p className="text-sm text-cioco-green/60">Historial de presupuestos generados por clientes</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={s.value === "ALL" ? "/admin/quotes" : `/admin/quotes?status=${s.value}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              statusFilter === s.value ? "bg-cioco-green text-white" : "bg-cioco-green/10 text-cioco-green"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <QuoteTable
        quotes={quotes.map((q) => ({
          id: q.id,
          createdAt: q.createdAt.toISOString(),
          spongeName: q.items[0]?.name ?? "—",
          status: q.status,
          total: q.total ? Number(q.total) : null,
        }))}
      />
    </div>
  );
}
