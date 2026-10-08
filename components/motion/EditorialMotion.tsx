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
