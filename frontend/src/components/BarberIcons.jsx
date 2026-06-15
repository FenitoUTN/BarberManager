import { useId } from 'react';

/** Classic red/white barber pole, rendered with currentColor for the stripe color. */
export function BarberPoleIcon({ className }) {
  const patternId = useId();

  return (
    <svg viewBox="0 0 24 48" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id={patternId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#f5f5f5" />
          <rect width="4" height="8" fill="currentColor" />
        </pattern>
      </defs>
      <rect x="4" y="1" width="16" height="6" rx="2" fill="#1a1a1a" stroke="currentColor" strokeWidth="1" />
      <rect x="6" y="5" width="12" height="38" rx="6" fill={`url(#${patternId})`} stroke="#1a1a1a" strokeWidth="1" />
      <rect x="4" y="41" width="16" height="6" rx="2" fill="#1a1a1a" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="46" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** Flame glyph, filled with currentColor. */
export function FlameIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

/** Old-school straight razor, outlined with currentColor. */
export function RazorIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M3 21 11 13" />
      <path d="M11 13 20 4c.6-.6 1.6-.4 1.8.4.6 2.5-2.6 6.8-6.1 9.4L11 16" />
      <circle cx="11" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

/** Decorative section divider: a thin line with a flame at the center. */
export function FlameDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-700/60 to-gold-700/60" />
      <FlameIcon className="h-4 w-4 text-blood-500" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold-700/60 to-gold-700/60" />
    </div>
  );
}
