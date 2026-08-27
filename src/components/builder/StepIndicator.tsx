export function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-cioco-green/70">
        Paso {step} de {total}
      </span>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < step ? "w-6 bg-cioco-green" : "w-3 bg-cioco-green/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
