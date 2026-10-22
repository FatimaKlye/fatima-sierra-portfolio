"use client";

import gsap from "gsap";
import { useCallback, useEffect, useId, useLayoutEffect, useRef } from "react";
import type { PointerEvent } from "react";
import { createPortal } from "react-dom";
import WordBreakGame from "./WordBreakGame";
import styles from "./WordBreak.module.css";

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Dialog shell: GSAP in/out, scroll lock, Escape, focus trap. Focus is restored by the trigger. */
export default function WordBreakModal({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const pressedOverlayRef = useRef(false);
  const entranceRef = useRef<gsap.core.Timeline | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel || reducedMotion()) {
      onClose();
      return;
    }

    // GSAP runs on animation frames, which browsers pause or throttle (hidden window, power saving);
    // the timer guarantees the dialog still closes, and `done` makes sure it closes only once.
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onClose();
    };

    entranceRef.current?.kill();
    gsap.killTweensOf([overlay, panel]);
    gsap.to(panel, { y: 10, scale: 0.97, opacity: 0, duration: 0.22, ease: "power2.in" });
    gsap.to(overlay, { opacity: 0, duration: 0.28, ease: "power2.in", onComplete: finish });
    window.setTimeout(finish, 450);
  }, [onClose]);

  // Layout effect so the entrance starts from its first frame — no flash of the settled dialog.
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.focus({ preventScroll: true });

    // Opacity only — autoAlpha's visibility:hidden would blur the panel that was just focused.
    let settle = 0;
    if (!reducedMotion()) {
      const entrance = (entranceRef.current = gsap
        .timeline()
        .fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0)
        .fromTo(
          panel,
          { y: 18, scale: 0.95, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.5)", clearProps: "transform" },
          0
        ));
      // Never leave the dialog half-faded if animation frames are throttled (see requestClose).
      settle = window.setTimeout(() => {
        // Kill after jumping to the end, or the global timeline would re-render it from its lagging clock.
        if (!closingRef.current) entrance.progress(1).kill();
      }, 800);
    }

    return () => {
      window.clearTimeout(settle);
      gsap.killTweensOf([overlay, panel]);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }

      const panel = panelRef.current;
      if (event.key !== "Tab" || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (item) => item.getClientRects().length > 0
      );
      const active = document.activeElement;
      if (items.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const outside = !panel.contains(active) || active === panel;
      if (event.shiftKey && (active === first || outside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [requestClose]);

  // Close on a backdrop click only when the press also started there (not a drag out of the dialog).
  const onOverlayPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pressedOverlayRef.current = event.target === event.currentTarget;
  };

  return createPortal(
    <div
      ref={overlayRef}
      className={styles.overlay}
      onPointerDown={onOverlayPointerDown}
      onClick={(event) => {
        if (pressedOverlayRef.current && event.target === event.currentTarget) requestClose();
      }}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        <WordBreakGame titleId={titleId} descriptionId={descriptionId} onClose={requestClose} />
      </div>
    </div>,
    document.body
  );
}
