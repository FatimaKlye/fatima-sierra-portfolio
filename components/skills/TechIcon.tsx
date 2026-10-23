"use client";

import { useState } from "react";
import type { TechnologyItem } from "@/components/about/aboutData";

type TechIconProps = {
  tech: TechnologyItem;
  size?: number;
  className?: string;
  fallbackClassName?: string;
};

/* Logos drawn in a single black ink (all Simple Icons, plus a few Devicons) are lightened in dark mode. */
const MONO_ICON = /simple-icons|\/(nextjs|github)\//;

/** Technology logo from the icon CDN; falls back to its two-letter mark if the file fails to load. */
export default function TechIcon({ tech, size = 28, className, fallbackClassName }: TechIconProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={fallbackClassName} aria-hidden="true">
        {tech.mark}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote SVG logos; next/image adds nothing for vectors
    <img
      className={className}
      src={tech.icon}
      data-mono-icon={MONO_ICON.test(tech.icon) ? "" : undefined}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
