/**
 * Glowing bronze mandala — concentric circles, tick rings, radial spokes,
 * and orbital arcs, echoing the astrological wheel in the reference art.
 * Rotates imperceptibly slowly (4 min/rev) for a living-background feel.
 */
export function RingBackdrop({ className = "" }: { className?: string }) {
  // Precompute tick marks (60 around the outer ring) and 12 spokes
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i * 6 * Math.PI) / 180;
    const long = i % 5 === 0;
    const r1 = long ? 262 : 268;
    const r2 = 276;
    return {
      x1: 300 + r1 * Math.cos(a),
      y1: 300 + r1 * Math.sin(a),
      x2: 300 + r2 * Math.cos(a),
      y2: 300 + r2 * Math.sin(a),
      o: long ? 0.35 : 0.18,
    };
  });
  const spokes = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return {
      x1: 300 + 96 * Math.cos(a),
      y1: 300 + 96 * Math.sin(a),
      x2: 300 + 236 * Math.cos(a),
      y2: 300 + 236 * Math.sin(a),
    };
  });

  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden="true"
      className={`animate-spinSlow ${className}`}
    >
      {/* soft glow filter */}
      <defs>
        <filter id="mandalaGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter="url(#mandalaGlow)" stroke="currentColor">
        {/* outer tick ring */}
        <circle cx="300" cy="300" r="278" strokeOpacity="0.22" strokeWidth="1" />
        {ticks.map((t, i) => (
          <line
            key={`t${i}`}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            strokeOpacity={t.o}
            strokeWidth="1"
          />
        ))}

        {/* mid rings */}
        <circle cx="300" cy="300" r="248" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="2 10" />
        <circle cx="300" cy="300" r="236" strokeOpacity="0.28" strokeWidth="1" />
        <circle cx="300" cy="300" r="180" strokeOpacity="0.12" strokeWidth="14" />
        <circle cx="300" cy="300" r="180" strokeOpacity="0.2" strokeWidth="1" />

        {/* radial spokes */}
        {spokes.map((s, i) => (
          <line
            key={`s${i}`}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            strokeOpacity="0.1"
            strokeWidth="1"
          />
        ))}

        {/* orbital arcs at offset angles */}
        <path
          d="M 300 90 A 210 210 0 0 1 486 200"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        <path
          d="M 130 390 A 196 196 0 0 0 300 496"
          strokeOpacity="0.3"
          strokeWidth="1.5"
        />
        <path
          d="M 155 190 A 176 176 0 0 1 300 124"
          strokeOpacity="0.22"
          strokeWidth="1"
        />

        {/* inner core rings */}
        <circle cx="300" cy="300" r="96" strokeOpacity="0.26" strokeWidth="1" />
        <circle cx="300" cy="300" r="60" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="1 7" />

        {/* orbital nodes */}
        <circle cx="486" cy="200" r="3.2" fill="currentColor" fillOpacity="0.5" stroke="none" />
        <circle cx="300" cy="90" r="2.4" fill="currentColor" fillOpacity="0.4" stroke="none" />
        <circle cx="130" cy="390" r="2.4" fill="currentColor" fillOpacity="0.35" stroke="none" />
      </g>
    </svg>
  );
}
