import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";

type Props = {
  placeholder: string;
  options: string[];
  selected: string | null;
  onSelect: (island: string) => void;
  disabled?: boolean;
};

export default function IslandDropdown({ placeholder, options, selected, onSelect, disabled }: Props) {
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
        disabled={disabled}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex w-full items-center gap-3 rounded-full border bg-transparent px-5 py-3 text-left transition-colors hover:border-[var(--vert)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--or)] disabled:cursor-not-allowed disabled:opacity-40 ${
          isOpen ? "border-[var(--or)]" : "border-[var(--bordc)]"
        }`}
      >
        <MapPin size={16} className="shrink-0 text-[var(--vert)]" aria-hidden="true" />
        <span className={selected ? "text-[var(--fg)]" : "text-[var(--mutedfg)]"}>
          {selected ?? placeholder}
        </span>
        {!disabled && (
          <ChevronDown size={14} className="ml-auto shrink-0 text-[var(--mutedfg)]" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div className="animate-pop-in absolute left-0 top-full z-20 mt-2 w-56 rounded-2xl border border-[var(--bordc)] bg-white p-2 shadow-2xl">
          {options.map((island) => (
            <button
              key={island}
              type="button"
              onClick={() => {
                onSelect(island);
                setIsOpen(false);
              }}
              className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors ${
                island === selected
                  ? "bg-[var(--or)]/10 text-[var(--vert)]"
                  : "text-[var(--fg)] hover:bg-[var(--muted)]"
              }`}
            >
              {island}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
