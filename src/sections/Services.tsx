import { CalendarClock, Car, HeartHandshake, Package } from "lucide-react";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";

const SERVICES = [
  {
    icon: CalendarClock,
    title: "Vol à la demande",
    description: "Votre horaire, votre île : nous affrétons un vol quand vous en avez besoin.",
  },
  {
    icon: Car,
    title: "Navette privée aéroport",
    description: "Prise en charge à votre porte, dépose au pied de l'avion, à chaque étape.",
  },
  {
    icon: HeartHandshake,
    title: "Assistance dédiée",
    description: "Accompagnement attentif des personnes à mobilité réduite, enfants et aînés.",
  },
  {
    icon: Package,
    title: "Fret & colis express",
    description: "Vos colis livrés d'île en île dans la journée, suivis de bout en bout.",
  },
];

export default function Services() {
  return (
    <section id="services" className="pattern-bg px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading kicker="Nos services" title="Pris en charge de A à Z" />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.title} delay={i * 0.1}>
                <article
                  className="depth-soft group h-full rounded-2xl bg-white p-7 transition-transform duration-300 hover:-translate-y-1"
                  style={{ borderRadius: "calc(var(--radius) * 1.4)" }}
                >
                  <span className="inline-flex rounded-xl bg-[var(--muted)] p-3 text-[var(--vert)] transition-colors group-hover:bg-[var(--jaune)]/25">
                    <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-[var(--display)] text-xl font-semibold text-[var(--fg)]">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--mutedfg)]">
                    {service.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
