import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { BookableDeparture } from "../../lib/booking";

type ContactInfo = {
  fullName: string;
  email: string;
  phone: string;
};

type Props = {
  departure: BookableDeparture;
  returnDeparture: BookableDeparture | null;
  passengerCount: number;
  contact: ContactInfo;
  passengerNames: string[];
  onContactChange: (contact: ContactInfo) => void;
  onPassengerNamesChange: (names: string[]) => void;
  onBack: () => void;
  onNext: () => void;
};

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const INPUT_CLASS =
  "mt-1 w-full rounded-lg border border-[var(--inputc)] bg-white px-3 py-2.5 text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--vert)]";

export default function BookingForm({
  departure,
  returnDeparture,
  passengerCount,
  contact,
  passengerNames,
  onContactChange,
  onPassengerNamesChange,
  onBack,
  onNext,
}: Props) {
  const [touched, setTouched] = useState(false);

  const isContactValid =
    contact.fullName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) &&
    contact.phone.trim().length > 0;
  const arePassengersValid = passengerNames
    .slice(0, passengerCount)
    .every((name) => name.trim().length > 0);
  const isValid = isContactValid && arePassengersValid;

  const handlePassengerNameChange = (index: number, value: string) => {
    const next = [...passengerNames];
    next[index] = value;
    onPassengerNamesChange(next);
  };

  const handleNext = () => {
    setTouched(true);
    if (isValid) onNext();
  };

  return (
    <div>
      <div
        className="rounded-2xl border border-[var(--or)]/60 bg-[var(--jaune)]/10 p-4 text-sm text-[var(--fg)]"
        style={{ borderRadius: "calc(var(--radius) * 1.2)" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--vert)]">
          Aller · {formatDate(departure.departureDate)} · {departure.leg.departureTime}
        </p>
        <p className="mt-0.5">
          {departure.leg.routeFrom} vers {departure.leg.routeTo}
        </p>
        {returnDeparture && (
          <>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--vert)]">
              Retour · {formatDate(returnDeparture.departureDate)} ·{" "}
              {returnDeparture.leg.departureTime}
            </p>
            <p className="mt-0.5">
              {returnDeparture.leg.routeFrom} vers {returnDeparture.leg.routeTo}
            </p>
          </>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--mutedfg)]">
            Nom du contact
          </label>
          <input
            value={contact.fullName}
            onChange={(e) => onContactChange({ ...contact, fullName: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--mutedfg)]">
            Email
          </label>
          <input
            type="email"
            value={contact.email}
            onChange={(e) => onContactChange({ ...contact, email: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--mutedfg)]">
            Téléphone
          </label>
          <input
            type="tel"
            value={contact.phone}
            onChange={(e) => onContactChange({ ...contact, phone: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--mutedfg)]">
          Nom des passagers
        </p>
        {Array.from({ length: passengerCount }).map((_, i) => (
          <input
            key={i}
            placeholder={`Passager ${i + 1}`}
            value={passengerNames[i] ?? ""}
            onChange={(e) => handlePassengerNameChange(i, e.target.value)}
            className={INPUT_CLASS}
          />
        ))}
      </div>

      {touched && !isValid && (
        <p className="mt-4 text-sm text-[var(--rouge)]">
          Merci de renseigner un email valide et le nom de chaque passager.
        </p>
      )}

      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-[var(--inputc)] px-6 py-3 font-semibold text-[var(--fg)] transition-colors hover:border-[var(--vert)]"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="depth-3d group flex items-center gap-2 rounded-full bg-[var(--vert)] px-7 py-3 font-semibold text-white transition-colors hover:bg-[var(--vert-deep)]"
        >
          Choisir le paiement
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
