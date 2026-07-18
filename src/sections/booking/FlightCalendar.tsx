import { ChevronLeft, ChevronRight } from "lucide-react";
import type { BookableDeparture } from "../../lib/booking";

const WEEKDAY_LABELS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
const MONTH_LABELS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

type Props = {
  departuresByDate: Map<string, BookableDeparture>;
  selectedDate: string | null;
  viewYear: number;
  viewMonth: number;
  onViewChange: (year: number, month: number) => void;
  onSelectDate: (dateKey: string) => void;
};

/** Clé YYYY-MM-DD en heure locale — évite le décalage de toISOString() (UTC). */
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMonthWeeks(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // semaine commence lundi
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function FlightCalendar({
  departuresByDate,
  selectedDate,
  viewYear,
  viewMonth,
  onViewChange,
  onSelectDate,
}: Props) {
  const today = new Date();
  const todayKey = toDateKey(today);
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const weeks = getMonthWeeks(viewYear, viewMonth);

  const goToPrevMonth = () => {
    if (isCurrentMonth) return;
    const prev = new Date(viewYear, viewMonth - 1, 1);
    onViewChange(prev.getFullYear(), prev.getMonth());
  };

  const goToNextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    onViewChange(next.getFullYear(), next.getMonth());
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={isCurrentMonth}
          aria-label="Mois précédent"
          className="rounded-full p-1.5 text-[var(--mutedfg)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--fg)] disabled:opacity-20 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="font-[var(--data)] text-sm uppercase tracking-[0.2em] text-[var(--fg)]">
          {MONTH_LABELS[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Mois suivant"
          className="rounded-full p-1.5 text-[var(--mutedfg)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--fg)]"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="py-1 font-[var(--data)] text-[10px] uppercase tracking-wider text-[var(--vert)]/70"
          >
            {label}
          </span>
        ))}

        {weeks.flatMap((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const key = `${weekIndex}-${dayIndex}`;
            if (!date) return <span key={key} />;

            const dateKey = toDateKey(date);
            const departure = departuresByDate.get(dateKey);
            const isBookable = Boolean(departure);
            const isSelected = dateKey === selectedDate;
            const isToday = dateKey === todayKey;

            return (
              <button
                key={key}
                type="button"
                disabled={!isBookable}
                onClick={() => onSelectDate(dateKey)}
                aria-current={isSelected ? "date" : undefined}
                aria-label={
                  departure
                    ? `${date.getDate()} — ${departure.leg.priceKmf.toLocaleString("fr-FR")} KMF, ${departure.seatsAvailable} places`
                    : undefined
                }
                className={`relative flex flex-col items-center justify-center rounded-xl py-1.5 transition-all duration-150 ${
                  isSelected
                    ? "depth-3d bg-[var(--jaune)] text-[var(--fg)]"
                    : isBookable
                      ? "text-[var(--fg)] hover:bg-[var(--jaune)]/20 hover:shadow-[inset_0_0_0_1.5px_var(--jaune)]"
                      : "text-[var(--bordc)]"
                }`}
              >
                <span className={`text-sm leading-tight ${isToday && !isSelected ? "font-semibold text-[var(--vert)]" : ""}`}>
                  {date.getDate()}
                </span>
                {departure && (
                  <span
                    className={`font-[var(--data)] text-[8px] leading-tight ${
                      isSelected ? "text-[var(--fg)]/70" : "text-[var(--vert)]/80"
                    }`}
                  >
                    {(departure.leg.priceKmf / 1000).toFixed(0)}k
                  </span>
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
