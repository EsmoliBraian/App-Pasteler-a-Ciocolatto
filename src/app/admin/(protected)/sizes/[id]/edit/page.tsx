import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SizeForm } from "@/components/admin/SizeForm";
import { updateSizeAction } from "@/app/actions/sizes";

export const dynamic = "force-dynamic";

export default async function EditSizePage({ params }: PageProps<"/admin/sizes/[id]/edit">) {
  const { id } = await params;
  const size = await prisma.size.findUnique({ where: { id } });
  if (!size) notFound();

  const boundAction = updateSizeAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-cioco-green">Editar medida</h1>
      <SizeForm
        action={boundAction}
        defaultValues={{
          name: size.name,
          percent: Number(size.multiplier) * 100,
          active: size.active,
          sortOrder: size.sortOrder,
        }}
      />
    </div>
  );
}
