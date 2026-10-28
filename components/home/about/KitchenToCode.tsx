"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChefHat, CodeXml } from "lucide-react";
import { MEDALS } from "./aboutStoryData";
import styles from "./KitchenToCode.module.css";

type Token = [text: string, tone?: "kw" | "fn" | "prop" | "str" | "muted"];

/** One notebook row per line: each recipe line sits exactly over the code that replaces it. */
const ROWS: { recipe: string; done?: boolean; code: Token[] }[] = [
  { recipe: "Strawberry cupcakes", code: [["const ", "kw"], ["app = "], ["bake", "fn"], ["({"]] },
  { recipe: "2 cups flour", done: true, code: [["  base: ", "prop"], ['"Next.js"', "str"], [","]] },
  { recipe: "1 cup sugar", done: true, code: [["  sweetener: ", "prop"], ['"TypeScript"', "str"], [","]] },
  { recipe: "Pink frosting", done: true, code: [["  frosting: ", "prop"], ['"Flutter"', "str"], [","]] },
  { recipe: "Strawberry filling", code: [["  filling: ", "prop"], ['"Supabase"', "str"], [","]] },
  { recipe: "A pinch of patience", code: [["}); "], ["// + patience", "muted"]] },
  { recipe: "Taste, adjust, repeat ♥", code: [["while ", "kw"], ["(!app.isRight) "], ["taste", "fn"], ["(app);"]] },
];

/** Glyphs thrown by the switch on the way to code; the way back throws plain sprinkles. */
const CODE_BITS = ["{", "}", ";", "</>", "()", "=>", "[", "]", "//", "&&"];

const MEDAL = MEDALS[0]?.label;

const SCENE_LABEL =
  "A strawberry cupcake recipe, a whisk and an oven timer on a gingham tablecloth" +
  (MEDAL ? `, beside a gold medal sticker for ${MEDAL}` : "") +
  ". Switching to code peels the recipe back to an app's source code, turns the cupcake into a phone app, the whisk into a cursor and the timer into a passing build.";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

function Cupcake() {
  return (
    <svg className={styles.cupcakeArt} viewBox="0 0 120 140" data-cupcake>
      <g className={styles.frosting}>
        <circle cx="36" cy="70" r="16" />
        <circle cx="84" cy="70" r="16" />
        <circle cx="60" cy="62" r="28" />
        <circle cx="60" cy="38" r="17" />
      </g>
      <g className={styles.sprinkles}>
        <rect x="44" y="50" width="7" height="2.6" rx="1.3" transform="rotate(-30 47.5 51.3)" />
        <rect x="68" y="44" width="7" height="2.6" rx="1.3" transform="rotate(25 71.5 45.3)" />
        <rect x="56" y="66" width="7" height="2.6" rx="1.3" transform="rotate(70 59.5 67.3)" />
        <rect x="76" y="62" width="7" height="2.6" rx="1.3" transform="rotate(-10 79.5 63.3)" />
        <rect x="36" y="64" width="7" height="2.6" rx="1.3" transform="rotate(40 39.5 65.3)" />
        <rect x="52" y="30" width="7" height="2.6" rx="1.3" transform="rotate(-60 55.5 31.3)" />
      </g>
      <path className={styles.wrapper} d="M18 78h84l-10 50a8 8 0 0 1-7.8 6.4H35.8A8 8 0 0 1 28 128Z" />
      <path className={styles.wrapperStripes} d="M38 81l4 50M60 81v51M82 81l-4 50" />
      <path className={styles.stem} d="M62 22c1-7 5-11 11-13" />
      <circle className={styles.cherry} cx="62" cy="24" r="9" />
      <circle className={styles.cherryShine} cx="59" cy="21" r="2.4" />
    </svg>
  );
}

