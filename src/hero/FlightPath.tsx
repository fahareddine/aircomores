import { useEffect, useImperativeHandle, useRef, type Ref } from "react";

export type FlightPathHandle = {
  update: (progress: number) => void;
};

type Props = {
  fromCode: string;
  toCode: string;
  ref?: Ref<FlightPathHandle>;
};

/** Trajectoire SVG : arc de vol qui se dore au scroll, avion qui progresse dessus. */
export default function FlightPath({ fromCode, toCode, ref }: Props) {
  const arcRef = useRef<SVGPathElement>(null);
  const arcDoneRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const dotEndRef = useRef<SVGCircleElement>(null);
  const arcLength = useRef(0);

  useEffect(() => {
    const arc = arcRef.current;
    const arcDone = arcDoneRef.current;
    if (!arc || !arcDone) return;

    const length = arc.getTotalLength();
    arcLength.current = length;
    arcDone.style.strokeDasharray = String(length);
    arcDone.style.strokeDashoffset = String(length);
  }, []);

  useImperativeHandle(ref, () => ({
    update(progress: number) {
      const arc = arcRef.current;
      const arcDone = arcDoneRef.current;
      const plane = planeRef.current;
      const dotEnd = dotEndRef.current;
      const length = arcLength.current;
      if (!arc || !arcDone || !plane || !dotEnd || !length) return;

      const pt = arc.getPointAtLength(length * progress);
      const ahead = arc.getPointAtLength(Math.min(length, length * progress + 2));
      const angle = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;

      plane.setAttribute("transform", `translate(${pt.x},${pt.y}) rotate(${angle})`);
      arcDone.style.strokeDashoffset = String(length * (1 - progress));
      dotEnd.setAttribute("fill", progress > 0.98 ? "var(--or)" : "rgba(244,240,230,.5)");
    },
  }));

  return (
    <div className="path" aria-hidden="true">
      <svg viewBox="0 0 420 78">
        <path ref={arcRef} className="arc" d="M14 62 Q 210 -14 406 62" />
        <path ref={arcDoneRef} className="arc-done" d="M14 62 Q 210 -14 406 62" />
        <circle cx="14" cy="62" r="3" fill="var(--or)" />
        <circle ref={dotEndRef} cx="406" cy="62" r="3" fill="rgba(244,240,230,.5)" />
        <text x="14" y="76" textAnchor="middle">
          {fromCode}
        </text>
        <text x="406" y="76" textAnchor="middle">
          {toCode}
        </text>
        <g ref={planeRef}>
          <path
            className="plane"
            d="M0-5 L1.4-1.4 5.6 0 1.4 1.4 0 5 -1 1.2 -4 .4 -4 -.4 -1 -1.2 Z"
            transform="rotate(90)"
          />
        </g>
      </svg>
    </div>
  );
}
