"use client";

import { useEffect } from "react";
import gsap from "gsap";

/**
 * Desktop-only pointer details for /skills, wired by delegation so content
 * that re-renders (the stack readout) keeps working:
 *
 *  data-magnetic       element leans a little toward the pointer
 *  data-depth-scope    container whose [data-depth="n"] children drift with the pointer
 *
 * Project previews are drawn in place (stack thumbnails, practice showcases),
 * never as a layer that follows the pointer over the content.
 * Skipped entirely on touch screens and for reduced-motion visitors.
 */
export default function SkillsPointer() {
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!query.matches) return;

    let magnet: HTMLElement | null = null;

    const releaseMagnet = () => {
      if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
      magnet = null;
    };

    const scopes = Array.from(document.querySelectorAll<HTMLElement>("[data-depth-scope]")).map((scope) => ({
      scope,
      layers: Array.from(scope.querySelectorAll<HTMLElement>("[data-depth]")).map((layer) => ({
        depth: Number(layer.dataset.depth) || 1,
        x: gsap.quickTo(layer, "x", { duration: 0.9, ease: "power3.out" }),
        y: gsap.quickTo(layer, "y", { duration: 0.9, ease: "power3.out" }),
      })),
    }));

    const onMove = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;

      const nextMagnet = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (nextMagnet !== magnet) releaseMagnet();
      if (nextMagnet) {
        magnet = nextMagnet;
        const rect = nextMagnet.getBoundingClientRect();
        gsap.to(nextMagnet, {
          x: (event.clientX - rect.left - rect.width / 2) * 0.22,
          y: (event.clientY - rect.top - rect.height / 2) * 0.32,
          duration: 0.4,
          ease: "power3.out",
        });
      }

      scopes.forEach(({ scope, layers }) => {
        const rect = scope.getBoundingClientRect();
        if (event.clientY < rect.top || event.clientY > rect.bottom) return;
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        layers.forEach((layer) => {
          layer.x(nx * layer.depth * -10);
          layer.y(ny * layer.depth * -6);
        });
      });
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", releaseMagnet);

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", releaseMagnet);
      releaseMagnet();
    };
  }, []);

  return null;
}
