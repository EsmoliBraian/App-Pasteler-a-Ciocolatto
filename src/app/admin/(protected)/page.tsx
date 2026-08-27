import Link from "next/link";
import { getDashboardStats } from "@/lib/dashboard";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { formatARS } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONTACTED: "Contactado",
  CONFIRMED: "Confirmado",
  REJECTED: "Rechazado",
  COMPLETED: "Completado",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl text-cioco-green">Dashboard</h1>
        <p className="text-sm text-cioco-green/60">Resumen general de Ciocolatto</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <DashboardCard label="Insumos activos" value={String(stats.ingredientCount)} />
        <DashboardCard label="Bizcochuelos" value={String(stats.spongeCount)} />
        <DashboardCard label="Rellenos" value={String(stats.fillingCount)} />
        <DashboardCard label="Decoraciones" value={String(stats.decorationCount)} />
      </div>

      <DashboardCard
        label="Costo de producción combinado"
        value={formatARS(stats.totalProductionCost)}
        hint="Suma de costos de receta de todos los productos activos"
      />

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/ingredients/new" className="rounded-full bg-cioco-green px-4 py-2 text-sm font-medium text-white">
          + Nuevo insumo
        </Link>
        <Link href="/admin/products/sponges/new" className="rounded-full bg-cioco-green/10 px-4 py-2 text-sm font-medium text-cioco-green">
          + Nuevo bizcochuelo
        </Link>
        <Link href="/admin/products/fillings/new" className="rounded-full bg-cioco-green/10 px-4 py-2 text-sm font-medium text-cioco-green">
          + Nuevo relleno
        </Link>
        <Link href="/admin/products/decorations/new" className="rounded-full bg-cioco-green/10 px-4 py-2 text-sm font-medium text-cioco-green">
          + Nueva decoración
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg text-cioco-green">Últimos presupuestos</h2>
          <Link href="/admin/quotes" className="text-sm font-medium text-cioco-green/70 hover:text-cioco-green">
            Ver todos →
          </Link>
        </div>
        {stats.recentQuotes.length === 0 ? (
          <p className="text-sm text-cioco-green/50">Todavía no hay presupuestos generados.</p>
        ) : (
          <div className="flex flex-col divide-y divide-cioco-green/10">
            {stats.recentQuotes.map((q) => (
              <Link
                key={q.id}
                href={`/admin/quotes/${q.id}`}
                className="flex items-center justify-between py-3 text-sm hover:bg-cioco-cream/50"
              >
                <span className="text-cioco-green/60">
                  {new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(q.createdAt)}
                </span>
                <span className="font-medium text-cioco-green">{STATUS_LABEL[q.status] ?? q.status}</span>
                <span className="font-semibold text-cioco-brown">
                  {q.total ? formatARS(Number(q.total)) : "A confirmar"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
