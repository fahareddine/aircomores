import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import type { BookableDeparture } from "../../lib/booking";
import FlightCalendar from "./FlightCalendar";

type Props = {
  departuresByDate: Map<string, BookableDeparture>;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  label?: string;
  disabled?: boolean;
};

function formatShortDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function DateDropdown({
  departuresByDate,
  selectedDate,
  onSelectDate,
  label = "Date de départ",
  disabled,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Vue initiale : le mois de la date choisie, sinon le premier mois qui a
  // des vols — jamais un mois vide.
  const firstAvailableDate = useMemo(() => {
    const keys = Array.from(departuresByDate.keys()).sort();
    return keys[0] ?? null;
  }, [departuresByDate]);

  const anchorDate = selectedDate ?? firstAvailableDate;
  const anchor = anchorDate ? new Date(`${anchorDate}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(anchor.getFullYear());
  const [viewMonth, setViewMonth] = useState(anchor.getMonth());

  useEffect(() => {
    if (!isOpen) return;
    const target = selectedDate ?? firstAvailableDate;
    if (target) {
      const d = new Date(`${target}T00:00:00`);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [isOpen, selectedDate, firstAvailableDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sélection immédiate au clic (comme les grands sites de réservation) :
  // pas d'étape "Valider" dont l'oubli faisait perdre la sélection.
  const handleSelectDate = (dateKey: string) => {
    onSelectDate(dateKey);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`flex w-full items-center gap-3 rounded-full border bg-transparent px-5 py-3 text-left transition-colors hover:border-[var(--vert)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--or)] disabled:cursor-not-allowed disabled:opacity-40 ${
          isOpen ? "border-[var(--or)]" : "border-[var(--bordc)]"
        }`}
      >
        <CalendarDays size={16} className="shrink-0 text-[var(--vert)]" aria-hidden="true" />
        <span className={selectedDate ? "text-[var(--fg)]" : "text-[var(--mutedfg)]"}>
          {selectedDate ? formatShortDate(selectedDate) : label}
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute left-1/2 top-full z-30 mt-3 w-[330px] -translate-x-1/2 rounded-2xl border border-[var(--or)]/30 bg-white p-5 shadow-[0_18px_44px_rgba(22,33,26,.18)]"
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="font-[var(--data)] text-[10px] uppercase tracking-[0.3em] text-[var(--vert)]">
              {label}
            </p>
            <span className="text-[10px] text-[var(--mutedfg)]">1 vol / jour</span>
          </div>

          <FlightCalendar
            departuresByDate={departuresByDate}
            selectedDate={selectedDate}
            viewYear={viewYear}
            viewMonth={viewMonth}
            onViewChange={(y, m) => {
              setViewYear(y);
              setViewMonth(m);
            }}
            onSelectDate={handleSelectDate}
          />

          <p className="mt-3 border-t border-[var(--bordc)] pt-3 text-center text-[10px] text-[var(--mutedfg)]">
            Cliquez sur une date pour la sélectionner
          </p>
        </div>
      )}
    </div>
  );
}
