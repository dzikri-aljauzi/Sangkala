/** Dua lingkaran beririsan untuk kombinasi pilar (mis. People + Process). */
export function Venn({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 100" aria-hidden className={className}>
      <circle cx="62" cy="50" r="38" fill="none" stroke="#85babd" strokeWidth="1.5" />
      <circle cx="98" cy="50" r="38" fill="none" stroke="#e2cdb0" strokeWidth="1.5" />
      <path d="M80 16.4 A38 38 0 0 1 80 83.6 A38 38 0 0 1 80 16.4 Z" fill="#e2cdb0" fillOpacity="0.25" />
      <circle cx="80" cy="50" r="3" fill="#e2cdb0" />
    </svg>
  );
}
