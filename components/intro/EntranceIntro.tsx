"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { INTRO_ATTR } from "./introScript";
import { recognizeF, type Point, type Stroke } from "./recognizeF";
import { createRippleSurface, GLYPH_CENTER_Y } from "./rippleSurface";
import { getTheme } from "@/lib/theme";
import styles from "./EntranceIntro.module.css";

type ExitStyle = "ripple" | "dissolve";

// Between --color-primary and --color-secondary for each theme; opaque so joins never bead.
const inkColor = () => (getTheme() === "dark" ? "#d07aa0" : "#b5527c");
const RESET_DELAY = 1800; // quiet time after an unrecognised attempt before the ink drains away
const MAX_STROKES = 5;
const REVEAL_FEATHER = 180; // px, soft water edge of the reveal

/** Restarts the homepage's own CSS entrance so it plays as the intro lifts, not unseen beneath it. */
function replayHomeEntrance() {
  const home = document.querySelector("[data-home-page]");
  home?.getAnimations({ subtree: true }).forEach((animation) => {
    if (animation.effect?.getTiming().iterations === Infinity) return;
    animation.currentTime = 0;
    animation.play();
  });
}

/**
 * Full-screen "draw an F" entrance. Mounted by IntroGate only on the first homepage load of a
 * session. While it is up the page underneath is inert and unscrollable; the moment the visitor
 * enters, both are released so the site is usable while the reveal is still finishing.
 */
