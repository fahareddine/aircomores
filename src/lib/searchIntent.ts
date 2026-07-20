// Pont léger entre le ReservationBar (collé au hero) et la section #reservation.
// Le widget écrit une "intention de recherche" ; FlightPicker la consomme pour
// pré-sélectionner le vol. Store externe minimal (useSyncExternalStore).

export interface SearchIntent {
  version: number;
  origin: string;
  destination: string;
  tripType: "oneway" | "round";
  departureDate: string; // YYYY-MM-DD
  returnDate: string | null;
  passengers: number;
}

let current: SearchIntent | null = null;
const listeners = new Set<() => void>();

export function setSearchIntent(intent: Omit<SearchIntent, "version">): void {
  current = { ...intent, version: (current?.version ?? 0) + 1 };
  listeners.forEach((l) => l());
}

export function subscribeSearchIntent(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getSearchIntent(): SearchIntent | null {
  return current;
}
