"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ProjectsPage.module.css";

/**
 * Every animation on /projects, driven from data attributes so the chapters stay
 * server markup:
 *
 *  data-word             masked words that slide up when their line enters view
 *  data-reveal            fades/rises once when scrolled into view
 *  data-stagger           children reveal one after another
 *  data-clip[="side"]     media that unclips while scrolling; its [data-zoom] image settles from a zoom
 *  data-parallax="n"      gentle vertical drift of ±n% (wide screens)
 *  data-track             horizontal gallery whose rail travels sideways with the scroll (wide screens)
 *  data-tilt              3D tilt toward the cursor (fine pointers)
 *  data-depth="n"         hero stage layers that drift with the cursor (fine pointers)
 *  data-magnetic          pulls gently toward the cursor (fine pointers)
 *  data-cursor="label"    small label that follows the cursor over media (fine pointers)
 *  data-open-case         links that open their case study behind a curtain
 *
 * The hero opening (data-hero-word / data-hero-in / data-hero-stage) is pure CSS, so it
 * plays from the first paint and never waits on this script. Reduced-motion visitors get
 * everything simply visible and still.
 */
export default function ProjectsMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const all = <T extends HTMLElement = HTMLElement>(selector: string, scope: ParentNode = root) =>
      Array.from(scope.querySelectorAll<T>(selector));
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* Scroll reveals ------------------------------------------------------ */
      // Words animate per line (heading or quote), so each title plays as one gesture.
      const lines = new Set(all("[data-word]").map((word) => word.closest("h2, p") ?? word));
      lines.forEach((line) => {
        gsap.fromTo(
          all("[data-word]", line),
          { yPercent: 135 },
          {
            yPercent: 0,
            duration: 1.05,
            ease: "power4.out",
            stagger: 0.06,
            clearProps: "transform",
            scrollTrigger: { trigger: line, start: "top 90%", once: true },
          }
        );
      });

      all("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: { trigger: element, start: "top 96%", once: true },
          }
        );
      });

      all("[data-stagger]").forEach((group) => {
        gsap.fromTo(
          Array.from(group.children),
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.07,
            clearProps: "transform",
            scrollTrigger: { trigger: group, start: "top 95%", once: true },
          }
        );
      });

      /* Clip + zoom: the frame opens up while its image settles. */
      all("[data-clip]").forEach((clip) => {
        const side = clip.dataset.clip === "side";
        const image = clip.querySelector<HTMLElement>("[data-zoom]");
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: clip, start: "top 92%", end: "top 30%", scrub: 0.6 },
        });
        timeline.fromTo(
          clip,
          { clipPath: side ? "inset(0% 0% 0% 38% round 18px)" : "inset(9% 8% 9% 8% round 28px)" },
          { clipPath: "inset(0% 0% 0% 0% round 14px)" },
          0
        );
        if (image) timeline.fromTo(image, { scale: 1.18 }, { scale: 1 }, 0);
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
            scrollTrigger: { trigger: element.parentElement ?? element, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });

      /* Horizontal gallery: no pinning, the rail simply travels while its band crosses the screen. */
      const tracks = all("[data-track]");
      tracks.forEach((viewport) => {
        const rail = viewport.querySelector<HTMLElement>("[data-track-rail]");
        if (!rail) return;
        viewport.dataset.scrub = "true";
        viewport.scrollLeft = 0;
        gsap.fromTo(
          rail,
          { x: 0 },
          {
            x: () => -Math.max(0, rail.scrollWidth - viewport.clientWidth),
            ease: "none",
            scrollTrigger: { trigger: viewport, start: "top 85%", end: "bottom 15%", scrub: 0.8, invalidateOnRefresh: true },
          }
        );
      });

      return () => tracks.forEach((viewport) => delete viewport.dataset.scrub);
    });

    /* Cursor-reactive details: fine pointers only. */
    mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
      const cleanups: Array<() => void> = [];
      const listen = <K extends keyof HTMLElementEventMap>(
        target: HTMLElement,
        type: K,
        handler: (event: HTMLElementEventMap[K]) => void
      ) => {
        target.addEventListener(type, handler);
        cleanups.push(() => target.removeEventListener(type, handler));
      };

      all("[data-tilt]").forEach((tilt) => {
        const area = tilt.parentElement ?? tilt;
        gsap.set(tilt, { transformPerspective: 1100 });
        const rotateX = gsap.quickTo(tilt, "rotationX", { duration: 0.8, ease: "power3.out" });
        const rotateY = gsap.quickTo(tilt, "rotationY", { duration: 0.8, ease: "power3.out" });
        listen(area, "pointermove", (event) => {
          const box = area.getBoundingClientRect();
          rotateY(((event.clientX - box.left) / box.width - 0.5) * 10);
          rotateX(-((event.clientY - box.top) / box.height - 0.5) * 8);
        });
        listen(area, "pointerleave", () => {
          rotateX(0);
          rotateY(0);
        });
      });

      all("[data-stage]").forEach((stageLink) => {
        const layers = all("[data-depth]", stageLink).map((layer) => ({
          depth: Number(layer.dataset.depth) || 10,
          x: gsap.quickTo(layer, "x", { duration: 0.9, ease: "power3.out" }),
          y: gsap.quickTo(layer, "y", { duration: 0.9, ease: "power3.out" }),
        }));
        listen(stageLink, "pointermove", (event) => {
          const box = stageLink.getBoundingClientRect();
          const nx = (event.clientX - box.left) / box.width - 0.5;
          const ny = (event.clientY - box.top) / box.height - 0.5;
          layers.forEach((layer) => {
            layer.x(nx * layer.depth);
            layer.y(ny * layer.depth);
          });
        });
        listen(stageLink, "pointerleave", () =>
          layers.forEach((layer) => {
            layer.x(0);
            layer.y(0);
          })
        );
      });

      all("[data-magnetic]").forEach((magnet) => {
        const x = gsap.quickTo(magnet, "x", { duration: 0.6, ease: "power3.out" });
        const y = gsap.quickTo(magnet, "y", { duration: 0.6, ease: "power3.out" });
        listen(magnet, "pointermove", (event) => {
          const box = magnet.getBoundingClientRect();
          x((event.clientX - (box.left + box.width / 2)) * 0.3);
          y((event.clientY - (box.top + box.height / 2)) * 0.4);
        });
        listen(magnet, "pointerleave", () => {
          x(0);
          y(0);
        });
      });

      // One label follows the cursor and names what a click on the media will do.
      const label = document.createElement("span");
      label.className = styles.cursorLabel;
      label.setAttribute("aria-hidden", "true");
      root.appendChild(label);
      cleanups.push(() => label.remove());
      const followX = gsap.quickTo(label, "x", { duration: 0.45, ease: "power3.out" });
      const followY = gsap.quickTo(label, "y", { duration: 0.45, ease: "power3.out" });

      all("[data-cursor]").forEach((target) => {
        listen(target, "pointerenter", (event) => {
          label.textContent = target.dataset.cursor ?? "";
          gsap.set(label, { x: event.clientX, y: event.clientY });
          label.dataset.shown = "true";
        });
        listen(target, "pointermove", (event) => {
          followX(event.clientX);
          followY(event.clientY);
        });
        listen(target, "pointerleave", () => {
          delete label.dataset.shown;
        });
      });

      return () => cleanups.forEach((cleanup) => cleanup());
    });

    /* Opening a case study: a curtain grows out of whatever was clicked, the route
       changes behind it, then it lifts off the new page. Modified clicks keep their
       usual meaning (new tab, new window). */
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-open-case]");
      if (
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      event.preventDefault();
      router.prefetch(url.pathname);
      openBehindCurtain(link, url.pathname, () => router.push(url.pathname));
    };
    root.addEventListener("click", onClick);

    // Images and web fonts settle after hydration; re-measure trigger positions.
    const refresh = () => ScrollTrigger.refresh();
    const frame = requestAnimationFrame(refresh);
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => undefined);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", refresh);
      root.removeEventListener("click", onClick);
      mm.revert();
    };
  }, [router]);

  return (
    <div ref={rootRef} className={styles.root}>
      {children}
    </div>
  );
}

