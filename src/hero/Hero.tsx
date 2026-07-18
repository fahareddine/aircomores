import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { VOLS } from "../data/vols";
import FlightPath, { type FlightPathHandle } from "./FlightPath";
import "./hero.css";

const SCROLL_PER_CLIP = 150; // % de hauteur d'écran de scroll par clip (desktop)
const MOBILE_SCROLL_PER_CLIP = 100; // mobile : 1 geste de scroll ≈ 1 chapitre
const CROSSFADE = 0.06; // fondu entre clips (fraction d'un segment)
const LOADER_TIMEOUT_MS = 8000;

const MOBILE_QUERY = "(max-width: 767px), (pointer: coarse) and (hover: none)";

// Vols avec vidéos disponibles, dans l'ordre : c'est ce qui pilote le hero.
const ACTIVE_FLIGHTS = VOLS.filter((vol) => vol.active && vol.phases);
const CLIPS = ACTIVE_FLIGHTS.flatMap((vol) => vol.phases!);
const FROM_CODE = ACTIVE_FLIGHTS[0]?.departure.code ?? "";
const TO_CODE = ACTIVE_FLIGHTS[ACTIVE_FLIGHTS.length - 1]?.arrival.code ?? "";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const overlayRefs = useRef<Array<HTMLDivElement | null>>([]);
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const titleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const ruleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dataRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const flightPathRef = useRef<FlightPathHandle>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Variantes 720px all-intra (public/videos/mobile/) : seek instantané sur
  // téléphone, moitié moins lourdes. Choix figé au premier rendu.
  const [useMobileSources] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const videoSrc = (path: string) =>
    useMobileSources ? path.replace("/videos/", "/videos/mobile/") : path;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const videos = videoRefs.current;
    if (!section || videos.length !== CLIPS.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia(MOBILE_QUERY).matches;

    const ready = videos.map(
      (video) =>
        new Promise<void>((resolve) => {
          if (!video) return resolve();
          if (video.readyState >= 1) return resolve();
          video.addEventListener("loadedmetadata", () => resolve(), { once: true });
          video.addEventListener(
            "error",
            () => {
              console.error(`Vidéo introuvable : ${video.src}`);
              resolve();
            },
            { once: true },
          );
        }),
    );
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, LOADER_TIMEOUT_MS));

    let cancelled = false;
    let ctx: ReturnType<typeof gsap.context> | undefined;
    let tickerFn: (() => void) | undefined;

    Promise.race([Promise.all(ready), timeout]).then(() => {
      if (cancelled) return;
      setIsLoading(false);
      if (reduceMotion) return;

      ctx = gsap.context(() => {
        const n = CLIPS.length;

        const overlayParts = (i: number) => ({
          overlay: overlayRefs.current[i],
          rule: ruleRefs.current[i],
          parts: [labelRefs.current[i], titleRefs.current[i], dataRefs.current[i]],
        });

        // État initial des overlays (commun aux deux modes).
        CLIPS.forEach((_, i) => {
          const { overlay, rule, parts } = overlayParts(i);
          if (!overlay || !rule) return;
          gsap.set(overlay, { autoAlpha: 0 });
          gsap.set(parts, { yPercent: 110 });
          gsap.set(rule, { width: 0 });
        });

        if (isMobile) {
          // ── Mode chapitres (mobile) : un geste de scroll = une séquence
          // jouée en ENTIER (lecture native 60 fps, aucun seek). Le scroll
          // s'aimante sur chaque chapitre ; le texte entre au début de la
          // séquence et sort au chapitre suivant. ──
          let currentSeg = -1;
          // Texte affiché au DÉBUT de la séquence, retiré pendant l'action
          // (illisible sur image en mouvement), puis réaffiché à la FIN quand
          // la vidéo se fige sur sa dernière image.
          let hideCall: ReturnType<typeof gsap.delayedCall> | null = null;
          const OVERLAY_INTRO_S = 2.4;

          const showOverlay = (i: number) => {
            const { overlay, rule, parts } = overlayParts(i);
            if (!overlay || !rule) return;
            gsap.set(overlay, { autoAlpha: 1, y: 0 });
            gsap.to(parts, {
              yPercent: 0,
              duration: 0.55,
              ease: "power3.out",
              stagger: 0.08,
              delay: 0.15,
            });
            gsap.to(rule, { width: "6.5rem", duration: 0.5, ease: "power2.inOut", delay: 0.3 });
          };

          const hideOverlay = (i: number) => {
            const { overlay, rule, parts } = overlayParts(i);
            if (!overlay || !rule) return;
            gsap.to(overlay, {
              autoAlpha: 0,
              y: -20,
              duration: 0.25,
              ease: "power2.in",
              onComplete: () => {
                gsap.set(overlay, { y: 0 });
                gsap.set(parts, { yPercent: 110 });
                gsap.set(rule, { width: 0 });
              },
            });
          };

          const setSegment = (seg: number) => {
            if (seg === currentSeg) return;
            const prev = currentSeg;
            currentSeg = seg;
            hideCall?.kill();

            videos.forEach((video, i) => {
              if (!video) return;
              video.classList.toggle("is-front", i === seg);
              if (i === seg) {
                gsap.to(video, { opacity: 1, duration: 0.35, ease: "power1.out" });
                try {
                  video.currentTime = 0;
                } catch {
                  /* métadonnées pas encore prêtes */
                }
                video.play().catch(() => {});
              } else {
                gsap.to(video, { opacity: 0, duration: 0.35, ease: "power1.out" });
                video.pause();
              }
            });

            if (prev >= 0) hideOverlay(prev);
            showOverlay(seg);
            // Retrait du texte pendant l'action, sauf si la séquence est déjà finie.
            hideCall = gsap.delayedCall(OVERLAY_INTRO_S, () => {
              if (seg === currentSeg && !videos[seg]?.ended) hideOverlay(seg);
            });
          };

          // Fin de séquence : image figée → le texte revient, parfaitement lisible.
          videos.forEach((video, i) => {
            video?.addEventListener("ended", () => {
              if (i === currentSeg) showOverlay(i);
            });
          });

          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: `+=${n * MOBILE_SCROLL_PER_CLIP}%`,
            pin: true,
            anticipatePin: 1,
            // Aimantation au centre de chaque chapitre ; 0 et 1 restent
            // atteignables pour entrer/sortir de la section sans résistance.
            // Cadrage strict : quel que soit l'élan du geste, on n'avance que
            // d'UN chapitre à la fois, et on ne sort de la section que depuis
            // le dernier chapitre — l'aimant dépose alors pile au début de la
            // section suivante (jamais au milieu).
            snap: {
              snapTo: (value) => {
                const seg = Math.max(currentSeg, 0);
                if (value < 0.04 && seg <= 0) return 0;
                if (value > 0.96 && seg >= n - 1) return 1;
                const raw = Math.min(Math.floor(value * n), n - 1);
                const target = Math.max(seg - 1, Math.min(raw, seg + 1));
                return (target + 0.5) / n;
              },
              duration: { min: 0.3, max: 0.8 },
              ease: "power2.inOut",
              delay: 0.05,
            },
            onUpdate(self) {
              const p = Math.min(self.progress, 0.9999);
              const raw = Math.floor(p * n);
              // Même clamp que le snap : un chapitre à la fois, la séquence
              // en cours n'est jamais sautée.
              const target =
                currentSeg < 0 ? raw : Math.max(currentSeg - 1, Math.min(raw, currentSeg + 1));
              setSegment(target);
              flightPathRef.current?.update(p);
            },
          });

          setSegment(0);

          // Zone de transition (le hero glisse hors écran après le pin) :
          // aimant binaire — soit hero plein écran, soit la section suivante
          // pile à son sommet. Jamais d'arrêt au milieu.
          ScrollTrigger.create({
            trigger: section,
            start: "bottom bottom",
            end: "bottom top",
            snap: {
              snapTo: [0, 1],
              duration: { min: 0.3, max: 0.7 },
              ease: "power2.inOut",
              delay: 0.05,
            },
          });
        } else {
          // ── Desktop : scrub image par image, currentTime lissé en rAF. ──
          const targets = videos.map(() => 0);

          tickerFn = () => {
            videos.forEach((video, i) => {
              if (!video?.duration || video.seeking) return;
              const target = targets[i];
              if (Math.abs(video.currentTime - target) > 0.01) {
                video.currentTime += (target - video.currentTime) * 0.22;
              }
            });
          };
          gsap.ticker.add(tickerFn);

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: `+=${n * SCROLL_PER_CLIP}%`,
              scrub: 0.6,
              pin: true,
              anticipatePin: 1,
              onUpdate(self) {
                const p = Math.min(self.progress, 0.9999);
                const seg = Math.floor(p * n);
                const local = p * n - seg;

                videos.forEach((video, i) => {
                  if (!video) return;
                  video.classList.toggle("is-front", i === seg);
                  if (i === seg && video.duration) targets[i] = local * video.duration;
                  if (i === seg + 1) targets[i] = 0;
                });

                const next = videos[seg + 1];
                if (local > 1 - CROSSFADE && next) {
                  const f = (local - (1 - CROSSFADE)) / CROSSFADE;
                  next.classList.add("is-front");
                  next.style.opacity = String(f);
                  if (videos[seg]) videos[seg]!.style.opacity = String(1 - f);
                } else {
                  videos.forEach((video, i) => {
                    if (video) video.style.opacity = i === seg ? "1" : "0";
                  });
                }

                flightPathRef.current?.update(p);
              },
            },
          });

          CLIPS.forEach((_, i) => {
            const { overlay, rule, parts } = overlayParts(i);
            const [label, title, data] = parts;
            if (!overlay || !rule || !label || !title || !data) return;

            const IN = i + 0.06;
            const OUT = i + 0.8;

            tl.set(overlay, { autoAlpha: 1 }, IN)
              .to(label, { yPercent: 0, duration: 0.1, ease: "power3.out" }, IN)
              .to(title, { yPercent: 0, duration: 0.14, ease: "power3.out" }, IN + 0.03)
              .to(rule, { width: "6.5rem", duration: 0.12, ease: "power2.inOut" }, IN + 0.07)
              .to(data, { yPercent: 0, duration: 0.1, ease: "power3.out" }, IN + 0.09)
              .to(overlay, { autoAlpha: 0, y: -28, duration: 0.1, ease: "power2.in" }, OUT)
              .set(overlay, { y: 0 }, OUT + 0.11);
          });

          tl.set({}, {}, n);
        }
      }, section);
    });

    return () => {
      cancelled = true;
      if (tickerFn) gsap.ticker.remove(tickerFn);
      ctx?.revert();
    };
  }, []);

  return (
    <section className="hero" id="hero" ref={sectionRef}>
      <div className="hero__videos">
        {CLIPS.map((clip, i) => (
          <video
            key={clip.video}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={videoSrc(clip.video)}
            muted
            playsInline
            preload="auto"
            className={i === 0 ? "is-front" : undefined}
          />
        ))}
      </div>
      <div className="hero__scrim" />

      {CLIPS.map((clip, i) => (
        <div
          key={clip.video}
          className="ov"
          ref={(el) => {
            overlayRefs.current[i] = el;
          }}
        >
          <div className="line">
            <span
              className="ov__label"
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
            >
              {clip.label}
            </span>
          </div>
          <div className="line">
            <span
              className="ov__title"
              ref={(el) => {
                titleRefs.current[i] = el;
              }}
            >
              {clip.title}
            </span>
          </div>
          <div
            className="ov__rule"
            ref={(el) => {
              ruleRefs.current[i] = el;
            }}
          />
          <div className="line">
            <span
              className="ov__data"
              ref={(el) => {
                dataRefs.current[i] = el;
              }}
            >
              {clip.data.map(([key, value]) => (
                <span key={key}>
                  {key}&nbsp; <b>{value}</b>
                </span>
              ))}
            </span>
          </div>
        </div>
      ))}

      <FlightPath ref={flightPathRef} fromCode={FROM_CODE} toCode={TO_CODE} />

      <div className="hint">Faites défiler</div>
      <div className={`loader${isLoading ? "" : " is-done"}`}>Préparation du vol</div>
    </section>
  );
}
