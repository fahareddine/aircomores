type Props = {
  className?: string;
};

/** Croissant + 4 étoiles blanches sur rond vert — ancien drapeau comorien. */
export default function Logo({ className }: Props) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <circle cx="20" cy="20" r="19" fill="var(--vert)" />
      <path d="M24 8a12.5 12.5 0 1 0 0 24 10 10 0 1 1 0-24z" fill="var(--ivoire)" />
      <g fill="var(--ivoire)">
        <circle cx="25.5" cy="13" r="1.15" />
        <circle cx="25.5" cy="17.7" r="1.15" />
        <circle cx="25.5" cy="22.4" r="1.15" />
        <circle cx="25.5" cy="27.1" r="1.15" />
      </g>
    </svg>
  );
}
