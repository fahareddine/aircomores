import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Plane } from "lucide-react";
import type { BookableDeparture } from "../../lib/booking";
import SearchBar from "./SearchBar";

type Props = {
  departures: BookableDeparture[];
  isLoading: boolean;
  error: string | null;
  selectedId: string | null;
  selectedReturnId: string | null;
  isRoundTrip: boolean;
  passengerCount: number;
  onSelect: (id: string | null) => void;
  onSelectReturn: (id: string | null) => void;
  onRoundTripChange: (roundTrip: boolean) => void;
  onPassengerCountChange: (count: number) => void;
  onNext: () => void;
};

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function SegmentRow({
  kind,
  departure,
}: {
  kind: string;
  departure: BookableDeparture;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--vert)]">
          {kind} · {formatDate(departure.departureDate)}
        </p>
        <p className="mt-1 font-[var(--display)] text-xl font-semibold text-[var(--fg)]">
          {departure.leg.departureCode}
          <Plane
            size={14}
            className="mx-2 inline rotate-45 text-[var(--jaune-text)]"
            aria-hidden="true"
          />
          {departure.leg.arrivalCode}
        </p>
        <p className="text-xs text-[var(--mutedfg)]">
          {departure.leg.routeFrom} vers {departure.leg.routeTo}
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-[var(--fg)]">{departure.leg.departureTime}</p>
        <p className="text-xs text-[var(--mutedfg)]">{departure.leg.durationMinutes} min</p>
        <p className="text-xs text-[var(--mutedfg)]">
          {departure.seatsAvailable} place{departure.seatsAvailable > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

export default function FlightPicker({
  departures,
  isLoading,
  error,
  selectedId,
  selectedReturnId,
  isRoundTrip,
  passengerCount,
  onSelect,
  onSelectReturn,
  onRoundTripChange,
  onPassengerCountChange,
  onNext,
}: Props) {
  // Réseau à 3 îles : chaque île dessert les 2 autres, un vol/jour/liaison.
  const origins = useMemo(
    () => Array.from(new Set(departures.map((d) => d.leg.routeFrom))).sort(),
    [departures],
  );

  const [selectedOrigin, setSelectedOrigin] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedOrigin && origins.length > 0) setSelectedOrigin(origins[0]);
  }, [origins, selectedOrigin]);

  const destinations = useMemo(
    () =>
      Array.from(
        new Set(
          departures.filter((d) => d.leg.routeFrom === selectedOrigin).map((d) => d.leg.routeTo),
        ),
      ).sort(),
    [departures, selectedOrigin],
  );

  useEffect(() => {
    if (destinations.length === 0) return;
    if (!selectedDestination || !destinations.includes(selectedDestination)) {
      setSelectedDestination(destinations[0]);
    }
  }, [destinations, selectedDestination]);

  const selected = departures.find((d) => d.id === selectedId) ?? null;
  const selectedReturn = departures.find((d) => d.id === selectedReturnId) ?? null;

  const departuresByDate = useMemo(() => {
    const map = new Map<string, BookableDeparture>();
    departures
      .filter((d) => d.leg.routeFrom === selectedOrigin && d.leg.routeTo === selectedDestination)
      .forEach((d) => map.set(d.departureDate, d));
    return map;
  }, [departures, selectedOrigin, selectedDestination]);

  // Retour = liaison inverse, à partir de la date de l'aller.
  const returnDeparturesByDate = useMemo(() => {
    const map = new Map<string, BookableDeparture>();
    if (!selected) return map;
    departures
      .filter(
        (d) =>
          d.leg.routeFrom === selectedDestination &&
          d.leg.routeTo === selectedOrigin &&
          d.departureDate >= selected.departureDate,
      )
      .forEach((d) => map.set(d.departureDate, d));
    return map;
  }, [departures, selectedOrigin, selectedDestination, selected]);

  const maxPassengers = Math.min(
    selected?.seatsAvailable ?? 8,
    selectedReturn?.seatsAvailable ?? 8,
  );

  const resetSelection = () => {
    onSelect(null);
    onSelectReturn(null);
  };

  const handleSelectOrigin = (island: string) => {
    setSelectedOrigin(island);
    resetSelection();
  };

  const handleSelectDestination = (island: string) => {
    setSelectedDestination(island);
    resetSelection();
  };

  useEffect(() => {
    if (passengerCount > maxPassengers) onPassengerCountChange(maxPassengers);
  }, [maxPassengers, passengerCount, onPassengerCountChange]);

  const handleSelectDate = (dateKey: string) => {
    const departure = departuresByDate.get(dateKey);
    if (departure) {
      onSelect(departure.id);
      onSelectReturn(null); // le retour doit être >= au nouvel aller
    }
  };

  const handleSelectReturnDate = (dateKey: string) => {
    const departure = returnDeparturesByDate.get(dateKey);
    if (departure) onSelectReturn(departure.id);
  };

  const isComplete = Boolean(selected) && (!isRoundTrip || Boolean(selectedReturn));
  const totalPriceKmf =
    ((selected?.leg.priceKmf ?? 0) + (isRoundTrip ? (selectedReturn?.leg.priceKmf ?? 0) : 0)) *
    passengerCount;

  if (isLoading) {
    return <p className="text-sm text-[var(--mutedfg)]">Chargement des vols disponibles…</p>;
  }
  if (error) {
    return <p className="text-sm text-[var(--rouge)]">Impossible de charger les vols : {error}</p>;
  }
  if (departures.length === 0) {
    return (
      <p className="text-sm text-[var(--mutedfg)]">
        Aucun vol disponible pour le moment. Contactez-nous directement pour réserver.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-5 inline-flex rounded-full border border-[var(--bordc)] bg-white p-1">
        <button
          type="button"
          onClick={() => {
            onRoundTripChange(false);
            onSelectReturn(null);
          }}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            !isRoundTrip
              ? "depth-3d bg-[var(--vert)] text-white"
              : "text-[var(--mutedfg)] hover:text-[var(--vert)]"
          }`}
        >
          Aller simple
        </button>
        <button
          type="button"
          onClick={() => onRoundTripChange(true)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            isRoundTrip
              ? "depth-3d bg-[var(--vert)] text-white"
              : "text-[var(--mutedfg)] hover:text-[var(--vert)]"
          }`}
        >
          Aller-retour
        </button>
      </div>

      <SearchBar
        isRoundTrip={isRoundTrip}
        origins={origins}
        destinations={destinations}
        selectedOrigin={selectedOrigin}
        selectedDestination={selectedDestination}
        onSelectOrigin={handleSelectOrigin}
        onSelectDestination={handleSelectDestination}
        departuresByDate={departuresByDate}
        selectedDate={selected?.departureDate ?? null}
        onSelectDate={handleSelectDate}
        returnDeparturesByDate={returnDeparturesByDate}
        selectedReturnDate={selectedReturn?.departureDate ?? null}
        onSelectReturnDate={handleSelectReturnDate}
        passengerCount={passengerCount}
        maxPassengers={maxPassengers}
        onPassengerCountChange={onPassengerCountChange}
      />

      {selected ? (
        <div
          className="mt-8 overflow-hidden rounded-2xl border border-[var(--or)]/60 bg-white shadow-[0_10px_36px_rgba(22,33,26,.10)]"
          style={{ borderRadius: "calc(var(--radius) * 1.4)" }}
        >
          <div className="flex items-center justify-between border-b border-dashed border-[var(--or)]/60 bg-[var(--jaune)]/10 px-6 py-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--vert)]">
              Votre voyage
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--mutedfg)]">
              {isRoundTrip ? "Aller-retour" : "Aller simple"} · {passengerCount} passager
              {passengerCount > 1 ? "s" : ""}
            </span>
          </div>

          <SegmentRow kind="Aller" departure={selected} />
          {isRoundTrip &&
            (selectedReturn ? (
              <div className="border-t border-[var(--bordc)]">
                <SegmentRow kind="Retour" departure={selectedReturn} />
              </div>
            ) : (
              <p className="border-t border-[var(--bordc)] px-6 py-4 text-sm text-[var(--jaune-text)]">
                Choisissez votre date de retour pour continuer.
              </p>
            ))}

          <div className="flex items-center justify-between border-t border-[var(--bordc)] bg-[var(--creme)] px-6 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--mutedfg)]">Total</p>
              <p className="font-[var(--display)] text-xl font-semibold text-[var(--vert)]">
                {totalPriceKmf.toLocaleString("fr-FR")} KMF
              </p>
            </div>
            <button
              type="button"
              disabled={!isComplete}
              onClick={onNext}
              className="depth-3d group flex items-center gap-2 rounded-full bg-[var(--vert)] px-7 py-3 font-semibold text-white transition-colors hover:bg-[var(--vert-deep)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuer
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-[var(--mutedfg)]">
          Sélectionnez une date pour voir votre vol.
        </p>
      )}
    </div>
  );
}
