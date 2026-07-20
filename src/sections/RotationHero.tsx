import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { VOLS } from "../data/vols";
import ReservationBar from "./booking/ReservationBar";
import Booking from "./booking/Booking";

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
      className="relative bg-[var(--bleu)]"
    >
      {/* Littoral : bord supérieur en vague qui remonte sur le hero. Les crêtes
          teal montent dans la mer du hero, les creux le laissent transparaître. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[110px] w-full -translate-y-[70px]"
      >
        <defs>
          <linearGradient id="rh-wave-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#173a3b" />
            <stop offset="55%" stopColor="#173a3b" />
            <stop offset="100%" stopColor="#173a3b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,110 L1440,110 L1440,46 C 1180,86 1040,14 800,50 C 600,80 430,20 220,54 C 120,70 60,46 0,52 Z"
          fill="url(#rh-wave-fade)"
        />
      </svg>
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
      {/* Continuité de couleur : le haut reprend le vert-océan du hero puis
          glisse vers le bleu identitaire — les deux mers se rejoignent. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#173a3b] via-[#173a3b]/45 to-transparent"
      />
      {/* Voile bleu (identité Grande Comore), dense en bas pour la lisibilité. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bleu)]/25 to-[#1d4a85]/85"
      />
      {/* Protection du texte à gauche — même dégradé que le scrim du hero. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#06263f]/65 via-[#06263f]/15 to-transparent"
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

        {/* Moteur de réservation : pièce maîtresse du hero, posé sur le fond bleu. */}
        <div id="reservation" {...anim(360)} className={`relative z-30 mt-10 scroll-mt-28 ${anim(360).className}`}>
          <ReservationBar />
        </div>

        {/* Tunnel complet (vol → passagers → paiement → confirmation) dans le même
            bloc : n'apparaît qu'après une recherche. */}
        <div className="relative z-30">
          <Booking embedded />
        </div>

        <div {...anim(460)} className={`mt-5 flex justify-end ${anim(460).className}`}>
          <a
            href="#tarifs"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 underline-offset-4 transition-colors hover:text-[var(--jaune)] hover:underline"
          >
            Voir les horaires &amp; tarifs
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-3">
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
