import type { BookableDeparture } from "../../lib/booking";
import DateDropdown from "./DateDropdown";
import PassengerDropdown from "./PassengerDropdown";
import IslandDropdown from "./IslandDropdown";

type Props = {
  isRoundTrip: boolean;
  origins: string[];
  destinations: string[];
  selectedOrigin: string | null;
  selectedDestination: string | null;
  onSelectOrigin: (island: string) => void;
  onSelectDestination: (island: string) => void;
  departuresByDate: Map<string, BookableDeparture>;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
  returnDeparturesByDate: Map<string, BookableDeparture>;
  selectedReturnDate: string | null;
  onSelectReturnDate: (dateKey: string) => void;
  passengerCount: number;
  maxPassengers: number;
  onPassengerCountChange: (count: number) => void;
};

export default function SearchBar({
  isRoundTrip,
  origins,
  destinations,
  selectedOrigin,
  selectedDestination,
  onSelectOrigin,
  onSelectDestination,
  departuresByDate,
  selectedDate,
  onSelectDate,
  returnDeparturesByDate,
  selectedReturnDate,
  onSelectReturnDate,
  passengerCount,
  maxPassengers,
  onPassengerCountChange,
}: Props) {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-[0_10px_36px_rgba(22,33,26,.10)] lg:flex-row lg:items-center"
      style={{ borderRadius: "calc(var(--radius) * 1.4)" }}
    >
      <IslandDropdown
        placeholder="Départ"
        options={origins}
        selected={selectedOrigin}
        onSelect={onSelectOrigin}
      />

      <IslandDropdown
        placeholder="Arrivée"
        options={destinations}
        selected={selectedDestination}
        onSelect={onSelectDestination}
        disabled={!selectedOrigin}
      />

      <DateDropdown
        departuresByDate={departuresByDate}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        label="Aller"
      />

      {isRoundTrip && (
        <DateDropdown
          departuresByDate={returnDeparturesByDate}
          selectedDate={selectedReturnDate}
          onSelectDate={onSelectReturnDate}
          label="Retour"
          disabled={!selectedDate}
        />
      )}

      <PassengerDropdown
        count={passengerCount}
        max={maxPassengers}
        onChange={onPassengerCountChange}
      />
    </div>
  );
}
