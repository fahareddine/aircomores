import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

/**
 * Reveal — apparition au scroll, SANS scrub.
 *
 * Difference cle avec le Hero :
 *   - le Hero utilise `scrub`  -> le scroll PILOTE l'animation (aller-retour)
 *   - Reveal n'utilise PAS scrub -> le scroll DECLENCHE l'animation (elle se joue seule)
 *
 * `toggleActions: "play none none reverse"` = joue a l'entree, rejoue a l'envers en remontant.
 */
export default function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        autoAlpha: 0,
        y: 48,
        duration: 0.9,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    }, el);

    return () => ctx.revert();
  }, [delay]);

  return <div ref={ref}>{children}</div>;
}
