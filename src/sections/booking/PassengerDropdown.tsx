import { useEffect, useRef, useState } from "react";
import { Users } from "lucide-react";

type Props = {
  count: number;
  max: number;
  onChange: (count: number) => void;
};

export default function PassengerDropdown({ count, max, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`flex w-full items-center gap-3 rounded-full border bg-transparent px-5 py-3 text-left transition-colors hover:border-[var(--vert)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--or)] ${
          isOpen ? "border-[var(--or)]" : "border-[var(--bordc)]"
        }`}
      >
        <Users size={16} className="shrink-0 text-[var(--vert)]" aria-hidden="true" />
        <span className="text-[var(--fg)]">
          {count} passager{count > 1 ? "s" : ""}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-[var(--bordc)] bg-white p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--fg)]">Passagers</p>
              <p className="text-xs text-[var(--mutedfg)]">{max} place{max > 1 ? "s" : ""} disponible{max > 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onChange(Math.max(1, count - 1))}
                disabled={count <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--bordc)] text-[var(--fg)] transition-colors hover:border-[var(--bordc)] disabled:opacity-30"
              >
                −
              </button>
              <span className="w-4 text-center text-[var(--fg)]">{count}</span>
              <button
                type="button"
                onClick={() => onChange(Math.min(max, count + 1))}
                disabled={count >= max}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--bordc)] text-[var(--fg)] transition-colors hover:border-[var(--bordc)] disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
