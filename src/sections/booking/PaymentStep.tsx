import { ArrowRight, Banknote, Landmark, Smartphone } from "lucide-react";
import { PAYMENT_LABELS, type PaymentMethod } from "../../lib/booking";

const OPTIONS: {
  method: PaymentMethod;
  icon: typeof Landmark;
  description: string;
}[] = [
  {
    method: "virement",
    icon: Landmark,
    description:
      "Recevez nos coordonnées bancaires par email et réglez par virement, référence en motif.",
  },
  {
    method: "mobile_money",
    icon: Smartphone,
    description: "Réglez depuis votre téléphone (Huri Money / MVola), référence en motif.",
  },
  {
    method: "cash_agence",
    icon: Banknote,
    description:
      "Passez régler en espèces à l'agence (Moroni centre ou aéroport de Hahaya) avant la veille du départ.",
  },
];

type Props = {
  selected: PaymentMethod | null;
  totalPriceKmf: number;
  isSubmitting: boolean;
  submitError: string | null;
  onSelect: (method: PaymentMethod) => void;
  onBack: () => void;
  onSubmit: () => void;
};

const ERROR_MESSAGES: Record<string, string> = {
  not_enough_seats:
    "Il n'y a plus assez de places disponibles sur un des vols — choisissez un autre départ.",
  departure_not_found: "Ce vol n'est plus disponible — choisissez un autre départ.",
  booking_failed: "La réservation a échoué. Réessayez dans un instant.",
};

export default function PaymentStep({
  selected,
  totalPriceKmf,
  isSubmitting,
  submitError,
  onSelect,
  onBack,
  onSubmit,
}: Props) {
  return (
    <div>
      <p className="text-sm text-[var(--mutedfg)]">
        Choisissez comment vous réglerez vos billets. Votre réservation est enregistrée
        immédiatement — le billet devient <strong className="text-[var(--fg)]">définitif</strong>{" "}
        dès validation du paiement.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3" role="radiogroup" aria-label="Mode de paiement">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = selected === option.method;
          return (
            <button
              key={option.method}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onSelect(option.method)}
              className={`depth-soft rounded-2xl border-2 bg-white p-5 text-left transition-all ${
                isActive
                  ? "border-[var(--jaune)] bg-[var(--jaune)]/10"
                  : "border-transparent hover:border-[var(--bordc)]"
              }`}
              style={{ borderRadius: "calc(var(--radius) * 1.2)" }}
            >
              <span
                className={`inline-flex rounded-xl p-2.5 ${
                  isActive ? "bg-[var(--jaune)]/25 text-[var(--jaune-text)]" : "bg-[var(--muted)] text-[var(--vert)]"
                }`}
              >
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <p className="mt-3 font-semibold text-[var(--fg)]">
                {PAYMENT_LABELS[option.method]}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--mutedfg)]">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      <div
        className="mt-6 flex items-center justify-between rounded-2xl bg-[var(--muted)] px-6 py-4"
        style={{ borderRadius: "calc(var(--radius) * 1.2)" }}
      >
        <span className="text-sm text-[var(--mutedfg)]">Total à régler</span>
        <span className="font-[var(--display)] text-xl font-semibold text-[var(--vert)]">
          {totalPriceKmf.toLocaleString("fr-FR")} KMF
        </span>
      </div>

      {submitError && (
        <p className="mt-4 text-sm text-[var(--rouge)]">
          {ERROR_MESSAGES[submitError] ?? ERROR_MESSAGES.booking_failed}
        </p>
      )}

      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-full border border-[var(--inputc)] px-6 py-3 font-semibold text-[var(--fg)] transition-colors hover:border-[var(--vert)] disabled:opacity-40"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!selected || isSubmitting}
          className="depth-3d group flex items-center gap-2 rounded-full bg-[var(--vert)] px-7 py-3 font-semibold text-white transition-colors hover:bg-[var(--vert-deep)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? "Réservation en cours…" : "Confirmer ma réservation"}
          {!isSubmitting && (
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          )}
        </button>
      </div>
    </div>
  );
}
