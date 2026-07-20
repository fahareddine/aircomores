import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Plane, Tag } from "lucide-react";
import {
  fetchBookableDepartures,
  type BookableDeparture,
} from "../../lib/booking";
import { setSearchIntent } from "../../lib/searchIntent";
import IslandDropdown from "./IslandDropdown";
import DateDropdown from "./DateDropdown";
import PassengerDropdown from "./PassengerDropdown";

type TripType = "round" | "oneway";

function scrollToFlow() {
  const target = document.getElementById("reservation-flow");
  if (!target) return;
  if (window.__lenis) window.__lenis.scrollTo(target, { offset: -90 });
  else target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function ReservationBar() {
  const [departures, setDepartures] = useState<BookableDeparture[]>([]);

  const [tripType, setTripType] = useState<TripType>("round");
  const [origin, setOrigin] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [returnDate, setReturnDate] = useState<string | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [promo, setPromo] = useState("");
  const [swapSpin, setSwapSpin] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchBookableDepartures()
      .then((data) => active && setDepartures(data))
      .catch(() => active && setDepartures([]));
    return () => {
      active = false;
    };
  }, []);

  // Réseau symétrique : chaque île dessert les autres, un vol/jour/liaison.
  const origins = useMemo(
    () => Array.from(new Set(departures.map((d) => d.leg.routeFrom))).sort(),
    [departures],
  );

  const destinations = useMemo(
    () =>
      Array.from(
        new Set(departures.filter((d) => d.leg.routeFrom === origin).map((d) => d.leg.routeTo)),
      ).sort(),
    [departures, origin],
  );

  const departuresByDate = useMemo(() => {
    const map = new Map<string, BookableDeparture>();
    departures
      .filter((d) => d.leg.routeFrom === origin && d.leg.routeTo === destination)
      .forEach((d) => map.set(d.departureDate, d));
    return map;
  }, [departures, origin, destination]);

  const returnDeparturesByDate = useMemo(() => {
    const map = new Map<string, BookableDeparture>();
    if (!date) return map;
    departures
      .filter(
        (d) =>
          d.leg.routeFrom === destination &&
          d.leg.routeTo === origin &&
          d.departureDate >= date,
      )
      .forEach((d) => map.set(d.departureDate, d));
    return map;
  }, [departures, origin, destination, date]);

  // Valeurs par défaut quand les données arrivent.
  useEffect(() => {
    if (!origin && origins.length > 0) setOrigin(origins[0]);
  }, [origins, origin]);

  useEffect(() => {
    if (destinations.length === 0) return;
    if (!destination || !destinations.includes(destination)) setDestination(destinations[0]);
  }, [destinations, destination]);

  const maxPassengers = Math.min(
    date ? (departuresByDate.get(date)?.seatsAvailable ?? 8) : 8,
    tripType === "round" && returnDate
      ? (returnDeparturesByDate.get(returnDate)?.seatsAvailable ?? 8)
      : 8,
  );

  useEffect(() => {
    if (passengers > maxPassengers) setPassengers(Math.max(1, maxPassengers));
  }, [maxPassengers, passengers]);

  const handleSelectOrigin = (island: string) => {
    setOrigin(island);
    setDate(null);
    setReturnDate(null);
  };

  const handleSelectDestination = (island: string) => {
    setDestination(island);
    setDate(null);
    setReturnDate(null);
  };

  const handleSwap = () => {
    if (!origin || !destination) return;
    const from = origin;
    const to = destination;
    setOrigin(to);
    setDestination(from);
    setDate(null);
    setReturnDate(null);
    setSwapSpin((s) => s + 180);
  };

  const handleSelectDate = (dateKey: string) => {
    setDate(dateKey);
    setReturnDate(null);
  };

  const handleSearch = () => {
    if (!origin || !destination) return setError("Choisissez un trajet.");
    if (!date) return setError("Choisissez une date de départ.");
    if (tripType === "round" && !returnDate) return setError("Choisissez une date de retour.");
    setError(null);
    setSearchIntent({
      origin,
      destination,
      tripType,
      departureDate: date,
      returnDate: tripType === "round" ? returnDate : null,
      passengers,
    });
    // Le panneau du tunnel se monte au prochain rendu : on défile ensuite.
    setTimeout(scrollToFlow, 90);
  };

  return (
    <div
      className="w-full rounded-[calc(var(--radius)*1.6)] border border-white/50 bg-white/95 backdrop-blur-md"
      style={{ boxShadow: "0 30px 70px -15px rgba(3,25,50,.55)" }}
    >
      <div
        className="lisere-comores h-1 w-full rounded-t-[calc(var(--radius)*1.6)]"
        aria-hidden="true"
      />

      <div className="p-4 md:p-6">
            {/* En-tête : titre + bascule aller-retour / aller simple */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-[var(--display)] text-lg font-semibold text-[var(--vert)]">
                Réserver mon vol
              </h2>
              <div className="inline-flex rounded-full border border-[var(--bordc)] bg-[var(--creme)] p-1">
                {(
                  [
                    ["round", "Aller-retour"],
                    ["oneway", "Aller simple"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setTripType(value);
                      if (value === "oneway") setReturnDate(null);
                    }}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                      tripType === value
                        ? "depth-3d bg-[var(--vert)] text-white"
                        : "text-[var(--mutedfg)] hover:text-[var(--vert)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trajet + dates + passagers */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <IslandDropdown
                placeholder="Départ"
                options={origins}
                selected={origin}
                onSelect={handleSelectOrigin}
              />

              <button
                type="button"
                onClick={handleSwap}
                aria-label="Inverser départ et arrivée"
                className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--bordc)] bg-white text-[var(--vert)] transition-colors hover:border-[var(--vert)] hover:bg-[var(--muted)]"
              >
                <ArrowLeftRight
                  size={16}
                  className="transition-transform duration-300"
                  style={{ transform: `rotate(${swapSpin}deg)` }}
                />
              </button>

              <IslandDropdown
                placeholder="Arrivée"
                options={destinations}
                selected={destination}
                onSelect={handleSelectDestination}
                disabled={!origin}
              />

              <DateDropdown
                departuresByDate={departuresByDate}
                selectedDate={date}
                onSelectDate={handleSelectDate}
                label="Aller"
              />

              {tripType === "round" && (
                <DateDropdown
                  departuresByDate={returnDeparturesByDate}
                  selectedDate={returnDate}
                  onSelectDate={setReturnDate}
                  label="Retour"
                  disabled={!date}
                />
              )}

              <PassengerDropdown
                count={passengers}
                max={maxPassengers}
                onChange={setPassengers}
              />
            </div>

            {/* Code promo + recherche */}
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-full border border-[var(--bordc)] bg-transparent px-5 py-3 sm:w-56">
                <Tag size={16} className="shrink-0 text-[var(--vert)]" aria-hidden="true" />
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Code promo"
                  className="w-full bg-transparent text-sm text-[var(--fg)] placeholder:text-[var(--mutedfg)] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="depth-3d group ml-auto flex items-center justify-center gap-2 rounded-full bg-[var(--vert)] px-8 py-3 font-semibold text-white transition-colors hover:bg-[var(--vert-deep)]"
              >
                Rechercher
                <Plane
                  size={16}
                  className="rotate-45 transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>

            {error && (
              <p className="mt-3 text-sm text-[var(--rouge)]" role="alert">
                {error}
              </p>
            )}
      </div>
    </div>
  );
}
