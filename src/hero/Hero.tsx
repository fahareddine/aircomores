import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { VOLS } from "../data/vols";
import FlightPath, { type FlightPathHandle } from "./FlightPath";
import "./hero.css";

const SCROLL_PER_CLIP = 150; // % de hauteur d'écran de scroll par clip
const CROSSFADE = 0.06; // fondu entre clips (fraction d'un segment)
const LOADER_TIMEOUT_MS = 8000;

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

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const videos = videoRefs.current;
    if (!section || videos.length !== CLIPS.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
        const targets = videos.map(() => 0);

        tickerFn = () => {
          videos.forEach((video, i) => {
            if (!video?.duration) return;
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
          const overlay = overlayRefs.current[i];
          const label = labelRefs.current[i];
          const title = titleRefs.current[i];
          const rule = ruleRefs.current[i];
          const data = dataRefs.current[i];
          if (!overlay || !label || !title || !rule || !data) return;

          gsap.set(overlay, { autoAlpha: 0 });
          gsap.set([label, title, data], { yPercent: 110 });
          gsap.set(rule, { width: 0 });

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
            src={clip.video}
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
