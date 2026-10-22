"use client";

import FairyDustCursor from "./FairyDustCursor";

/** Site-wide sparkle trail, tinted to the portfolio's soft pinks. Mounted once in the root layout. */
export default function FairyDust() {
  return (
    <FairyDustCursor
      colors={["#f3bcd3", "#e8a0bf", "#c982a2"]}
      characterSet={["✨", "⭐", "🌟"]}
      particleSize={24}
      particleCount={2}
      gravity={0.015}
      fadeSpeed={0.97}
      initialVelocity={{ min: 0.7, max: 2.0 }}
    />
  );
}
