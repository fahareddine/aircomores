import { useEffect, useState } from "react";
import Reveal from "../../components/Reveal";
import SectionHeading from "../../components/SectionHeading";
import {
  BookingError,
  createBooking,
  fetchBookableDepartures,
  type BookableDeparture,
  type BookingConfirmation as Confirmation,
  type PaymentMethod,
} from "../../lib/booking";
import FlightPicker from "./FlightPicker";
import BookingForm from "./BookingForm";
import PaymentStep from "./PaymentStep";
import BookingConfirmation from "./BookingConfirmation";

type Step = "flight" | "details" | "payment" | "done";
type ContactInfo = { fullName: string; email: string; phone: string };

const EMPTY_CONTACT: ContactInfo = { fullName: "", email: "", phone: "" };

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: "flight", label: "Vol" },
  { key: "details", label: "Passagers" },
  { key: "payment", label: "Paiement" },
  { key: "done", label: "Confirmation" },
];

export default function Booking() {
  const [departures, setDepartures] = useState<BookableDeparture[]>([]);
  const [isLoadingDepartures, setIsLoadingDepartures] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("flight");
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [contact, setContact] = useState<ContactInfo>(EMPTY_CONTACT);
  const [passengerNames, setPassengerNames] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const loadDepartures = () => {
    setIsLoadingDepartures(true);
    fetchBookableDepartures()
      .then(setDepartures)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "erreur inconnue"))
      .finally(() => setIsLoadingDepartures(false));
  };

  useEffect(loadDepartures, []);

  const selectedDeparture = departures.find((d) => d.id === selectedId) ?? null;
  const selectedReturn = departures.find((d) => d.id === selectedReturnId) ?? null;

  const totalPriceKmf =
    ((selectedDeparture?.leg.priceKmf ?? 0) +
      (isRoundTrip ? (selectedReturn?.leg.priceKmf ?? 0) : 0)) *
    passengerCount;

  const handleSubmit = async () => {
    if (!selectedDeparture || !paymentMethod) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await createBooking({
        departureId: selectedDeparture.id,
        returnDepartureId: isRoundTrip ? selectedReturn?.id : null,
        contactFullName: contact.fullName,
        contactEmail: contact.email,
        contactPhone: contact.phone,
        passengerNames: passengerNames.slice(0, passengerCount),
        paymentMethod,
      });
      setConfirmation(result);
      setStep("done");
    } catch (err) {
      setSubmitError(err instanceof BookingError ? err.code : "booking_failed");
      // Les places ont pu changer entre-temps : on resynchronise.
      fetchBookableDepartures().then(setDepartures).catch(() => {});
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForNewBooking = () => {
    setStep("flight");
    setIsRoundTrip(false);
    setSelectedId(null);
    setSelectedReturnId(null);
    setPassengerCount(1);
    setContact(EMPTY_CONTACT);
    setPassengerNames([]);
    setPaymentMethod(null);
    setConfirmation(null);
    setSubmitError(null);
    loadDepartures();
  };

  const currentStepIndex = STEP_LABELS.findIndex((s) => s.key === step);

  return (
    <section id="reservation" className="px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading kicker="Réservation" title="Je réserve mon vol" />
        </Reveal>

        <Reveal delay={0.05}>
          <ol className="mt-8 flex items-center gap-2" aria-label="Étapes de réservation">
            {STEP_LABELS.map((s, i) => (
              <li key={s.key} className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    i < currentStepIndex
                      ? "bg-[var(--vert)] text-white"
                      : i === currentStepIndex
                        ? "bg-[var(--jaune)] text-[var(--fg)]"
                        : "bg-[var(--muted)] text-[var(--mutedfg)]"
                  }`}
                  aria-current={i === currentStepIndex ? "step" : undefined}
                >
                  {i + 1}
                </span>
                <span
                  className={`hidden text-sm sm:inline ${
                    i === currentStepIndex
                      ? "font-semibold text-[var(--fg)]"
                      : "text-[var(--mutedfg)]"
                  }`}
                >
                  {s.label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <span aria-hidden="true" className="h-px w-6 bg-[var(--bordc)]" />
                )}
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8">
            {step === "flight" && (
              <FlightPicker
                departures={departures}
                isLoading={isLoadingDepartures}
                error={loadError}
                selectedId={selectedId}
                selectedReturnId={selectedReturnId}
                isRoundTrip={isRoundTrip}
                passengerCount={passengerCount}
                onSelect={setSelectedId}
                onSelectReturn={setSelectedReturnId}
                onRoundTripChange={setIsRoundTrip}
                onPassengerCountChange={setPassengerCount}
                onNext={() => setStep("details")}
              />
            )}

            {step === "details" && selectedDeparture && (
              <BookingForm
                departure={selectedDeparture}
                returnDeparture={isRoundTrip ? selectedReturn : null}
                passengerCount={passengerCount}
                contact={contact}
                passengerNames={passengerNames}
                onContactChange={setContact}
                onPassengerNamesChange={setPassengerNames}
                onBack={() => setStep("flight")}
                onNext={() => setStep("payment")}
              />
            )}

            {step === "payment" && (
              <PaymentStep
                selected={paymentMethod}
                totalPriceKmf={totalPriceKmf}
                isSubmitting={isSubmitting}
                submitError={submitError}
                onSelect={setPaymentMethod}
                onBack={() => setStep("details")}
                onSubmit={handleSubmit}
              />
            )}

            {step === "done" && confirmation && (
              <BookingConfirmation confirmation={confirmation} onNewBooking={resetForNewBooking} />
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
