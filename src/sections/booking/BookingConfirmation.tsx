import { CheckCircle2, Clock3, Mail } from "lucide-react";
import {
  PAYMENT_LABELS,
  type BookingConfirmation as Confirmation,
} from "../../lib/booking";

type Props = {
  confirmation: Confirmation;
  onNewBooking: () => void;
};

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function BookingConfirmation({ confirmation, onNewBooking }: Props) {
  const isPaid = confirmation.paymentStatus === "paid";

  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--vert)]">
        <CheckCircle2 size={16} aria-hidden="true" />
        Réservation enregistrée
      </p>
      <h3 className="mt-2 font-[var(--display)] text-3xl font-semibold text-[var(--fg)]">
        Karibu à bord !
      </h3>
      <p className="mt-1 text-sm text-[var(--mutedfg)]">
        Référence <strong className="text-[var(--fg)]">{confirmation.reference}</strong>
      </p>

      <div
        className="mt-6 overflow-hidden rounded-2xl border border-[var(--or)]/60 bg-white shadow-[0_10px_36px_rgba(22,33,26,.10)]"
        style={{ borderRadius: "calc(var(--radius) * 1.4)" }}
      >
        <div
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider ${
            isPaid ? "bg-[var(--muted)] text-[var(--vert)]" : "bg-[var(--jaune)]/20 text-[var(--jaune-text)]"
          }`}
        >
          <Clock3 size={14} aria-hidden="true" />
          {isPaid ? "Billet définitif — payé" : "En attente de paiement"}
        </div>

        {confirmation.segments.map((seg) => (
          <div
            key={seg.kind}
            className="border-b border-[var(--bordc)] px-6 py-4 last:border-0"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--vert)]">
              {seg.kind}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <div>
                <p className="font-[var(--display)] text-xl font-semibold text-[var(--fg)]">
                  {seg.departureCode} → {seg.arrivalCode}
                </p>
                <p className="text-xs text-[var(--mutedfg)]">
                  {seg.departurePlace} vers {seg.arrivalPlace}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-[var(--fg)]">{formatDate(seg.departureDate)}</p>
                <p className="text-[var(--mutedfg)]">
                  Départ {seg.departureTime} · {seg.durationMinutes} min
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="border-t border-[var(--bordc)] px-6 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--mutedfg)]">
            Passagers
          </p>
          <ul className="mt-1.5 space-y-1 text-sm text-[var(--fg)]">
            {confirmation.passengerNames.map((name, i) => (
              <li key={i}>
                {String(i + 1).padStart(2, "0")} — {name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--bordc)] bg-[var(--creme)] px-6 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--mutedfg)]">
              Total · {PAYMENT_LABELS[confirmation.paymentMethod]}
            </p>
            <p className="font-[var(--display)] text-xl font-semibold text-[var(--vert)]">
              {confirmation.totalPriceKmf.toLocaleString("fr-FR")} KMF
            </p>
          </div>
        </div>
      </div>

      <div
        className="mt-4 flex items-start gap-3 rounded-2xl bg-[var(--muted)] p-4 text-sm text-[var(--mutedfg)]"
        style={{ borderRadius: "calc(var(--radius) * 1.2)" }}
      >
        <Mail size={16} className="mt-0.5 shrink-0 text-[var(--vert)]" aria-hidden="true" />
        <p>
          {confirmation.emailSent
            ? "Votre e-ticket PDF et les instructions de paiement viennent de vous être envoyés par email. "
            : "L'email n'a pas pu être envoyé — conservez précieusement votre référence. "}
          Dès validation de votre paiement, vous recevrez automatiquement votre{" "}
          <strong className="text-[var(--fg)]">billet définitif</strong>.
        </p>
      </div>

      <button
        type="button"
        onClick={onNewBooking}
        className="mt-8 rounded-full border border-[var(--inputc)] px-6 py-3 font-semibold text-[var(--fg)] transition-colors hover:border-[var(--vert)]"
      >
        Faire une nouvelle réservation
      </button>
    </div>
  );
}
