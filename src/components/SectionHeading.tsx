type Props = {
  kicker: string;
  title: string;
  /** Sur fond vert (héro, footer) : kicker jaune, titre blanc. */
  onGreen?: boolean;
};

/** En-tête de section Wajibu : tiret + étiquette letterspaced, titre Fraunces. */
export default function SectionHeading({ kicker, title, onGreen }: Props) {
  return (
    <div>
      <p
        className={`mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] ${
          onGreen ? "text-[var(--jaune)]" : "text-[var(--vert)]"
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-px w-8 ${onGreen ? "bg-[var(--jaune)]" : "bg-[var(--jaune)]"}`}
        />
        {kicker}
      </p>
      <h2
        className={`max-w-2xl font-[var(--display)] text-4xl font-semibold leading-[1.08] md:text-5xl ${
          onGreen ? "text-white" : "text-[var(--fg)]"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
