// Edge Function : envoie le billet DÉFINITIF (PDF) quand le staff valide le
// paiement (trigger BDD sur payment_status pending → paid). Protégée par un
// secret partagé avec le trigger — pas d'accès public utile.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { encodeBase64 } from "jsr:@std/encoding/base64";
import {
  buildTicketEmailHtml,
  generateTicketPdf,
  type TicketData,
  type TicketSegment,
} from "./ticket.ts";

const RESEND_FROM = "Air Comores <onboarding@resend.dev>";
// Valeur réelle définie dans la version déployée (et dans le trigger BDD) —
// jamais commitée : ce dépôt est public.
const SHARED_SECRET = "REMPLACER_PAR_LE_SECRET_DU_TRIGGER";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// deno-lint-ignore no-explicit-any
function toSegment(kind: "ALLER" | "RETOUR", dep: any): TicketSegment {
  const leg = dep.aircomores_flight_legs;
  return {
    kind,
    routeFrom: leg.route_from,
    routeTo: leg.route_to,
    departurePlace: leg.departure_place,
    departureCode: leg.departure_code,
    arrivalPlace: leg.arrival_place,
    arrivalCode: leg.arrival_code,
    departureDate: dep.departure_date,
    departureTime: leg.departure_time,
    durationMinutes: leg.duration_minutes,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);
  if (req.headers.get("x-aircomores-secret") !== SHARED_SECRET) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  let bookingId: string | undefined;
  try {
    ({ bookingId } = await req.json());
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }
  if (!bookingId) return jsonResponse({ error: "bookingId manquant" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const DEP_SELECT =
    "id, departure_date, aircomores_flight_legs(route_from, route_to, departure_place, departure_code, departure_time, arrival_place, arrival_code, duration_minutes, price_kmf)";

  const { data: booking, error } = await supabase
    .from("aircomores_bookings")
    .select(
      `reference, contact_full_name, contact_email, total_price_kmf, payment_method,
       outbound:aircomores_flight_departures!aircomores_bookings_departure_id_fkey(${DEP_SELECT}),
       retour:aircomores_flight_departures!aircomores_bookings_return_departure_id_fkey(${DEP_SELECT}),
       aircomores_passengers(full_name)`,
    )
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    console.error("booking_fetch_failed", error);
    return jsonResponse({ error: "booking_not_found" }, 404);
  }

  const segments: TicketSegment[] = [toSegment("ALLER", booking.outbound)];
  if (booking.retour) segments.push(toSegment("RETOUR", booking.retour));

  const ticket: TicketData = {
    reference: booking.reference,
    contactFullName: booking.contact_full_name,
    // deno-lint-ignore no-explicit-any
    passengerNames: (booking.aircomores_passengers as any[]).map((p) => p.full_name),
    segments,
    totalPriceKmf: booking.total_price_kmf,
    paymentMethod: booking.payment_method,
    paid: true,
  };

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return jsonResponse({ error: "resend_not_configured" }, 500);

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
        to: [booking.contact_email],
        subject: `Paiement confirmé — billet définitif ${booking.reference} · Air Comores`,
        html: buildTicketEmailHtml(ticket),
        attachments: [
          {
            filename: `billet-${booking.reference}.pdf`,
            content: encodeBase64(pdfBytes),
          },
        ],
      }),
    });
    if (!resendResponse.ok) {
      console.error("resend_send_failed", await resendResponse.text());
      return jsonResponse({ error: "email_failed" }, 502);
    }
  } catch (err) {
    console.error("resend_send_error", err);
    return jsonResponse({ error: "email_failed" }, 500);
  }

  return jsonResponse({ ok: true }, 200);
});
