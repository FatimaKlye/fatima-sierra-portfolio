"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Drives scroll animations from data attributes so page sections stay
 * server markup (same approach as ProjectMotion on the case-study pages):
 *
 *  data-word            title words, masked slide-up when the opening enters view
 *  data-reveal          fades/rises once when scrolled into view
 *  data-stagger         children of this element reveal one after another
 *  data-draw            SVG path that draws itself while scrolling
 *  data-spin="n"        rotates n degrees across its scroll (medals)
 *  data-parallax="n"    gentle vertical drift of ±n% while scrolling (wide screens)
 *  data-grow            line that grows from the top as its parent scrolls through view
 *  data-ink             its [data-ink-word] words brighten in reading order while it scrolls
 *                       through view; [data-mark] phrases inside sweep their --mark (0 → 1) in
 *                       as the reading reaches them
 *  data-magnetic        leans gently toward the pointer while hovered (fine pointers only)
 *
 * Nothing is hidden by CSS: GSAP sets the start states after hydration, so
 * reduced-motion visitors and no-JS renders simply see everything.
 */
export default function EditorialMotion({ children, className }: { children: ReactNode; className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const all = <T extends Element = HTMLElement>(selector: string) => Array.from(root.querySelectorAll<T>(selector));
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const words = all("[data-word]");
      if (words.length) {
        gsap.fromTo(
          words,
          { yPercent: 118 },
          {
            yPercent: 0,
            duration: 1.15,
            ease: "power4.out",
            stagger: 0.08,
            clearProps: "transform",
            scrollTrigger: { trigger: words[0], start: "top 92%", once: true },
          }
        );
      }

      all("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: { trigger: element, start: "top 96%", once: true },
          }
        );
      });

      all("[data-stagger]").forEach((group) => {
        gsap.fromTo(
          Array.from(group.children),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            clearProps: "transform",
            scrollTrigger: { trigger: group, start: "top 94%", once: true },
          }
        );
      });

      all<SVGPathElement>("[data-draw]").forEach((path) => {
        const length = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: path.closest("svg") ?? path,
              start: "top 85%",
              end: "bottom 45%",
              scrub: 0.6,
            },
          }
        );
      });

      all("[data-grow]").forEach((element) => {
        gsap.fromTo(
          element,
          { scaleY: 0, transformOrigin: "50% 0%" },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: element.parentElement ?? element,
              start: "top 70%",
              end: "bottom 60%",
              scrub: 0.5,
            },
          }
        );
      });

      all("[data-ink]").forEach((block) => {
        const words = Array.from(block.querySelectorAll<HTMLElement>("[data-ink-word]"));
        if (!words.length) return;

        const step = 0.05;
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: block, start: "top 82%", end: "bottom 88%", scrub: 0.5 },
        });
        timeline.fromTo(words, { opacity: 0.18 }, { opacity: 1, duration: 0.3, ease: "none", stagger: step }, 0);

        block.querySelectorAll<HTMLElement>("[data-mark]").forEach((mark) => {
          const markWords = mark.querySelectorAll("[data-ink-word]");
          const first = words.indexOf(markWords[0] as HTMLElement);
          if (first < 0) return;
          timeline.fromTo(
            mark,
            { "--mark": 0 },
            { "--mark": 1, duration: markWords.length * step + 0.3, ease: "none" },
            first * step
          );
        });
      });

      all("[data-spin]").forEach((element) => {
        const degrees = Number(element.dataset.spin) || 40;
        gsap.fromTo(
          element,
          { rotation: -degrees / 2, transformOrigin: "50% 50%" },
          {
            rotation: degrees / 2,
            transformOrigin: "50% 50%",
            ease: "none",
            scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });
    });

    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 900px)", () => {
      all("[data-parallax]").forEach((element) => {
        const amount = Number(element.dataset.parallax) || 6;
        gsap.fromTo(
          element,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: {
              trigger: element.parentElement ?? element,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    });

    mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
      const cleanups = all("[data-magnetic]").map((element) => {
        const x = gsap.quickTo(element, "x", { duration: 0.6, ease: "power3.out" });
        const y = gsap.quickTo(element, "y", { duration: 0.6, ease: "power3.out" });
        const move = (event: PointerEvent) => {
          const box = element.getBoundingClientRect();
          x((event.clientX - box.left - box.width / 2) * 0.12);
          y((event.clientY - box.top - box.height / 2) * 0.2);
        };
        const leave = () => {
          x(0);
          y(0);
        };
        element.addEventListener("pointermove", move);
        element.addEventListener("pointerleave", leave);
        return () => {
          element.removeEventListener("pointermove", move);
          element.removeEventListener("pointerleave", leave);
        };
      });
      return () => cleanups.forEach((cleanup) => cleanup());
    });

    // Images and web fonts settle after hydration; re-measure trigger positions.
    const refresh = () => ScrollTrigger.refresh();
    const frame = requestAnimationFrame(refresh);
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => undefined);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
