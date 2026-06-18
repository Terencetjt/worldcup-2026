"use client";
import { flagUrl } from "@/lib/teams";

interface Props {
  teamId: string;
  size: number;
  eliminated: boolean;
  supported: boolean;
}

// A static soccer-player figure whose kit is the country's flag.
export default function PlayerRacer({ teamId, size, eliminated, supported }: Props) {
  const flag = flagUrl(teamId);
  const clipId = `kit-${teamId}`;
  const w = size;
  const h = size * 1.4;

  // Shirt + sleeves outline — used both as the visible kit and as a clip for the flag.
  const shirt =
    "M10 16 L14 13 Q20 11 26 13 L30 16 L33 22 L28 25 L28 39 Q20 41 12 39 L12 25 L7 22 Z";

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 40 56"
      style={{ opacity: eliminated ? 0.45 : 1, filter: eliminated ? "grayscale(1)" : "none" }}
      role="img"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={shirt} />
        </clipPath>
      </defs>

      {supported && (
        <text x="20" y="3" textAnchor="middle" fontSize="6" fill="#FFD700">★</text>
      )}

      {/* Legs */}
      <rect x="15" y="40" width="4" height="11" rx="1.5" fill="#e8b88a" />
      <rect x="21" y="40" width="4" height="11" rx="1.5" fill="#e8b88a" />
      {/* Boots */}
      <rect x="13.5" y="50" width="6" height="2.6" rx="1" fill="#1a1a1a" />
      <rect x="20.5" y="50" width="6" height="2.6" rx="1" fill="#1a1a1a" />
      {/* Shorts */}
      <rect x="12" y="37" width="16" height="6.5" rx="1.5" fill="#222" />

      {/* Head */}
      <circle cx="20" cy="8" r="5.6" fill="#eeb98c" />
      {/* Hair */}
      <path d="M14.6 6.5 Q20 0.5 25.4 6.5 Q22 4 20 4 Q18 4 14.6 6.5 Z" fill="#3a2a1a" />

      {/* Kit = flag */}
      {flag ? (
        <image
          href={flag}
          x="6"
          y="11"
          width="28"
          height="30"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : (
        <path d={shirt} fill="#4A90D9" />
      )}
      {/* Shirt outline for definition */}
      <path d={shirt} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.8" />

      {/* Soccer ball at the feet */}
      <circle cx="30" cy="50" r="3" fill="#fff" stroke="#111" strokeWidth="0.5" />
      <path d="M30 47.5 L31.8 49 L31 51 L29 51 L28.2 49 Z" fill="#111" />

      {eliminated && (
        <text x="20" y="26" textAnchor="middle" fontSize="20" fill="#d11" fontWeight="bold">
          ✕
        </text>
      )}
    </svg>
  );
}
