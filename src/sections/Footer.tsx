import Logo from "../components/Logo";

const ISLAND_LINKS = [
  { label: "Ngazidja · HAH", href: "#destinations" },
  { label: "Ndzuwani · AJN", href: "#destinations" },
  { label: "Mwali · NWA", href: "#destinations" },
];

const SITE_LINKS = [
  { label: "Horaires & Tarifs", href: "#tarifs" },
  { label: "Nos services", href: "#services" },
  { label: "Réserver un vol", href: "#reservation" },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--vert-deep)]">
      <div className="lisere-comores h-1.5" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="rounded-full bg-white p-1">
                <Logo className="h-8 w-8" />
              </span>
              <span className="font-[var(--display)] text-xl font-semibold text-white">
                Air Comores
              </span>
            </div>
            <p className="mt-5 max-w-sm font-[var(--display)] text-2xl font-semibold italic leading-snug text-[var(--jaune)]">
              « Fiers de nos îles, heureux de vous y emmener. »
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              Réservations &amp; renseignements
              <br />
              contact@aircomores.example · +269 000 00 00
            </p>
          </div>

          <nav aria-label="Nos îles">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--jaune)]">
              Nos îles
            </p>
            <ul className="mt-4 space-y-2.5">
              {ISLAND_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/85 transition-colors hover:text-[var(--jaune)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Le site">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--jaune)]">
              Voyager
            </p>
            <ul className="mt-4 space-y-2.5">
              {SITE_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/85 transition-colors hover:text-[var(--jaune)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/15 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">
            © {new Date().getFullYear()} Air Comores — Karibu
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/60">
            Ngazidja · Ndzuwani · Mwali
          </p>
        </div>
      </div>
    </footer>
  );
}