function Phone() {
  return (
    <svg className={styles.phone} viewBox="0 0 120 140" data-phone>
      <rect className={styles.phoneBody} x="26" y="4" width="68" height="132" rx="13" />
      <rect className={styles.phoneScreen} x="31" y="11" width="58" height="118" rx="8" />
      <rect className={styles.phoneNotch} x="51" y="14" width="18" height="4" rx="2" />
      <rect className={styles.phoneAccent} x="37" y="25" width="26" height="4" rx="2" />
      <circle className={styles.phoneAccent} cx="80" cy="27" r="4" />
      <rect className={styles.phoneTile} x="37" y="36" width="46" height="40" rx="6" />
      <circle className={styles.phoneFrost} cx="60" cy="53" r="9" />
      <path className={styles.phoneWrapper} d="M49 58h22l-3 11h-16Z" />
      <circle className={styles.phoneCherry} cx="60" cy="43" r="3" />
      <rect className={styles.phoneLine} x="37" y="84" width="40" height="4" rx="2" />
      <rect className={styles.phoneLine} x="37" y="92" width="27" height="4" rx="2" />
      <rect className={styles.phoneAccent} x="37" y="106" width="46" height="12" rx="6" />
    </svg>
  );
}

function Whisk() {
  return (
    <svg className={styles.whiskArt} viewBox="0 0 64 120" data-whisk>
      <g className={styles.whiskWires}>
        <path d="M32 70C12 58 10 16 32 4c22 12 20 54 0 66Z" />
        <path d="M32 70C20 56 20 18 32 4c12 14 12 52 0 66Z" />
        <path d="M32 70V4" />
      </g>
      <rect className={styles.whiskCollar} x="25" y="66" width="14" height="9" rx="3" />
      <rect className={styles.whiskHandle} x="26.5" y="74" width="11" height="42" rx="5.5" />
    </svg>
  );
}

function Cursor() {
  return (
    <svg className={styles.cursor} viewBox="0 0 64 120" data-cursor>
      <path className={styles.cursorShape} d="M16 30v56l14-13 10 24 10-4.5-10-23.5 20-1Z" />
    </svg>
  );
}

/**
 * The homepage About centrepiece: a scrapbook kitchen desk that becomes a
 * developer's desk. Hovering the recipe lifts its corner to peek at the code
 * underneath; the switch (or a click on the notebook) peels the whole page back
 * while the cupcake, whisk and timer turn into a phone app, a cursor and a build.
 *
 * One paused GSAP timeline holds the whole change and plays forwards or in
 * reverse, so the only React state is the switch itself.
 */
