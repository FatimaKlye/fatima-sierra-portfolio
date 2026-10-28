"use client";

import { useId } from "react";
import type { CategoryId } from "@/lib/musicLibrary";

/*
 * Little drawn sleeves for the jukebox, one motif per crate, all in the site's pinks, burgundy and
 * cream. Drawing them means no album artwork to license.
 */

type Palette = [bg: string, mid: string, ink: string];

const PALETTES: Record<CategoryId, Palette> = {
  pop: ["#ffd9e7", "#f39ac0", "#a63d68"],
  indie: ["#fff1e2", "#f6c2d4", "#b04a72"],
  rnb: ["#3a1627", "#8f3c60", "#f6dde7"],
  citypop: ["#ffe6d4", "#ef8fae", "#6d2443"],
  dance: ["#2a1c24", "#db82a8", "#fff1e2"],
  funk: ["#7b2c4d", "#e8a0bf", "#fff4e8"],
};

function Motif({ category, ink, mid, variant }: { category: CategoryId; ink: string; mid: string; variant: number }) {
  switch (category) {
    case "pop": // a burst of sparkles
      return (
        <g fill={ink}>
          <path d="M50 18c2 14 8 20 22 22-14 2-20 8-22 22-2-14-8-20-22-22 14-2 20-8 22-22Z" />
          <path d="M76 62c1 7 4 10 11 11-7 1-10 4-11 11-1-7-4-10-11-11 7-1 10-4 11-11Z" fill={mid} />
          <circle cx="24" cy="74" r={4 + variant} fill={mid} />
        </g>
      );
    case "indie": // a daisy
      return (
        <g transform={`rotate(${variant * 18} 50 50)`}>
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx="50" cy="30" rx="8" ry="15" fill="#fff" stroke={mid} strokeWidth="2" transform={`rotate(${i * 45} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="11" fill={ink} />
        </g>
      );
    case "rnb": // crescent moon and a star
      return (
        <g fill={ink}>
          <path d="M60 22a28 28 0 1 0 18 46A24 24 0 1 1 60 22Z" />
          <circle cx={74 - variant * 4} cy="30" r="3" fill={mid} />
          <circle cx="30" cy="24" r="2" />
        </g>
      );
    case "citypop": // striped sunset over the water
      return (
        <g>
          <circle cx="50" cy="58" r="26" fill={mid} />
          {[52, 60, 68, 76].map((y, i) => (
            <rect key={y} x="18" y={y} width="64" height={2 + i} fill={PALETTES.citypop[0]} />
          ))}
          <rect x="0" y="78" width="100" height="22" fill={ink} />
          <path d={`M${20 + variant * 6} 88h18M${56 - variant * 4} 92h22`} stroke={mid} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "dance": // zigzag bolt over a grid
      return (
        <g>
          {[20, 40, 60, 80].map((x) => (
            <path key={x} d={`M${x} 0v100M0 ${x}h100`} stroke={mid} strokeOpacity="0.25" strokeWidth="1" />
          ))}
          <path d="M56 14 30 54h18l-6 32 28-44H52l4-28Z" fill={mid} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      );
    default: // funk: a disco ball
      return (
        <g>
          <path d="M50 8v14" stroke={ink} strokeWidth="2" />
          <circle cx="50" cy="52" r="28" fill={mid} />
          <g stroke={PALETTES.funk[0]} strokeOpacity="0.55" strokeWidth="1.4" fill="none">
            <ellipse cx="50" cy="52" rx="28" ry="10" />
            <ellipse cx="50" cy="52" rx="28" ry="20" />
            <ellipse cx="50" cy="52" rx="10" ry="28" />
            <ellipse cx="50" cy="52" rx="20" ry="28" />
            <path d="M22 52h56M50 24v56" />
          </g>
          <path d={`M${70 + variant} 30l3 6 6 3-6 3-3 6-3-6-6-3 6-3Z`} fill={ink} />
        </g>
      );
  }
}

type Props = {
  category: CategoryId;
  /** Varies the motif a little between tracks in the same crate. */
  seed?: number;
  className?: string;
};

export default function TrackArt({ category, seed = 0, className }: Props) {
  const id = useId();
  const [bg, mid, ink] = PALETTES[category];
  const variant = seed % 3;
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`${id}-bg`} cx="30%" cy="25%" r="90%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.55" stopColor={bg} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={bg} />
      <Motif category={category} ink={ink} mid={mid} variant={variant} />
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
    </svg>
  );
}
