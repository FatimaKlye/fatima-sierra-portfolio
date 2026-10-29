"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ProjectDetails.module.css";

/**
 * Drives every GSAP animation on a case-study page from data attributes, so the
 * section components stay plain server markup:
 *
 *  data-reveal         fades/rises once when scrolled into view
 *  data-stagger         children of this element reveal one after another
 *  data-line            scrubbed progress line (drives the --p custom property)
 *  data-parallax="n"    gentle vertical drift of ±n% while scrolling (wide screens)
 *
 * The hero opening (data-word / data-intro / data-intro-visual) is pure CSS and never
 * waits on this effect. Scroll reveals are hidden by CSS only while data-motion="pending"
 * (with a CSS failsafe); reduced-motion visitors and failures fall back to
 * data-motion="off", where everything is simply visible.
 */
export default function ProjectMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const all = <T extends HTMLElement>(selector: string) => Array.from(root.querySelectorAll<T>(selector));
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      root.dataset.motion = "off";
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      try {
        all("[data-reveal]").forEach((element) => {
          gsap.fromTo(
            element,
            { y: 44, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.95,
              ease: "power3.out",
              clearProps: "transform",
              // 98% (not lower): anything inside the final viewport must be able to fire,
              // otherwise a block at the very bottom of the page could stay hidden.
              scrollTrigger: { trigger: element, start: "top 98%", once: true },
            }
          );
        });

        all("[data-stagger]").forEach((group) => {
          gsap.fromTo(
            Array.from(group.children),
            { y: 36, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: "power3.out",
              stagger: 0.09,
              clearProps: "transform",
              scrollTrigger: { trigger: group, start: "top 96%", once: true },
            }
          );
        });

        all("[data-line]").forEach((line) => {
          gsap.fromTo(
            line,
            { "--p": 0 },
            {
              "--p": 1,
              ease: "none",
              scrollTrigger: {
                trigger: line.parentElement ?? line,
                start: "top 78%",
                end: "bottom 62%",
                scrub: 0.5,
              },
            }
          );
        });

        root.dataset.motion = "ready";
      } catch {
        root.dataset.motion = "off";
      }

      return () => {
        root.dataset.motion = "off";
      };
    });

    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 900px)", () => {
      all("[data-parallax]").forEach((element) => {
        const amount = Number(element.dataset.parallax) || 4;

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
    <div ref={rootRef} className={styles.page} data-motion="pending">
      {children}
    </div>
  );
}
