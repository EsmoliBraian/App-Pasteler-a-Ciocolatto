"use client";

import { useActionState, useState, type ReactNode } from "react";
import {
  updateGeneralSettingsAction,
  updateWhatsappSettingsAction,
  updatePricingSettingsAction,
  updateBuilderSettingsAction,
  type ActionResult,
} from "@/app/actions/settings";
import type { MarginMethod } from "@prisma/client";

export interface PlainSettings {
  businessName: string;
  logoUrl: string | null;
  contactInfo: string | null;
  whatsappNumber: string;
  whatsappGreeting: string;
  defaultMarginPercent: number;
  marginMethod: MarginMethod;
  roundingIncrement: number;
  maxFillings: number;
}

const initial: ActionResult = { ok: false };

const TABS = [
  { key: "general", label: "General" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "pricing", label: "Precios" },
  { key: "builder", label: "Constructor" },
];

export function SettingsForms({ settings }: { settings: PlainSettings }) {
  const [tab, setTab] = useState("general");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 self-start rounded-full bg-cioco-green/10 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab === t.key ? "bg-cioco-green text-white" : "text-cioco-green/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" && <GeneralForm settings={settings} />}
      {tab === "whatsapp" && <WhatsappForm settings={settings} />}
      {tab === "pricing" && <PricingForm settings={settings} />}
      {tab === "builder" && <BuilderForm settings={settings} />}
    </div>
  );
}

function FormShell({
  action,
  state,
  pending,
  children,
}: {
  action: (formData: FormData) => void;
  state: ActionResult;
  pending: boolean;
  children: ReactNode;
}) {
  return (
    <form action={action} className="flex max-w-lg flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
      {children}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-cioco-green">Guardado ✓</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-cioco-green px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

function GeneralForm({ settings }: { settings: PlainSettings }) {
  const [state, formAction, pending] = useActionState(updateGeneralSettingsAction, initial);
  return (
    <FormShell action={formAction} state={state} pending={pending}>
      <Field label="Nombre del negocio">
        <input name="businessName" defaultValue={settings.businessName} required className="input" />
      </Field>
      <Field label="Logo (URL, opcional)">
        <input name="logoUrl" defaultValue={settings.logoUrl ?? ""} className="input" />
      </Field>
      <Field label="Información de contacto (opcional)">
        <textarea name="contactInfo" rows={3} defaultValue={settings.contactInfo ?? ""} className="input" />
      </Field>
    </FormShell>
  );
}

function WhatsappForm({ settings }: { settings: PlainSettings }) {
  const [state, formAction, pending] = useActionState(updateWhatsappSettingsAction, initial);
  return (
    <FormShell action={formAction} state={state} pending={pending}>
      <Field label="Número de WhatsApp (formato internacional, ej: +5491100000000)">
        <input name="whatsappNumber" defaultValue={settings.whatsappNumber} required className="input" />
      </Field>
      <Field label="Mensaje de saludo (encabezado del presupuesto)">
        <textarea name="whatsappGreeting" rows={3} defaultValue={settings.whatsappGreeting} required className="input" />
      </Field>
    </FormShell>
  );
}

function PricingForm({ settings }: { settings: PlainSettings }) {
  const [state, formAction, pending] = useActionState(updatePricingSettingsAction, initial);
  return (
    <FormShell action={formAction} state={state} pending={pending}>
      <Field label="Margen predeterminado (%)">
        <input
          name="defaultMarginPercent"
          type="number"
          step="0.1"
          min="0"
          defaultValue={Number(settings.defaultMarginPercent)}
          required
          className="input"
        />
      </Field>
      <Field label="Método de cálculo">
        <select name="marginMethod" defaultValue={settings.marginMethod} className="input">
          <option value="COST_PLUS">Costo + porcentaje (precio = costo × (1 + margen))</option>
          <option value="MARGIN_ON_PRICE">Margen sobre precio final (precio = costo ÷ (1 − margen))</option>
        </select>
      </Field>
      <Field label="Redondeo de precios">
        <select name="roundingIncrement" defaultValue={settings.roundingIncrement} className="input">
          <option value={0}>Sin redondeo</option>
          <option value={10}>Redondear a $10</option>
          <option value={50}>Redondear a $50</option>
          <option value={100}>Redondear a $100</option>
          <option value={500}>Redondear a $500</option>
        </select>
      </Field>
    </FormShell>
  );
}

function BuilderForm({ settings }: { settings: PlainSettings }) {
  const [state, formAction, pending] = useActionState(updateBuilderSettingsAction, initial);
  return (
    <FormShell action={formAction} state={state} pending={pending}>
      <Field label="Cantidad máxima de rellenos seleccionables">
        <input
          name="maxFillings"
          type="number"
          min="1"
          max="6"
          defaultValue={settings.maxFillings}
          required
          className="input"
        />
      </Field>
    </FormShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-cioco-green/60">{label}</span>
      {children}
    </label>
  );
}
