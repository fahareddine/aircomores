// Edge Function : crée une réservation Air Comores (aller simple ou
// aller-retour), avec mode de paiement, décompte atomique des places via la
// fonction SQL aircomores_create_booking, puis email de confirmation avec
// e-ticket PDF en pièce jointe (billet provisoire tant que non payé).
import { createClient } from "jsr:@supabase/supabase-js@2";
import { encodeBase64 } from "jsr:@std/encoding/base64";
import {
  buildTicketEmailHtml,
  generateTicketPdf,
  type TicketData,
  type TicketSegment,
} from "./ticket.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESEND_FROM = "Air Comores <onboarding@resend.dev>";
const PAYMENT_METHODS = ["virement", "mobile_money", "cash_agence"];

interface BookingRequest {
  departureId: string;
  returnDepartureId?: string | null;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  passengerNames: string[];
  paymentMethod: "virement" | "mobile_money" | "cash_agence";
}

interface DepartureRecord {
  id: string;
  departure_date: string;
  status: string;
  leg: {
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

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function validate(body: Partial<BookingRequest>): string | null {
  if (!body.departureId || typeof body.departureId !== "string") return "departureId manquant";
  if (!body.contactFullName?.trim()) return "Nom du contact manquant";
  if (!body.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contactEmail)) {
    return "Email invalide";
  }
  if (!body.contactPhone?.trim()) return "Téléphone manquant";
  if (!Array.isArray(body.passengerNames) || body.passengerNames.length === 0) {
    return "Au moins un passager requis";
  }
  if (body.passengerNames.some((name) => !name?.trim())) {
    return "Chaque passager doit avoir un nom";
  }
  if (!body.paymentMethod || !PAYMENT_METHODS.includes(body.paymentMethod)) {
    return "Mode de paiement invalide";
  }
  return null;
}

// deno-lint-ignore no-explicit-any
function toDeparture(row: any): DepartureRecord {
  return {
    id: row.id,
    departure_date: row.departure_date,
    status: row.status,
    leg: row.aircomores_flight_legs,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  let body: Partial<BookingRequest>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  const validationError = validate(body);
  if (validationError) return jsonResponse({ error: validationError }, 400);
  const payload = body as BookingRequest;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const SELECT =
    "id, departure_date, status, aircomores_flight_legs(route_from, route_to, departure_place, departure_code, departure_time, arrival_place, arrival_code, duration_minutes, price_kmf)";

  const { data: outRow, error: outError } = await supabase
    .from("aircomores_flight_departures")
    .select(SELECT)
    .eq("id", payload.departureId)
    .single();
  if (outError || !outRow) return jsonResponse({ error: "departure_not_found" }, 404);
  const outbound = toDeparture(outRow);

  let returnDep: DepartureRecord | null = null;
  if (payload.returnDepartureId) {
    const { data: retRow, error: retError } = await supabase
      .from("aircomores_flight_departures")
      .select(SELECT)
      .eq("id", payload.returnDepartureId)
      .single();
    if (retError || !retRow) return jsonResponse({ error: "departure_not_found" }, 404);
    returnDep = toDeparture(retRow);

    if (
      returnDep.leg.route_from !== outbound.leg.route_to ||
      returnDep.leg.route_to !== outbound.leg.route_from
    ) {
      return jsonResponse({ error: "invalid_return_route" }, 400);
    }
    if (returnDep.departure_date < outbound.departure_date) {
      return jsonResponse({ error: "return_before_outbound" }, 400);
    }
  }

  const passengerCount = payload.passengerNames.length;
  const totalPriceKmf =
    (outbound.leg.price_kmf + (returnDep?.leg.price_kmf ?? 0)) * passengerCount;

  const { data: bookingRows, error: bookingError } = await supabase.rpc(
    "aircomores_create_booking",
    {
      p_departure_id: payload.departureId,
      p_return_departure_id: payload.returnDepartureId ?? null,
      p_contact_full_name: payload.contactFullName,
      p_contact_email: payload.contactEmail,
      p_contact_phone: payload.contactPhone,
      p_total_price_kmf: totalPriceKmf,
      p_passenger_names: payload.passengerNames,
      p_payment_method: payload.paymentMethod,
    },
  );

  if (bookingError) {
    const message = bookingError.message ?? "";
    if (message.includes("not_enough_seats")) return jsonResponse({ error: "not_enough_seats" }, 409);
    if (message.includes("departure_not_found")) return jsonResponse({ error: "departure_not_found" }, 404);
    console.error("booking_rpc_failed", bookingError);
    return jsonResponse({ error: "booking_failed" }, 500);
  }

  const booking = bookingRows?.[0];
  if (!booking) return jsonResponse({ error: "booking_failed" }, 500);

  const segments: TicketSegment[] = [
    {
      kind: "ALLER",
      routeFrom: outbound.leg.route_from,
      routeTo: outbound.leg.route_to,
      departurePlace: outbound.leg.departure_place,
      departureCode: outbound.leg.departure_code,
      arrivalPlace: outbound.leg.arrival_place,
      arrivalCode: outbound.leg.arrival_code,
      departureDate: outbound.departure_date,
      departureTime: outbound.leg.departure_time,
      durationMinutes: outbound.leg.duration_minutes,
    },
  ];
  if (returnDep) {
    segments.push({
      kind: "RETOUR",
      routeFrom: returnDep.leg.route_from,
      routeTo: returnDep.leg.route_to,
      departurePlace: returnDep.leg.departure_place,
      departureCode: returnDep.leg.departure_code,
      arrivalPlace: returnDep.leg.arrival_place,
      arrivalCode: returnDep.leg.arrival_code,
      departureDate: returnDep.departure_date,
      departureTime: returnDep.leg.departure_time,
      durationMinutes: returnDep.leg.duration_minutes,
    });
  }

  const ticket: TicketData = {
    reference: booking.reference,
    contactFullName: payload.contactFullName,
    passengerNames: payload.passengerNames,
    segments,
    totalPriceKmf,
    paymentMethod: payload.paymentMethod,
    paid: false,
  };

  let emailSent = false;
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (resendKey) {
    try {
      const pdfBytes = await generateTicketPdf(ticket);
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: [payload.contactEmail],
          subject: `Réservation ${booking.reference} — confirmez votre vol Air Comores`,
          html: buildTicketEmailHtml(ticket),
          attachments: [
            {
              filename: `reservation-${booking.reference}.pdf`,
              content: encodeBase64(pdfBytes),
            },
          ],
        }),
      });
      emailSent = resendResponse.ok;
      if (!resendResponse.ok) console.error("resend_send_failed", await resendResponse.text());
    } catch (err) {
      console.error("resend_send_error", err);
    }
  }

  return jsonResponse(
    {
      reference: booking.reference,
      bookingId: booking.booking_id,
      emailSent,
      paymentMethod: payload.paymentMethod,
      paymentStatus: "pending",
      segments,
      passengerNames: payload.passengerNames,
      totalPriceKmf,
    },
    200,
  );
});
