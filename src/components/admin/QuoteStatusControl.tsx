"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateQuoteStatusAction } from "@/app/actions/quotes-admin";

const OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "CONTACTED", label: "Contactado" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "REJECTED", label: "Rechazado" },
  { value: "COMPLETED", label: "Completado" },
];

export function QuoteStatusControl({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(newStatus: string) {
    setValue(newStatus);
    startTransition(async () => {
      await updateQuoteStatusAction(id, newStatus);
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value)}
      className="input w-auto"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
