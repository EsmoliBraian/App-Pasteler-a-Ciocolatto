"use client";

import { useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { StepIndicator } from "@/components/builder/StepIndicator";
import { OptionCard } from "@/components/builder/OptionCard";
import { PriceDisplay } from "@/components/builder/PriceDisplay";
import { NavigationButtons } from "@/components/builder/NavigationButtons";
import { formatARS } from "@/lib/pricing";
import { createQuoteAction } from "@/app/actions/quotes";
import type { BuilderData } from "@/lib/types";

const CakeCanvas = dynamic(() => import("@/components/cake/CakeCanvas").then((m) => m.CakeCanvas), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-3xl bg-cioco-green/5 sm:h-80 md:h-[420px]" />,
});

const DECORATION_TABS: { key: string; label: string }[] = [
  { key: "CLASSIC", label: "Decoraciones clásicas" },
  { key: "SPECIAL", label: "Especiales" },
  { key: "FRUIT", label: "Frutas" },
  { key: "CUSTOM", label: "Personalizado" },
];

type Step = 0 | 1 | 2 | 3 | 4 | 5;

export function BuilderApp({ sponges, fillings, decorations, maxFillings }: BuilderData) {
  const [step, setStep] = useState<Step>(0);
  const [spinToken, setSpinToken] = useState(0);

  const [spongeId, setSpongeId] = useState<string | null>(null);
  const [fillingIds, setFillingIds] = useState<string[]>([]);
  const [decorationId, setDecorationId] = useState<string | null>(null);
  const [decorationTab, setDecorationTab] = useState("CLASSIC");
  const [customDescription, setCustomDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const selectedSponge = useMemo(() => sponges.find((s) => s.id === spongeId) ?? null, [sponges, spongeId]);
  const selectedFillings = useMemo(
    () => fillings.filter((f) => fillingIds.includes(f.id)),
    [fillings, fillingIds]
  );
  const selectedDecoration = useMemo(
    () => decorations.find((d) => d.id === decorationId) ?? null,
    [decorations, decorationId]
  );
  const customProduct = useMemo(() => decorations.find((d) => d.isCustom) ?? null, [decorations]);

  const runningTotal =
    (selectedSponge?.price ?? 0) +
    selectedFillings.reduce((sum, f) => sum + (f.price ?? 0), 0) +
    (selectedDecoration && !selectedDecoration.isCustom ? (selectedDecoration.price ?? 0) : 0);

  const finalTotal = selectedDecoration?.isCustom ? null : runningTotal;

  function goTo(next: Step) {
    setSpinToken((t) => t + 1);
    setStep(next);
  }

  function toggleFilling(id: string) {
    setFillingIds((prev) => {
      if (prev.includes(id)) return prev.filter((f) => f !== id);
      if (prev.length >= maxFillings) return prev;
      return [...prev, id];
    });
  }

  function selectDecorationTab(tabKey: string) {
    setDecorationTab(tabKey);
    if (tabKey === "CUSTOM" && customProduct) {
      setDecorationId(customProduct.id);
    } else if (decorationId === customProduct?.id) {
      setDecorationId(null);
    }
  }

  async function handleSend() {
    if (!selectedSponge || !selectedDecoration) return;
    setSubmitting(true);
    setError(null);
    const result = await createQuoteAction({
      spongeId: selectedSponge.id,
      fillingIds,
      decorationId: selectedDecoration.id,
      customDescription: selectedDecoration.isCustom ? customDescription : undefined,
    });
    setSubmitting(false);

    if (!result.ok || !result.whatsappUrl) {
      setError(result.error ?? "No pudimos generar el presupuesto. Probá de nuevo.");
      return;
    }
    setWhatsappUrl(result.whatsappUrl);
    window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
    goTo(5);
  }

  function resetAll() {
    setSpongeId(null);
    setFillingIds([]);
    setDecorationId(null);
    setDecorationTab("CLASSIC");
    setCustomDescription("");
    setWhatsappUrl(null);
    setError(null);
    goTo(0);
  }

  const cake = (
    <CakeCanvas sponge={selectedSponge} fillings={selectedFillings} decoration={selectedDecoration} spinToken={spinToken} />
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-6 pt-6 md:px-8">
      <div className="grid content-start items-start gap-6 md:flex-1 md:grid-cols-[1.1fr_1fr] md:items-start">
        <div className="md:sticky md:top-8 flex flex-col items-center">
          {cake}
          {step > 0 && step < 4 && <StepIndicator step={step} total={3} />}
        </div>

        <div className="flex flex-col gap-5">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <StepPanel key="intro">
                <p className="font-serif text-3xl font-semibold text-cioco-green">Ciocolatto</p>
                <h1 className="mt-1 font-serif text-2xl text-cioco-brown">Diseñá tu torta</h1>
                <p className="mt-3 text-cioco-green/70">
                  Elegí cada detalle y obtené tu presupuesto al instante.
                </p>
                <button
                  onClick={() => goTo(1)}
                  className="mt-6 w-full rounded-full bg-cioco-green px-6 py-3 text-sm font-semibold uppercase tracking-wide text-cioco-white shadow-md transition hover:bg-cioco-green-dark"
                >
                  Comenzar →
                </button>
                <p className="mt-3 text-center text-xs text-cioco-green/50">
                  📲 Envío del presupuesto por WhatsApp
                </p>
              </StepPanel>
            )}

            {step === 1 && (
              <StepPanel key="sponge">
                <h2 className="font-serif text-xl text-cioco-brown">¿Qué bizcochuelo preferís?</h2>
                {sponges.length === 0 ? (
                  <EmptyState text="No hay bizcochuelos disponibles actualmente." />
                ) : (
                  <div className="mt-4 flex flex-col gap-2">
                    {sponges.map((s) => (
                      <OptionCard
                        key={s.id}
                        name={s.name}
                        price={s.price}
                        colorHex={s.colorHex}
                        selected={spongeId === s.id}
                        onClick={() => setSpongeId(s.id)}
                      />
                    ))}
                  </div>
                )}
              </StepPanel>
            )}

            {step === 2 && (
              <StepPanel key="filling">
                <h2 className="font-serif text-xl text-cioco-brown">¿Qué rellenos preferís?</h2>
                <p className="mt-1 text-sm text-cioco-green/60">Seleccioná 1, 2 o {maxFillings} rellenos</p>
                {fillings.length === 0 ? (
                  <EmptyState text="No hay rellenos disponibles actualmente." />
                ) : (
                  <div className="mt-4 flex flex-col gap-2">
                    {fillings.map((f) => (
                      <OptionCard
                        key={f.id}
                        multi
                        name={f.name}
                        price={f.price}
                        colorHex={f.colorHex}
                        selected={fillingIds.includes(f.id)}
                        disabled={fillingIds.length >= maxFillings}
                        onClick={() => toggleFilling(f.id)}
                      />
                    ))}
                  </div>
                )}
              </StepPanel>
            )}

            {step === 3 && (
              <StepPanel key="decoration">
                <h2 className="font-serif text-xl text-cioco-brown">¿Cómo la querés decorar?</h2>
                <div className="mt-3 flex gap-1 overflow-x-auto rounded-full bg-cioco-green/10 p-1">
                  {DECORATION_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => selectDecorationTab(tab.key)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        decorationTab === tab.key
                          ? "bg-cioco-green text-cioco-white"
                          : "text-cioco-green/70 hover:text-cioco-green"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {decorationTab === "CUSTOM" ? (
                  <div className="mt-4 rounded-2xl border-2 border-dashed border-cioco-gold/60 bg-cioco-white p-4">
                    <p className="font-medium text-cioco-green">Contanos cómo imaginás tu torta</p>
                    <textarea
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Ej: Quiero una torta blanca con flores naturales, detalles dorados y el nombre Sofía."
                      rows={4}
                      className="mt-2 w-full rounded-xl border border-cioco-green/20 bg-white p-3 text-sm text-cioco-green outline-none focus:border-cioco-green"
                    />
                    <p className="mt-2 text-xs text-cioco-green/60">
                      Nuestro equipo revisará tu pedido y te confirmará el precio final.
                    </p>
                    <p className="mt-2 text-sm font-semibold text-cioco-brown">Precio: A confirmar</p>
                  </div>
                ) : (
                  <>
                    {decorations.filter((d) => d.decorationCategory === decorationTab).length === 0 ? (
                      <EmptyState text="No hay decoraciones disponibles en esta categoría." />
                    ) : (
                      <div className="mt-4 flex flex-col gap-2">
                        {decorations
                          .filter((d) => d.decorationCategory === decorationTab)
                          .map((d) => (
                            <OptionCard
                              key={d.id}
                              name={d.name}
                              price={d.price}
                              description={d.description}
                              colorHex="#EADFC0"
                              selected={decorationId === d.id}
                              onClick={() => setDecorationId(d.id)}
                            />
                          ))}
                      </div>
                    )}
                  </>
                )}
              </StepPanel>
            )}

            {step === 4 && selectedSponge && selectedDecoration && (
              <StepPanel key="summary">
                <h2 className="font-serif text-xl text-cioco-brown">Resumen de tu torta</h2>
                <div className="mt-4 divide-y divide-cioco-green/10 rounded-2xl bg-cioco-white p-4 shadow-sm">
                  <SummaryRow label="Bizcochuelo" name={selectedSponge.name} price={selectedSponge.price} />
                  <div className="py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-cioco-green/50">
                      Rellenos
                    </p>
                    {selectedFillings.map((f) => (
                      <div key={f.id} className="mt-1 flex items-center justify-between text-sm">
                        <span className="text-cioco-green">{f.name}</span>
                        <span className="font-medium text-cioco-brown">{formatARS(f.price)}</span>
                      </div>
                    ))}
                  </div>
                  {selectedDecoration.isCustom ? (
                    <div className="py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-cioco-green/50">
                        Decoración
                      </p>
                      <p className="mt-1 text-sm text-cioco-green">Personalizada</p>
                      <p className="mt-1 text-sm italic text-cioco-green/70">“{customDescription}”</p>
                    </div>
                  ) : (
                    <SummaryRow label="Decoración" name={selectedDecoration.name} price={selectedDecoration.price} />
                  )}
                  <div className="flex items-center justify-between pt-3">
                    <span className="font-semibold text-cioco-green">Total</span>
                    <span className="text-lg font-bold text-cioco-brown">{formatARS(finalTotal)}</span>
                  </div>
                </div>
                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              </StepPanel>
            )}

            {step === 5 && (
              <StepPanel key="success">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-cioco-green text-2xl text-white">
                  ✓
                </div>
                <h2 className="mt-4 font-serif text-2xl text-cioco-brown">¡Listo!</h2>
                <p className="mt-2 text-cioco-green/70">Tu presupuesto fue enviado por WhatsApp.</p>
                <p className="mt-1 text-cioco-green/70">Te responderemos a la brevedad.</p>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-cioco-green underline"
                  >
                    Abrir WhatsApp de nuevo
                  </a>
                )}
                <button
                  onClick={resetAll}
                  className="mt-6 w-full rounded-full bg-cioco-green px-6 py-3 text-sm font-semibold uppercase tracking-wide text-cioco-white shadow-md transition hover:bg-cioco-green-dark"
                >
                  Hacer otro presupuesto
                </button>
              </StepPanel>
            )}
          </AnimatePresence>

          {step > 0 && step < 5 && (
            <div className="sticky bottom-0 mt-2 flex flex-col gap-3 rounded-2xl bg-cioco-cream/95 pb-1 pt-2 backdrop-blur">
              <PriceDisplay price={finalTotal} label={step === 4 ? "Total" : "Vas llevando"} />
              <NavigationButtons
                onBack={step > 1 ? () => goTo((step - 1) as Step) : undefined}
                continueLabel={step === 4 ? "Enviar por WhatsApp" : "Continuar"}
                loading={step === 4 ? submitting : false}
                continueDisabled={
                  (step === 1 && !spongeId) ||
                  (step === 2 && fillingIds.length === 0) ||
                  (step === 3 &&
                    (!decorationId || (selectedDecoration?.isCustom && customDescription.trim().length === 0)))
                }
                onContinue={
                  step === 4
                    ? handleSend
                    : () => goTo((step + 1) as Step)
                }
              />
              {step === 4 && (
                <button
                  onClick={() => goTo(3)}
                  className="text-center text-xs font-medium text-cioco-green/60 hover:text-cioco-green"
                >
                  ← Volver a editar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepPanel({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col"
    >
      {children}
    </motion.div>
  );
}

function SummaryRow({ label, name, price }: { label: string; name: string; price: number | null }) {
  return (
    <div className="py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-cioco-green/50">{label}</p>
      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="text-cioco-green">{name}</span>
        <span className="font-medium text-cioco-brown">{formatARS(price)}</span>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-cioco-green/30 bg-cioco-white/60 p-6 text-center text-sm text-cioco-green/60">
      {text}
    </div>
  );
}
