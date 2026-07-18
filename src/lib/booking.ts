import { supabase } from "./supabase";

export interface BookableDeparture {
  id: string;
  departureDate: string;
  seatsAvailable: number;
  leg: {
    code: string;
    routeFrom: string;
    routeTo: string;
    departurePlace: string;
    departureCode: string;
    departureTime: string;
    arrivalPlace: string;
    arrivalCode: string;
    durationMinutes: number;
    priceKmf: number;
  };
}

interface DepartureRow {
  id: string;
  departure_date: string;
  seats_available: number;
  aircomores_flight_legs: {
    code: string;
    route_from: string;
    route_to: string;
    departure_place: string;
    departure_code: string;
    departure_time: string;
    arrival_place: string;
    arrival_code: string;
    duration_minutes: number;
    price_kmf: number;
  };
}

export interface FlightLegInfo {
  code: string;
  routeFrom: string;
  routeTo: string;
  departurePlace: string;
  departureCode: string;
  departureTime: string;
  arrivalPlace: string;
  arrivalCode: string;
  durationMinutes: number;
  priceKmf: number;
}

/** Liaisons actives, pour le tableau Horaires & Tarifs. */
export async function fetchFlightLegs(): Promise<FlightLegInfo[]> {
  const { data, error } = await supabase
    .from("aircomores_flight_legs")
    .select(
      "code, route_from, route_to, departure_place, departure_code, departure_time, arrival_place, arrival_code, duration_minutes, price_kmf",
    )
    .eq("active", true)
    .order("departure_time", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    code: row.code,
    routeFrom: row.route_from,
    routeTo: row.route_to,
    departurePlace: row.departure_place,
    departureCode: row.departure_code,
    departureTime: row.departure_time,
    arrivalPlace: row.arrival_place,
    arrivalCode: row.arrival_code,
    durationMinutes: row.duration_minutes,
    priceKmf: row.price_kmf,
  }));
}

/** Date du jour en heure locale (YYYY-MM-DD) — toISOString() serait en UTC
 * et décalerait d'un jour selon l'heure aux Comores (UTC+3). */
function todayLocalKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function fetchBookableDepartures(): Promise<BookableDeparture[]> {
  const { data, error } = await supabase
    .from("aircomores_flight_departures")
    .select(
      "id, departure_date, seats_available, aircomores_flight_legs!inner(code, route_from, route_to, departure_place, departure_code, departure_time, arrival_place, arrival_code, duration_minutes, price_kmf, active)",
    )
    .eq("status", "scheduled")
    .eq("aircomores_flight_legs.active", true)
    .gt("seats_available", 0)
    .gte("departure_date", todayLocalKey())
    .order("departure_date", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as unknown as DepartureRow[]).map((row) => ({
    id: row.id,
    departureDate: row.departure_date,
    seatsAvailable: row.seats_available,
    leg: {
      code: row.aircomores_flight_legs.code,
      routeFrom: row.aircomores_flight_legs.route_from,
      routeTo: row.aircomores_flight_legs.route_to,
      departurePlace: row.aircomores_flight_legs.departure_place,
      departureCode: row.aircomores_flight_legs.departure_code,
      departureTime: row.aircomores_flight_legs.departure_time,
      arrivalPlace: row.aircomores_flight_legs.arrival_place,
      arrivalCode: row.aircomores_flight_legs.arrival_code,
      durationMinutes: row.aircomores_flight_legs.duration_minutes,
      priceKmf: row.aircomores_flight_legs.price_kmf,
    },
  }));
}

export type PaymentMethod = "virement" | "mobile_money" | "cash_agence";

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  virement: "Virement bancaire",
  mobile_money: "Mobile money",
  cash_agence: "Paiement à l'agence",
};

export interface CreateBookingPayload {
  departureId: string;
  returnDepartureId?: string | null;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  passengerNames: string[];
  paymentMethod: PaymentMethod;
}

export interface BookingSegment {
  kind: "ALLER" | "RETOUR";
  routeFrom: string;
  routeTo: string;
  departurePlace: string;
  departureCode: string;
  arrivalPlace: string;
  arrivalCode: string;
  departureDate: string;
  departureTime: string;
  durationMinutes: number;
}

export interface BookingConfirmation {
  reference: string;
  bookingId: string;
  emailSent: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid";
  segments: BookingSegment[];
  passengerNames: string[];
  totalPriceKmf: number;
}

export class BookingError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<BookingConfirmation> {
  const { data, error } = await supabase.functions.invoke("create-booking", {
    body: payload,
  });

  if (error) {
    const code = (data as { error?: string } | null)?.error ?? "booking_failed";
    throw new BookingError(code);
  }

  return data as BookingConfirmation;
}
