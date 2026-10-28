"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

const READY_ATTR = "data-contact-ready";

/**
 * Choreographs the contact page from data attributes, so ContactPanel stays server markup
 * (same approach as HeroMotion):
 *
 *  data-contact-word         heading words, masked slide-up
 *  data-contact-reveal="g"   entrance group: eyebrow, lead, direct, social, resume, form, meta, glyph
 *  data-contact-sparkle      the little star beside the heading, spins in once
 *  data-depth="n"            follows the pointer by n steps (decorative layers, wide screens)
 *  data-magnetic="s"         leans toward the pointer by s (default 0.3), springs back on leave
 *
 * Until hydration, CSS keeps the entrance pieces hidden behind a 3s failsafe. Reduced-motion
 * visitors and no-JS renders see everything at once. Nothing loops: the page is still once settled.
 */
export default function ContactMotion({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const all = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector));
    const group = (name: string) => all(`[data-contact-reveal="${name}"]`);

    // Still held by the CSS failsafe? If it already fired, don't hide the page again to replay.
    const firstWord = root.querySelector("[data-contact-word]");
    let entrancePending = firstWord ? getComputedStyle(firstWord).opacity === "0" : false;
    let entranceDone = !entrancePending;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!entrancePending) return;
      entrancePending = false;

      const words = all("[data-contact-word]");
      const sparkle = all("[data-contact-sparkle]");
      const risers: [string, number][] = [
        ["eyebrow", 14],
        ["lead", 20],
        ["direct", 20],
        ["social", 18],
        ["resume", 14],
        ["form", 32],
        ["meta", 10],
      ];

      gsap.set(words, { yPercent: 115 });
      gsap.set(sparkle, { autoAlpha: 0, scale: 0.2, rotation: -140 });
      gsap.set(group("glyph"), { autoAlpha: 0, scale: 0.92 });
      risers.forEach(([name, y]) => gsap.set(group(name), { autoAlpha: 0, y }));

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          entranceDone = true;
        },
      });

      const rise = (name: string, at: number, stagger = 0) => {
        const targets = group(name);
        if (targets.length) {
          tl.to(targets, { autoAlpha: 1, y: 0, duration: 0.85, stagger, clearProps: "transform" }, at);
        }
      };

      rise("eyebrow", 0);
      tl.to(words, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.09, clearProps: "transform" }, 0.08);
      tl.to(sparkle, { autoAlpha: 1, scale: 1, rotation: 0, duration: 1, ease: "back.out(2)", clearProps: "transform" }, 0.55);
      tl.to(group("glyph"), { autoAlpha: 1, scale: 1, duration: 1.6, ease: "expo.out" }, 0.2);
      rise("lead", 0.4);
      rise("form", 0.45);
      rise("direct", 0.55);
      rise("social", 0.65, 0.06);
      rise("resume", 0.85);
      rise("meta", 0.95);

      return () => tl.kill();
    });

    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 900px) and (hover: hover) and (pointer: fine)", () => {
      const stage = root.closest("section") ?? root;
      const layers = all("[data-depth]").map((element) => ({
        depth: Number(element.dataset.depth) || 0,
        x: gsap.quickTo(element, "x", { duration: 1.2, ease: "power3.out" }),
        y: gsap.quickTo(element, "y", { duration: 1.2, ease: "power3.out" }),
      }));

      const onMove = (event: PointerEvent) => {
        const rect = stage.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        layers.forEach((layer) => {
          layer.x(nx * layer.depth * 18);
          layer.y(ny * layer.depth * 18);
        });
      };
      const onLeave = () =>
        layers.forEach((layer) => {
          layer.x(0);
          layer.y(0);
        });

      stage.addEventListener("pointermove", onMove);
      stage.addEventListener("pointerleave", onLeave);
      return () => {
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerleave", onLeave);
      };
    });

    mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
      // Looked up per event: the form swaps its button for the success panel and back.
      const magnetOf = (event: Event) =>
        (event.target as Element | null)?.closest<HTMLElement>("[data-magnetic]") ?? null;

      const move = (event: PointerEvent) => {
        const element = magnetOf(event);
        if (!element || !entranceDone) return;
        const strength = Number(element.dataset.magnetic) || 0.3;
        const rect = element.getBoundingClientRect();
        gsap.to(element, {
          x: (event.clientX - rect.left - rect.width / 2) * strength,
          y: (event.clientY - rect.top - rect.height / 2) * strength,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });
      };
      const leave = (event: PointerEvent) => {
        const element = magnetOf(event);
        if (!element || element.contains(event.relatedTarget as Node | null)) return;
        gsap.to(element, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)", overwrite: "auto" });
      };

      root.addEventListener("pointermove", move);
      root.addEventListener("pointerout", leave);
      return () => {
        root.removeEventListener("pointermove", move);
        root.removeEventListener("pointerout", leave);
      };
    });

    // Every start state is in place, so the CSS failsafe can let go.
    root.setAttribute(READY_ATTR, "");

    return () => {
      mm.revert();
      // Restores the CSS hold, so a Strict Mode re-run still sees the entrance as pending.
      root.removeAttribute(READY_ATTR);
    };
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