export default function EntranceIntro({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<(style: ExitStyle, origin?: Point) => void>(() => {});
  const onDoneRef = useRef(onDone);
  const [retry, setRetry] = useState(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const surfaceCanvas = surfaceRef.current;
    const inkCanvas = inkRef.current;
    const ui = uiRef.current;
    const ink = inkCanvas?.getContext("2d");
    if (!root || !stage || !surfaceCanvas || !inkCanvas || !ui || !ink) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const html = document.documentElement;
    const lines = Array.from(ui.querySelectorAll<HTMLElement>("[data-intro-line]"));

    /* ---- Own the screen: no scrolling, nothing focusable behind the intro. ---- */
    // The site reserves a stable scrollbar gutter; with scrolling locked, give that strip back so
    // the pool reaches the right edge. Any reflow underneath happens while it is fully covered.
    const previousOverflow = html.style.overflow;
    const previousGutter = html.style.scrollbarGutter;
    html.style.overflow = "hidden";
    html.style.scrollbarGutter = "auto";
    const inerted: HTMLElement[] = [];
    for (const element of Array.from(document.body.children)) {
      if (element === root || !(element instanceof HTMLElement) || element.inert || element.tagName === "SCRIPT") continue;
      element.inert = true;
      inerted.push(element);
    }
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      html.style.overflow = previousOverflow;
      html.style.scrollbarGutter = previousGutter;
      inerted.forEach((element) => (element.inert = false));
    };
    root.focus({ preventScroll: true });

    const surface = createRippleSurface(surfaceCanvas, { animate: !reduced });

    /* ---- Ink layer: crisp vector strokes over the soft water. ---- */
    let inkWidth = 6;
    const sizeInk = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      inkCanvas.width = Math.round(window.innerWidth * dpr);
      inkCanvas.height = Math.round(window.innerHeight * dpr);
      ink.setTransform(dpr, 0, 0, dpr, 0, 0);
      inkWidth = Math.min(9, Math.max(4.5, Math.min(window.innerWidth, window.innerHeight) * 0.011));
    };
    const clearInk = () => ink.clearRect(0, 0, window.innerWidth, window.innerHeight);

    /** Draws the newest piece of the stroke as a midpoint-smoothed curve. */
    const inkTo = (stroke: Stroke) => {
      const n = stroke.length;
      const color = inkColor();
      ink.strokeStyle = color;
      ink.fillStyle = color;
      ink.lineWidth = inkWidth;
      ink.lineCap = "round";
      ink.lineJoin = "round";
      ink.beginPath();
      if (n === 1) {
        ink.arc(stroke[0].x, stroke[0].y, inkWidth / 2, 0, Math.PI * 2);
        ink.fill();
        return;
      }
      if (n === 2) {
        ink.moveTo(stroke[0].x, stroke[0].y);
        ink.lineTo((stroke[0].x + stroke[1].x) / 2, (stroke[0].y + stroke[1].y) / 2);
      } else {
        const a = stroke[n - 3];
        const b = stroke[n - 2];
        const c = stroke[n - 1];
        ink.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
        ink.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2);
      }
      ink.stroke();
    };

    /* ---- Drawing + recognition state. ---- */
    let strokes: Stroke[] = [];
    let current: Stroke | null = null;
    let pointer: Point | null = null;
    let resetTimer = 0;
    let exiting = false;

    const drainInk = () => {
      strokes = [];
      gsap.to(inkCanvas, {
        opacity: 0,
        duration: reduced ? 0.2 : 0.7,
        ease: "power1.out",
        onComplete: () => {
          if (exiting) return;
          clearInk();
          gsap.set(inkCanvas, { clearProps: "opacity" });
        },
      });
    };

    /** After an attempt that didn't read as an F, let the ink drain and offer a gentle hint. */
    const scheduleReset = (delay: number) => {
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        if (strokes.length) setRetry(true);
        drainInk();
      }, delay);
    };

    const minLetterHeight = () => Math.max(56, Math.min(window.innerWidth, window.innerHeight) * 0.14);

    const centroid = (points: Point[]): Point => {
      const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
      return { x: sum.x / points.length, y: sum.y / points.length };
    };

    /* ---- Exit. ---- */
    const enter = (style: ExitStyle, origin?: Point) => {
      if (exiting) return;
      exiting = true;
      window.clearTimeout(resetTimer);
      gsap.killTweensOf(inkCanvas);

      html.removeAttribute(INTRO_ATTR); // drops the pre-hydration cover underneath
      replayHomeEntrance();
      release();
      root.style.pointerEvents = "none"; // the revealed page is clickable straight away

      const finish = () => onDoneRef.current();

      if (style === "dissolve" || reduced) {
        gsap
          .timeline({ onComplete: finish })
          .to(ui, { opacity: 0, duration: 0.3, ease: "power1.out" }, 0)
          .to(root, { opacity: 0, duration: reduced ? 0.35 : 0.7, ease: "power2.out" }, 0);
        return;
      }

      const from = origin ?? { x: window.innerWidth / 2, y: window.innerHeight * GLYPH_CENTER_Y };
      surface.drop(from.x, from.y, 260, 12);
      const reach =
        Math.hypot(Math.max(from.x, window.innerWidth - from.x), Math.max(from.y, window.innerHeight - from.y)) +
        REVEAL_FEATHER;
      const reveal = { r: -REVEAL_FEATHER };
      root.style.setProperty("--reveal-x", `${from.x}px`);
      root.style.setProperty("--reveal-y", `${from.y}px`);
      root.style.setProperty("--reveal-feather", `${REVEAL_FEATHER}px`);
      root.style.setProperty("--reveal", `${reveal.r}px`);
      root.classList.add(styles.revealing);

      gsap
        .timeline({ onComplete: finish })
        .to(ui, { opacity: 0, y: 10, duration: 0.4, ease: "power2.in" }, 0)
        .to(inkCanvas, { opacity: 0, duration: 0.8, ease: "power1.out" }, 0.1)
        .to(
          reveal,
          {
            r: reach,
            duration: 1.4,
            ease: "power2.inOut",
            onUpdate: () => root.style.setProperty("--reveal", `${reveal.r}px`),
          },
          0.15
        );
    };
    enterRef.current = enter;

    /* ---- Pointer: ripples follow the cursor; pressing draws. ---- */
    const onPointerDown = (event: PointerEvent) => {
      if (exiting || !event.isPrimary || event.button > 0) return;
      event.preventDefault();
      window.clearTimeout(resetTimer);
      gsap.killTweensOf(inkCanvas);
      gsap.set(inkCanvas, { clearProps: "opacity" });
      stage.setPointerCapture(event.pointerId);
      const p = { x: event.clientX, y: event.clientY };
      current = [p];
      pointer = p;
      inkTo(current);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (exiting || !event.isPrimary) return;
      const p = { x: event.clientX, y: event.clientY };
      if (pointer) {
        const distance = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        const pace = Math.min(1.4, Math.max(0.4, distance / 6));
        surface.stir(pointer.x, pointer.y, p.x, p.y, (current ? 20 : 9) * pace);
      }
      pointer = p;
      if (!current) return;

      const samples = event.getCoalescedEvents ? event.getCoalescedEvents() : [];
      for (const sample of samples.length ? samples : [event]) {
        const q = { x: sample.clientX, y: sample.clientY };
        const last = current[current.length - 1];
        if (Math.hypot(q.x - last.x, q.y - last.y) < 2) continue;
        current.push(q);
        inkTo(current);
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!event.isPrimary || !current) return;
      const stroke = current;
      current = null;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      if (exiting) return;

      let length = 0;
      for (let i = 1; i < stroke.length; i++) {
        length += Math.hypot(stroke[i].x - stroke[i - 1].x, stroke[i].y - stroke[i - 1].y);
      }
      if (length < 8) {
        // A tap: a single drop on the water, not part of the letter.
        surface.drop(stroke[0].x, stroke[0].y, 70, 5);
        if (strokes.length) scheduleReset(RESET_DELAY);
        else drainInk();
        return;
      }

      strokes.push(stroke);
      if (recognizeF(strokes, minLetterHeight())) {
        enter("ripple", centroid(strokes.flat()));
        return;
      }
      scheduleReset(strokes.length >= MAX_STROKES ? 400 : RESET_DELAY);
    };

    const onPointerLeave = () => {
      if (!current) pointer = null;
    };

    /* ---- Keyboard: Enter enters, Escape skips. Buttons handle their own Enter. ---- */
    const onKeyDown = (event: KeyboardEvent) => {
      if (exiting || event.isComposing || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "Enter") {
        if (event.target instanceof Element && event.target.closest("button")) return;
        event.preventDefault();
        enter("ripple");
      } else if (event.key === "Escape") {
        event.preventDefault();
        enter("dissolve");
      }
    };

    let inkResizeFrame = 0;
    const onResize = () => {
      cancelAnimationFrame(inkResizeFrame);
      inkResizeFrame = requestAnimationFrame(() => {
        sizeInk(); // resizing a canvas clears it, so the attempt starts over
        strokes = [];
        current = null;
      });
    };

    sizeInk();
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);
    stage.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    /* ---- Entrance: the pool surfaces from the plain cover, then the words settle in. ---- */
    if (!reduced) {
      gsap.fromTo(surfaceCanvas, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: "power2.out" });
      gsap.fromTo(
        lines,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.45, clearProps: "transform" }
      );
    }

    return () => {
      window.clearTimeout(resetTimer);
      cancelAnimationFrame(inkResizeFrame);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerUp);
      stage.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      gsap.killTweensOf([surfaceCanvas, inkCanvas, root, ui, ...lines]);
      surface.destroy();
      release();
      enterRef.current = () => {};
    };
  }, []);

  return createPortal(
    <div
      ref={rootRef}
      className={styles.root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="entrance-intro-title"
      aria-describedby="entrance-intro-hint"
      tabIndex={-1}
    >
      <div ref={stageRef} className={styles.stage} aria-hidden="true">
        <canvas ref={surfaceRef} className={styles.surface} />
        <canvas ref={inkRef} className={styles.ink} />
      </div>

      <div ref={uiRef} className={styles.ui}>
        <div className={styles.top}>
          <p className={styles.mark} data-intro-line>
            Fatima Sierra <span>Portfolio</span>
          </p>
          <button type="button" className={styles.skip} onClick={() => enterRef.current("dissolve")} data-intro-line>
            Skip intro
          </button>
        </div>

        <div className={styles.bottom}>
          <h2 id="entrance-intro-title" className={styles.visuallyHidden}>
            Welcome to Fatima Sierra&rsquo;s portfolio
          </h2>
          <p id="entrance-intro-hint" className={styles.instruction} aria-live="polite" data-intro-line>
            {retry ? (
              "Almost. One tall line, then two arms to the right"
            ) : (
              <>
                Draw an <em>F</em> to enter
              </>
            )}
          </p>
          <button type="button" className={styles.enter} onClick={() => enterRef.current("ripple")} data-intro-line>
            <span className={styles.pointerFine}>
              or press <kbd className={styles.key}>Enter</kbd>
            </span>
            <span className={styles.pointerCoarse}>Enter</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
