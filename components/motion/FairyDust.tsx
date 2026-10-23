"use client";

import { useTheme } from "@/lib/theme";
import FairyDustCursor from "./FairyDustCursor";

/* Soft pinks on cream; on charcoal the same family, a shade quieter so the trail never glows. */
const COLORS = {
  light: ["#f3bcd3", "#e8a0bf", "#c982a2"],
  dark: ["#e3a7c1", "#d18fae", "#b07b96"],
};

/** Site-wide sparkle trail, tinted to the portfolio's soft pinks. Mounted once in the root layout. */
export default function FairyDust() {
  const theme = useTheme();
  return (
    <FairyDustCursor
      colors={COLORS[theme]}
      characterSet={["✨", "⭐", "🌟"]}
      particleSize={24}
      particleCount={2}
      gravity={0.015}
      fadeSpeed={0.97}
      initialVelocity={{ min: 0.7, max: 2.0 }}
    />
  );
}
