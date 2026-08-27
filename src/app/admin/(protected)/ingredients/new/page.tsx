import { IngredientForm } from "@/components/admin/IngredientForm";
import { createIngredientAction } from "@/app/actions/ingredients";

export default function NewIngredientPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl text-cioco-green">Nuevo insumo</h1>
      <IngredientForm action={createIngredientAction} />
    </div>
  );
}
