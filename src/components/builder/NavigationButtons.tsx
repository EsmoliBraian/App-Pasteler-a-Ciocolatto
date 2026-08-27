"use client";

interface NavigationButtonsProps {
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  loading?: boolean;
}

export function NavigationButtons({
  onBack,
  onContinue,
  continueLabel = "Continuar",
  continueDisabled,
  loading,
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center gap-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="rounded-full px-4 py-3 text-sm font-medium text-cioco-green/70 transition hover:text-cioco-green"
        >
          ← Volver
        </button>
      )}
      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled || loading}
          className="flex-1 rounded-full bg-cioco-green px-6 py-3 text-sm font-semibold uppercase tracking-wide text-cioco-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-cioco-green-dark"
        >
          {loading ? "Enviando…" : continueLabel}
        </button>
      )}
    </div>
  );
}
