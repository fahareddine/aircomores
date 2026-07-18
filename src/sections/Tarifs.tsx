import { useEffect, useState } from "react";
import { MoveRight } from "lucide-react";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { fetchFlightLegs, type FlightLegInfo } from "../lib/booking";

export default function Tarifs() {
  const [legs, setLegs] = useState<FlightLegInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlightLegs()
      .then(setLegs)
      .catch((err) => setError(err instanceof Error ? err.message : "erreur inconnue"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="tarifs" className="px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading kicker="Horaires & tarifs" title="Un vol par jour, sur chaque liaison" />
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="mt-12 overflow-x-auto rounded-2xl bg-white shadow-[0_10px_36px_rgba(22,33,26,.10)]"
            style={{ borderRadius: "calc(var(--radius) * 1.4)" }}
          >
            {isLoading ? (
              <p className="p-8 text-sm text-[var(--mutedfg)]">Chargement des horaires…</p>
            ) : error ? (
              <p className="p-8 text-sm text-[var(--rouge)]">Horaires momentanément indisponibles.</p>
            ) : (
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-[var(--muted)] bg-[var(--muted)]">
                    {["Liaison", "Départ", "Arrivée", "Durée", "À partir de"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--vert)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {legs.map((leg) => (
                    <tr
                      key={leg.code}
                      className="group border-b border-[var(--bordc)] transition-colors last:border-0 hover:bg-[var(--muted)]/60"
                    >
                      <td className="px-6 py-5">
                        <span className="flex items-center gap-2 font-semibold text-[var(--fg)]">
                          {leg.routeFrom}
                          <MoveRight
                            size={14}
                            className="text-[var(--vert)] transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                          {leg.routeTo}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-[var(--fg)]">{leg.departureTime}</p>
                        <p className="text-xs text-[var(--mutedfg)]">
                          {leg.departurePlace} · {leg.departureCode}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-[var(--mutedfg)]">
                          {leg.arrivalPlace} · {leg.arrivalCode}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-[var(--mutedfg)]">
                        {leg.durationMinutes} min
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-[var(--display)] text-lg font-semibold text-[var(--vert)]">
                          {leg.priceKmf.toLocaleString("fr-FR")} KMF
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-4 text-sm text-[var(--mutedfg)]">
            Vols quotidiens. Tarif aller simple par passager, règlement à l'aéroport.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