/**
 * Lives on <body>, outside React, so it survives the route change it covers.
 * Inline styles for the same reason: this page's CSS may unload with it.
 */
function openBehindCurtain(origin: HTMLElement, pathname: string, navigate: () => void) {
  const box = origin.getBoundingClientRect();
  const width = window.innerWidth;
  const height = window.innerHeight;
  const edge = (value: number) => `${Math.max(0, Math.round(value))}px`;
  const from = `inset(${edge(box.top)} ${edge(width - box.right)} ${edge(height - box.bottom)} ${edge(box.left)} round 18px)`;

  const curtain = document.createElement("div");
  curtain.setAttribute("aria-hidden", "true");
  Object.assign(curtain.style, {
    position: "fixed",
    inset: "0",
    zIndex: "1500",
    background: "var(--color-brand-fill)",
    pointerEvents: "none",
  });
  document.body.appendChild(curtain);

  // The curtain must never outstay its welcome: whatever happens to the navigation (slow
  // network, an error, the visitor pressing Back), it lifts.
  let lifted = false;
  const lift = () => {
    if (lifted) return;
    lifted = true;
    window.removeEventListener("popstate", lift);
    gsap.to(curtain, {
      clipPath: "inset(0px 0px 100% 0px round 0px)",
      duration: 0.75,
      ease: "power4.inOut",
      delay: 0.12,
      onComplete: () => curtain.remove(),
    });
  };
  window.addEventListener("popstate", lift);

  gsap.fromTo(
    curtain,
    { clipPath: from },
    {
      clipPath: "inset(0px 0px 0px 0px round 0px)",
      duration: 0.6,
      ease: "power3.inOut",
      onComplete: () => {
        try {
          navigate();
        } catch {
          lift();
          return;
        }
        const started = performance.now();
        // Lift once the new route has committed its URL; a slow route shows its old page again
        // after 2.5s rather than leaving the screen a blank sheet of colour.
        const wait = () => {
          if (lifted) return;
          if (window.location.pathname === pathname || performance.now() - started > 2500) {
            requestAnimationFrame(lift);
          } else {
            requestAnimationFrame(wait);
          }
        };
        wait();
      },
    }
  );
}
