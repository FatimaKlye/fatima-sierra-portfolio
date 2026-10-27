"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { INTRO_ATTR } from "@/components/intro/introScript";

const READY_ATTR = "data-hero-ready";

/**
 * Choreographs the homepage hero from data attributes, so the markup stays server-rendered:
 *
 *  data-hero-word         headline words, masked slide-up
 *  data-hero-reveal="g"   entrance group: eyebrow, lead, action, link, stack, portrait, deco, badge, draw, caption
 *  data-hero-media        photo inside the arch: settles from a zoom, drifts while scrolling
 *  data-depth="n"         follows the pointer by n steps (decorative layers, wide screens)
 *  data-drift="n"         drifts n% vertically as the hero scrolls away (data-turn="deg" also rotates)
 *  data-float             slow idle bob
 *  data-magnetic="s"      leans toward the pointer by s (default 0.3), springs back on leave
 *
 * Until hydration, CSS keeps the entrance elements hidden behind a 3s failsafe, so the first paint
 * never flashes the finished layout before it animates. Reduced-motion visitors and no-JS renders
 * see everything at once. On the first visit the entrance waits for the intro to hand over.
 */
export default function HeroMotion({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const all = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector));
    const group = (name: string) => all(`[data-hero-reveal="${name}"]`);
    const hero = root.closest("section") ?? root;
    const html = document.documentElement;

    // Still hidden by the CSS failsafe? If it has already fired (very late hydration), the
    // visitor has seen the hero, so don't hide it again just to replay the entrance.
    const firstWord = root.querySelector("[data-hero-word]");
    let entrancePending = firstWord ? getComputedStyle(firstWord).opacity === "0" : false;
    let entranceDone = !entrancePending;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!entrancePending) return;
      entrancePending = false;

      const words = all("[data-hero-word]");
      const arch = group("portrait");
      const media = all("[data-hero-media]");
      const drawPaths = group("draw").flatMap((svg) => Array.from(svg.querySelectorAll("path")));
      const risers: [string, number][] = [
        ["eyebrow", 14],
        ["lead", 22],
        ["action", 18],
        ["link", 14],
        ["stack", 18],
        ["caption", 16],
      ];

      // Start states, applied before the first post-hydration paint.
      gsap.set(words, { yPercent: 115 });
      risers.forEach(([name, y]) => gsap.set(group(name), { autoAlpha: 0, y }));
      gsap.set(arch, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(media, { scale: 1.22, transformOrigin: "50% 30%" });
      gsap.set(group("deco"), { autoAlpha: 0, scale: 0.85 });
      gsap.set(group("badge"), { autoAlpha: 0, scale: 0.3, rotation: -120 });
      gsap.set(drawPaths, { strokeDasharray: 1, strokeDashoffset: 1 });

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
        onComplete: () => {
          entranceDone = true;
        },
      });

      const rise = (name: string, at: number, stagger = 0) => {
        const targets = group(name);
        if (targets.length) {
          tl.to(targets, { autoAlpha: 1, y: 0, duration: 0.9, stagger, clearProps: "transform" }, at);
        }
      };

      rise("eyebrow", 0);
      tl.to(words, { yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.07, clearProps: "transform" }, 0.08);
      tl.to(arch, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out", clearProps: "clipPath" }, 0.15);
      tl.to(media, { scale: 1, duration: 1.8, ease: "expo.out" }, 0.15);
      rise("lead", 0.5);
      tl.to(group("deco"), { autoAlpha: 1, scale: 1, duration: 1.2, stagger: 0.1 }, 0.5);
      rise("action", 0.65, 0.08);
      tl.to(group("badge"), { autoAlpha: 1, scale: 1, rotation: 0, duration: 1.2, ease: "back.out(1.7)" }, 0.75);
      rise("link", 0.8, 0.06);
      rise("stack", 0.9);
      tl.to(drawPaths, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, 0.95);
      rise("caption", 1.05);

      const start = () => tl.play();
      if (!html.hasAttribute(INTRO_ATTR)) {
        start();
        return;
      }

      // The intro removes its attribute as it reveals the page; begin as it hands over.
      const observer = new MutationObserver(() => {
        if (html.hasAttribute(INTRO_ATTR)) return;
        observer.disconnect();
        window.clearTimeout(fallback);
        start();
      });
      observer.observe(html, { attributes: true, attributeFilter: [INTRO_ATTR] });
      const fallback = window.setTimeout(start, 9000); // the intro cover's own failsafe lifts at 8s

      return () => {
        observer.disconnect();
        window.clearTimeout(fallback);
      };
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      all("[data-float]").forEach((element, index) => {
        gsap.to(element, {
          y: -8,
          rotation: index % 2 ? -10 : 10,
          duration: 2.8 + index * 0.7,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
    });

    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 900px)", () => {
      const scrub = { trigger: hero, start: "top top", end: "bottom top", scrub: true };

      all("[data-drift]").forEach((element) => {
        gsap.to(element, {
          yPercent: Number(element.dataset.drift) || 0,
          rotation: Number(element.dataset.turn) || 0,
          ease: "none",
          scrollTrigger: scrub,
        });
      });

      gsap.to(all("[data-hero-media]"), { yPercent: -5, ease: "none", scrollTrigger: scrub });
    });

    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 900px) and (hover: hover) and (pointer: fine)", () => {
      const layers = all("[data-depth]").map((element) => ({
        depth: Number(element.dataset.depth) || 0,
        x: gsap.quickTo(element, "x", { duration: 1.1, ease: "power3.out" }),
        y: gsap.quickTo(element, "y", { duration: 1.1, ease: "power3.out" }),
      }));

      const onMove = (event: PointerEvent) => {
        const rect = hero.getBoundingClientRect();
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

      hero.addEventListener("pointermove", onMove);
      hero.addEventListener("pointerleave", onLeave);
      return () => {
        hero.removeEventListener("pointermove", onMove);
        hero.removeEventListener("pointerleave", onLeave);
      };
    });

    mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
      const cleanups = all("[data-magnetic]").map((element) => {
        const strength = Number(element.dataset.magnetic) || 0.3;

        const move = (event: PointerEvent) => {
          if (!entranceDone) return;
          const rect = element.getBoundingClientRect();
          gsap.to(element, {
            x: (event.clientX - rect.left - rect.width / 2) * strength,
            y: (event.clientY - rect.top - rect.height / 2) * strength,
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
          });
        };
        const leave = () =>
          gsap.to(element, { x: 0, y: 0, scale: 1, duration: 0.9, ease: "elastic.out(1, 0.45)", overwrite: "auto" });
        const press = () => gsap.to(element, { scale: 0.95, duration: 0.15, ease: "power2.out", overwrite: "auto" });
        const release = () => gsap.to(element, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)", overwrite: "auto" });

        element.addEventListener("pointermove", move);
        element.addEventListener("pointerleave", leave);
        element.addEventListener("pointerdown", press);
        element.addEventListener("pointerup", release);
        return () => {
          element.removeEventListener("pointermove", move);
          element.removeEventListener("pointerleave", leave);
          element.removeEventListener("pointerdown", press);
          element.removeEventListener("pointerup", release);
        };
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    });

    // Every start state is in place, so the CSS failsafe can let go.
    root.setAttribute(READY_ATTR, "");

    // Images and web fonts settle after hydration; re-measure trigger positions.
    const refresh = () => ScrollTrigger.refresh();
    const frame = requestAnimationFrame(refresh);
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => undefined);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", refresh);
      mm.revert();
      // Restores the CSS hold, so a Strict Mode re-run still sees the hero as pending.
      root.removeAttribute(READY_ATTR);
    };
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
