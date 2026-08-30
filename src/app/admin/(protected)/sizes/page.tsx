import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SizeTable } from "@/components/admin/SizeTable";

export const dynamic = "force-dynamic";

export default async function SizesPage() {
  const sizes = await prisma.size.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-cioco-green">Medidas</h1>
          <p className="text-sm text-cioco-green/60">
            Tamaños de torta y su porcentaje sobre el costo de insumos de la receta base
          </p>
        </div>
        <Link href="/admin/sizes/new" className="rounded-full bg-cioco-green px-4 py-2 text-sm font-semibold text-white">
          + Nueva medida
        </Link>
      </div>

      <SizeTable
        sizes={sizes.map((s) => ({
          id: s.id,
          name: s.name,
          percent: Number(s.multiplier) * 100,
          active: s.active,
        }))}
      />
    </div>
  );
}
