import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const LINKS = [
  { label: "Destinations", href: "#destinations" },
  { label: "Horaires & Tarifs", href: "#tarifs" },
  { label: "Services", href: "#services" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="lisere-comores h-1.5" aria-hidden="true" />
      <nav className="border-b border-[var(--bordc)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 sm:px-8">
          <a href="#" className="flex items-center gap-2.5">
            <Logo className="h-9 w-9" />
            <span className="font-[var(--display)] text-xl font-semibold text-[var(--fg)]">
              Air Comores
            </span>
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-[var(--mutedfg)] transition-colors hover:text-[var(--vert)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#reservation"
            className="depth-3d hidden rounded-full bg-[var(--vert)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--vert-deep)] md:inline-block"
          >
            Réserver un vol
          </a>

          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className="text-[var(--fg)] md:hidden"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {open && (
          <ul className="border-t border-[var(--bordc)] bg-white px-6 py-3 md:hidden">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-medium text-[var(--fg)] transition-colors hover:text-[var(--vert)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="py-3">
              <a
                href="#reservation"
                onClick={() => setOpen(false)}
                className="depth-3d inline-block rounded-full bg-[var(--vert)] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Réserver un vol
              </a>
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
