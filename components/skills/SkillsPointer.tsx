"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Skills.module.css";

/**
 * Desktop-only pointer details for /skills, wired by delegation so content
 * that re-renders (the stack readout) keeps working:
 *
 *  data-magnetic       element leans a little toward the pointer
 *  data-peek-src       a project preview image follows the pointer while hovering
 *  data-depth-scope    container whose [data-depth="n"] children drift with the pointer
 *
 * Skipped entirely on touch screens and for reduced-motion visitors.
 */
export default function SkillsPointer() {
  const peekRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const peek = peekRef.current;
    const image = imageRef.current;
    if (!query.matches || !peek || !image) return;

    const peekX = gsap.quickTo(peek, "x", { duration: 0.5, ease: "power3.out" });
    const peekY = gsap.quickTo(peek, "y", { duration: 0.5, ease: "power3.out" });
    let magnet: HTMLElement | null = null;
    let peeking = false;

    const releaseMagnet = () => {
      if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
      magnet = null;
    };

    const hidePeek = () => {
      if (!peeking) return;
      peeking = false;
      gsap.to(peek, { opacity: 0, scale: 0.92, duration: 0.25, ease: "power2.out" });
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

      const peekSource = target?.closest<HTMLElement>("[data-peek-src]")?.dataset.peekSrc;
      if (peekSource) {
        if (image.getAttribute("src") !== peekSource) image.src = peekSource;
        peekX(event.clientX + 28);
        peekY(event.clientY - 90);
        if (!peeking) {
          peeking = true;
          gsap.set(peek, { x: event.clientX + 28, y: event.clientY - 90 });
          gsap.to(peek, { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" });
        }
      } else {
        hidePeek();
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

    const onLeave = () => {
      releaseMagnet();
      hidePeek();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", hidePeek, { passive: true });

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", hidePeek);
      gsap.killTweensOf(peek);
    };
  }, []);

  return (
    <div ref={peekRef} className={styles.peek} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative preview swapped on hover */}
      <img ref={imageRef} alt="" decoding="async" />
    </div>
  );
}
