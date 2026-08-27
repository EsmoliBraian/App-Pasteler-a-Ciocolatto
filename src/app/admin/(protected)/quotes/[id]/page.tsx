import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { formatARS } from "@/lib/pricing";
import { QuoteStatusControl } from "@/components/admin/QuoteStatusControl";

export const dynamic = "force-dynamic";

export default async function QuoteDetailPage({ params }: PageProps<"/admin/quotes/[id]">) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({ where: { id }, include: { items: true } });
  if (!quote) notFound();

  const sponge = quote.items.find((i) => i.type === "SPONGE");
  const fillings = quote.items.filter((i) => i.type === "FILLING");
  const decoration = quote.items.find((i) => i.type === "DECORATION");

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/quotes" className="text-sm text-cioco-green/60 hover:text-cioco-green">
            ← Volver a presupuestos
          </Link>
          <h1 className="mt-1 font-serif text-2xl text-cioco-green">Presupuesto</h1>
          <p className="text-sm text-cioco-green/60">
            {new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "short" }).format(quote.createdAt)}
          </p>
        </div>
        <QuoteStatusControl id={quote.id} status={quote.status} />
      </div>

      <div className="divide-y divide-cioco-green/10 rounded-2xl bg-white p-5 shadow-sm">
        {sponge && (
          <Row label="Bizcochuelo">
            <span>{sponge.name}</span>
            <span className="font-semibold text-cioco-brown">{formatARS(sponge.unitPrice ? Number(sponge.unitPrice) : null)}</span>
          </Row>
        )}

        <div className="py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-cioco-green/50">Rellenos</p>
          {fillings.map((f) => (
            <div key={f.id} className="mt-1 flex items-center justify-between text-sm">
              <span className="text-cioco-green">{f.name}</span>
              <span className="font-medium text-cioco-brown">{formatARS(f.unitPrice ? Number(f.unitPrice) : null)}</span>
            </div>
          ))}
        </div>

        {decoration && (
          <div className="py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cioco-green/50">Decoración</p>
            {quote.isCustomDecoration ? (
              <>
                <p className="mt-1 text-sm text-cioco-green">Personalizada</p>
                <p className="mt-1 text-sm italic text-cioco-green/70">“{quote.customDescription}”</p>
              </>
            ) : (
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-cioco-green">{decoration.name}</span>
                <span className="font-medium text-cioco-brown">
                  {formatARS(decoration.unitPrice ? Number(decoration.unitPrice) : null)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3">
          <span className="font-semibold text-cioco-green">Total</span>
          <span className="text-lg font-bold text-cioco-brown">
            {quote.total ? formatARS(Number(quote.total)) : "A confirmar"}
          </span>
        </div>
      </div>

      {(quote.customerName || quote.customerPhone) && (
        <div className="rounded-2xl bg-white p-5 shadow-sm text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-cioco-green/50">Cliente</p>
          {quote.customerName && <p className="mt-1 text-cioco-green">{quote.customerName}</p>}
          {quote.customerPhone && <p className="text-cioco-green/70">{quote.customerPhone}</p>}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-cioco-green/50">{label}</p>
      <div className="mt-1 flex items-center justify-between text-sm">{children}</div>
    </div>
  );
}
