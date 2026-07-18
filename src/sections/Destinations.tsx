import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";

const ISLANDS = [
  {
    name: "Ngazidja",
    frenchName: "Grande Comore",
    code: "HAH",
    description:
      "Le Karthala veille sur Moroni : marchés parfumés, coulées de lave noire et couchers de soleil sur la médina.",
    gradient:
      "radial-gradient(120% 100% at 20% 0%, rgba(0,149,67,.75), transparent 60%), linear-gradient(160deg, #0b7a3b 0%, #075c2c 100%)",
  },
  {
    name: "Ndzuwani",
    frenchName: "Anjouan",
    code: "AJN",
    description:
      "L'île aux parfums, couverte d'ylang-ylang et de girofliers, où chaque vallée descend vers une plage secrète.",
    gradient:
      "radial-gradient(120% 100% at 80% 0%, rgba(255,198,30,.5), transparent 55%), linear-gradient(200deg, #0b7a3b 0%, #075c2c 100%)",
  },
  {
    name: "Mwali",
    frenchName: "Mohéli",
    code: "NWA",
    description:
      "La plus sauvage : le parc marin de Nioumachoua, ses tortues, ses baleines et ses îlots déserts à l'ancre.",
    gradient:
      "radial-gradient(120% 100% at 50% 0%, rgba(47,111,191,.55), transparent 60%), linear-gradient(180deg, #0b7a3b 0%, #075c2c 100%)",
  },
];

export default function Destinations() {
  return (
    <section id="destinations" className="pattern-bg px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading kicker="Nos destinations" title="Trois îles, trois caractères" />
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ISLANDS.map((island, i) => (
            <Reveal key={island.code} delay={i * 0.12}>
              <article
                className="group relative flex h-80 flex-col justify-end overflow-hidden rounded-[var(--radius)] p-7 shadow-[0_10px_30px_rgba(7,40,22,.18)] transition-transform duration-300 hover:-translate-y-1"
                style={{ background: island.gradient, borderRadius: "calc(var(--radius) * 1.4)" }}
              >
                <span className="absolute right-5 top-5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                  {island.code}
                </span>

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--jaune)]">
                  {island.frenchName}
                </p>
                <h3 className="mt-1 font-[var(--display)] text-3xl font-semibold text-white">
                  {island.name}
                </h3>
                <span className="mt-3 block h-px w-10 bg-[var(--jaune)] transition-all duration-500 group-hover:w-20" />
                <p className="mt-3 text-sm leading-relaxed text-white/90">{island.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
