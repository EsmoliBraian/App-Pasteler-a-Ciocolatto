import { SizeForm } from "@/components/admin/SizeForm";
import { createSizeAction } from "@/app/actions/sizes";

export default function NewSizePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-cioco-green">Nueva medida</h1>
      <SizeForm action={createSizeAction} />
    </div>
  );
}
