"use client";

import { useState } from "react";
import type { TechnologyItem } from "@/components/about/aboutData";

type TechIconProps = {
  tech: TechnologyItem;
  size?: number;
  className?: string;
  fallbackClassName?: string;
};

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
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