export default function KitchenToCode() {
  const [coded, setCoded] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const notebookRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const codedRef = useRef(false);
  const shownRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    const notebook = notebookRef.current;
    if (!stage || !notebook) return;

    gsap.registerPlugin(ScrollTrigger);
    const reduceMotion = window.matchMedia(REDUCED_MOTION).matches;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(stage);

      timelineRef.current = gsap
        .timeline({ paused: true })
        // The recipe page peels away from its corner, uncovering the editor beneath.
        .to(notebook, { "--peel": 1, duration: 1.05, ease: "power2.inOut" }, 0)
        .to(q("[data-flap]"), { opacity: 0, duration: 0.3 }, 0.62)
        .to(q("[data-gingham]"), { opacity: 0, duration: 0.8, ease: "power2.inOut" }, 0)
        .to(q("[data-grid]"), { opacity: 1, duration: 0.8, ease: "power2.inOut" }, 0.1)
        // Cupcake squashes, vanishes, and a phone pops up in its place.
        .to(q("[data-cupcake]"), { scaleX: 1.18, scaleY: 0.78, transformOrigin: "50% 100%", duration: 0.18, ease: "power2.out" }, 0.1)
        .to(q("[data-cupcake]"), { scale: 0, rotation: -14, duration: 0.28, ease: "back.in(2)" }, 0.28)
        .fromTo(
          q("[data-phone]"),
          { scale: 0, rotation: 12 },
          { scale: 1, rotation: 0, transformOrigin: "50% 100%", duration: 0.7, ease: "back.out(1.9)" },
          0.5
        )
        // Whisk spins out into a cursor.
        .to(q("[data-whisk]"), { rotation: 200, scale: 0, duration: 0.45, ease: "back.in(1.6)" }, 0.15)
        .fromTo(q("[data-cursor]"), { rotation: -120, scale: 0 }, { rotation: 0, scale: 1, duration: 0.6, ease: "back.out(2.2)" }, 0.55)
        // Oven timer slips away; the build result slides in.
        .to(q("[data-note]"), { yPercent: -24, opacity: 0, duration: 0.35, ease: "power2.in" }, 0.25)
        .fromTo(q("[data-terminal]"), { yPercent: 24, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, 0.55);

      if (reduceMotion) return;

      const peek = (distance: number, vars: gsap.TweenVars = {}) =>
        gsap.to(notebook, { "--peek": `${distance}px`, duration: 0.55, ease: "power3.out", overwrite: "auto", ...vars });

      // Pieces are set down on the desk one by one, then the recipe lifts its corner once as a hint.
      gsap.fromTo(
        q("[data-depth]"),
        { yPercent: 16, scale: 0.9, opacity: 0 },
        {
          yPercent: 0,
          scale: 1,
          opacity: 1,
          duration: 0.9,
          ease: "back.out(1.5)",
          stagger: 0.09,
          scrollTrigger: { trigger: stage, start: "top 78%", once: true },
          onComplete: () => {
            if (!codedRef.current) peek(52, { delay: 0.2, yoyo: true, repeat: 1, repeatDelay: 0.6, ease: "power2.inOut" });
          },
        }
      );

      if (!window.matchMedia(FINE_POINTER).matches) return;

      const lift = () => {
        if (!codedRef.current) peek(64);
      };
      const settle = () => peek(0, { duration: 0.6, ease: "power3.inOut" });

      // Gentle depth: pieces drift with the pointer, the lighter ones further.
      const movers = q("[data-depth]").map((element) => ({
        depth: Number((element as HTMLElement).dataset.depth) || 1,
        x: gsap.quickTo(element, "x", { duration: 0.8, ease: "power3.out" }),
        y: gsap.quickTo(element, "y", { duration: 0.8, ease: "power3.out" }),
      }));
      const drift = (event: PointerEvent) => {
        const box = stage.getBoundingClientRect();
        const nx = (event.clientX - box.left) / box.width - 0.5;
        const ny = (event.clientY - box.top) / box.height - 0.5;
        movers.forEach((mover) => {
          mover.x(nx * mover.depth * 16);
          mover.y(ny * mover.depth * 12);
        });
      };
      const rest = () =>
        movers.forEach((mover) => {
          mover.x(0);
          mover.y(0);
        });

      notebook.addEventListener("pointerenter", lift);
      notebook.addEventListener("pointerleave", settle);
      stage.addEventListener("pointermove", drift);
      stage.addEventListener("pointerleave", rest);
      return () => {
        notebook.removeEventListener("pointerenter", lift);
        notebook.removeEventListener("pointerleave", settle);
        stage.removeEventListener("pointermove", drift);
        stage.removeEventListener("pointerleave", rest);
      };
    }, stage);

    return () => {
      ctx.revert();
      timelineRef.current = null;
    };
  }, []);

  useEffect(() => {
    codedRef.current = coded;
    const timeline = timelineRef.current;
    if (!timeline || shownRef.current === coded) return;
    shownRef.current = coded;

    if (window.matchMedia(REDUCED_MOTION).matches) {
      timeline.progress(coded ? 1 : 0).pause();
      return;
    }

    gsap.to(notebookRef.current, { "--peek": "0px", duration: 0.4, overwrite: "auto" });
    if (coded) timeline.timeScale(1).play();
    else timeline.timeScale(1.35).reverse();

    // A small burst from the switch: code glyphs on the way in, sprinkles on the way back.
    const burst = burstRef.current;
    if (!burst) return;
    burst.dataset.kind = coded ? "code" : "kitchen";
    const bits = Array.from(burst.children);
    bits.forEach((bit, index) => {
      const angle = ((-160 + (140 * index) / (bits.length - 1) + gsap.utils.random(-8, 8)) * Math.PI) / 180;
      const distance = gsap.utils.random(48, 96);
      gsap.fromTo(
        bit,
        { x: 0, y: 0, scale: 0.4, rotation: 0, opacity: 1 },
        {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          rotation: gsap.utils.random(-160, 160),
          scale: 1,
          duration: 0.75,
          ease: "power3.out",
          overwrite: true,
        }
      );
      gsap.to(bit, { opacity: 0, duration: 0.3, delay: 0.5 });
    });
  }, [coded]);

  const toggle = () => setCoded((value) => !value);

  return (
    <div className={styles.stage} ref={stageRef} data-coded={coded ? "" : undefined}>
      <div className={styles.desk} role="img" aria-label={SCENE_LABEL}>
        <span className={styles.gingham} data-gingham />
        <span className={styles.grid} data-grid />

        {MEDAL && (
          <div className={`${styles.piece} ${styles.medal}`} data-depth="1.2">
            <div className={styles.art}>
              <span className={styles.medalBadge}>
                <span className={styles.medalKicker}>Gold</span>
                <span className={styles.medalTitle}>medalist</span>
                <span className={styles.medalLabel}>{MEDAL}</span>
              </span>
            </div>
          </div>
        )}

        <div className={`${styles.piece} ${styles.notebook}`} ref={notebookRef} onClick={toggle} data-depth="0.4">
          <div className={`${styles.sheet} ${styles.editor}`}>
            <p className={styles.sheetHead}>
              <span className={styles.dots}>
                <i />
                <i />
                <i />
              </span>
              <span>first-app.ts</span>
            </p>
            <ol className={styles.rows}>
              {ROWS.map((row, index) => (
                <li key={row.recipe}>
                  <span className={styles.ln}>{index + 1}</span>
                  <span>
                    {row.code.map(([text, tone], part) => (
                      <span key={part} className={tone && styles[tone]}>
                        {text}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className={`${styles.sheet} ${styles.recipe}`}>
            <p className={styles.sheetHead}>
              <span>Recipe Nº 01</span>
              <span>Makes 12</span>
            </p>
            <ol className={styles.rows}>
              {ROWS.map((row, index) => (
                <li key={row.recipe}>
                  {index > 0 && <i className={styles.check} data-done={row.done ? "" : undefined} />}
                  {row.recipe}
                </li>
              ))}
            </ol>
          </div>

          <span className={styles.flap} data-flap />
          <span className={`${styles.tape} ${styles.tapeLeft}`} />
          <span className={`${styles.tape} ${styles.tapeRight}`} />
        </div>

        <div className={`${styles.piece} ${styles.whisk}`} data-depth="1.5">
          <div className={styles.art}>
            <Whisk />
            <Cursor />
          </div>
        </div>

        <div className={`${styles.piece} ${styles.cupcake}`} data-depth="1">
          <div className={styles.art}>
            <Cupcake />
            <Phone />
          </div>
        </div>

        <div className={`${styles.piece} ${styles.timer}`} data-depth="0.8">
          <div className={styles.art}>
            <div className={styles.note} data-note>
              <span className={styles.noteKicker}>Oven timer</span>
              <strong>18:00</strong>
              <span>180°C · until golden</span>
            </div>
            <div className={styles.terminal} data-terminal>
              <span className={styles.termMuted}>$ npm run build</span>
              <strong>✓ Ready in 1.8s</strong>
              <span className={styles.termMuted}>made with love ♥</span>
            </div>
          </div>
        </div>
      </div>

      <button type="button" role="switch" aria-checked={coded} aria-label="Turn the kitchen into code" className={styles.switch} onClick={toggle}>
        <span className={styles.switchLabel}>Kitchen</span>
        <span className={styles.track}>
          <span className={styles.thumb}>
            <ChefHat strokeWidth={1.8} />
            <CodeXml strokeWidth={1.8} />
          </span>
          <span className={styles.burst} ref={burstRef} aria-hidden="true">
            {CODE_BITS.map((glyph) => (
              <span key={glyph} data-glyph={glyph} />
            ))}
          </span>
        </span>
        <span className={styles.switchLabel}>Code</span>
      </button>
    </div>
  );
}
