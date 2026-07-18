import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { VOLS } from "../data/vols";

const ISLAND_COUNT = new Set(VOLS.flatMap((vol) => [vol.route.from, vol.route.to])).size;
const TOTAL_MINUTES = VOLS.reduce((sum, vol) => sum + parseInt(vol.duration, 10), 0);

const STATS = [
  {
    title: "Chaque jour",
    description: "un vol sur chaque liaison, dans les deux sens — sans exception.",
  },
  {
    title: `${ISLAND_COUNT} îles reliées`,
    description: "Ngazidja, Ndzuwani, Mwali : tout l'archipel à portée de matinée.",
  },
  {
    title: `${TOTAL_MINUTES} minutes`,
    description: "de vol pour boucler la rotation complète de l'archipel.",
  },
];

/** Héro « rotation » au style Wajibu : fond vert du drapeau (vidéo voilée),
 * titre Fraunces avec accent italique jaune, rangée de cartes bordées. */
export default function RotationHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const anim = (delay: number) =>
    isVisible ? { className: "animate-fade-up", style: { animationDelay: `${delay}ms` } } : { className: "opacity-0", style: {} };

  return (
    <section
      ref={sectionRef}
      aria-label="Une seule rotation pour les trois îles"
      className="relative overflow-hidden bg-[var(--bleu)]"
    >
      <video
        aria-hidden="true"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      >
        <source src="/videos/02-envol-anjouan.mp4" type="video/mp4" />
      </video>
      {/* Voile bleu (Grande Comore) volontairement léger au centre pour
          laisser l'avion visible ; plus dense en bas pour la lisibilité. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[var(--bleu)]/45 via-[var(--bleu)]/20 to-[#1d4a85]/70"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 sm:px-8 md:py-32">
        <p
          {...anim(0)}
          className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--jaune)] ${anim(0).className}`}
        >
          <span aria-hidden="true" className="h-px w-8 bg-[var(--jaune)]" />
          Rotation de l'archipel · Comores
        </p>

        <h2
          {...anim(120)}
          className={`mt-6 max-w-3xl font-[var(--display)] text-5xl font-semibold leading-[1.05] text-white md:text-6xl ${anim(120).className}`}
        >
          Trois îles,{" "}
          <em className="font-semibold italic text-[var(--jaune)]">une seule rotation</em>.
        </h2>

        <p
          {...anim(240)}
          className={`mt-6 max-w-xl text-lg leading-relaxed text-white/90 ${anim(240).className}`}
        >
          Décollage, escale, atterrissage : chaque jour, nos vols relient Ngazidja, Ndzuwani
          et Mwali à horaires fixes. Réservation en ligne, confirmation immédiate, accueil
          chaleureux — karibu.
        </p>

        <div {...anim(360)} className={`mt-9 flex flex-wrap gap-4 ${anim(360).className}`}>
          <a
            href="#reservation"
            className="depth-3d group inline-flex items-center gap-2 rounded-full bg-[var(--jaune)] px-7 py-3.5 font-semibold text-[var(--fg)] transition-colors hover:bg-[var(--jaune-light)]"
          >
            Réserver mon vol
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#tarifs"
            className="inline-flex items-center rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Voir les horaires
          </a>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <div
              key={stat.title}
              {...anim(480 + i * 120)}
              className={`bg-[#1d4a85]/60 p-6 backdrop-blur-sm ${anim(480 + i * 120).className}`}
            >
              <h3 className="font-[var(--display)] text-2xl font-semibold text-[var(--jaune)]">
                {stat.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/85">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
