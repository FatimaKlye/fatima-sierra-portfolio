"use client";

import { useEffect, useId, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RECIPE_STEPS } from "./aboutStoryData";
import styles from "./AboutStory.module.css";

const START = 10;
const END = 90;
const RESTING = 50;

const valueText = (value: number) => `${value}% code, ${100 - value}% recipe`;

/**
 * "Recipe → code" comparison. Each row stacks a kitchen step and its code
 * counterpart in the same grid cell, so both always share a height; the code
 * layer is clipped to the left `--reveal`% of the panel.
 *
 * Scrolling scrubs the reveal (motion-enabled visitors only). Visitors can also
 * drag across the panel or use the labelled range slider (pointer, keyboard,
 * screen reader) — the first manual change drops the scroll link so the two
 * never fight.
 */
export default function RecipeToCode() {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();

  useEffect(() => {
    const panel = panelRef.current;
    const input = inputRef.current;
    if (!panel || !input) return;

    let trigger: ScrollTrigger | null = null;

    const setReveal = (value: number) => {
      const rounded = Math.round(Math.min(100, Math.max(0, value)));
      panel.style.setProperty("--reveal", String(rounded));
      input.value = String(rounded);
      input.setAttribute("aria-valuetext", valueText(rounded));
    };

    const takeOver = (value: number) => {
      trigger?.kill();
      trigger = null;
      setReveal(value);
    };

    const onInput = () => takeOver(Number(input.value));

    // Horizontal drag on the panel itself. CSS `touch-action: pan-y` keeps
    // vertical swipes scrolling the page on touch screens.
    let dragging = false;
    const valueAt = (clientX: number) => {
      const rect = panel.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragging = true;
      panel.setPointerCapture(event.pointerId);
      takeOver(valueAt(event.clientX));
    };
    const onPointerMove = (event: PointerEvent) => {
      if (dragging) takeOver(valueAt(event.clientX));
    };
    const endDrag = (event: PointerEvent) => {
      dragging = false;
      if (panel.hasPointerCapture(event.pointerId)) panel.releasePointerCapture(event.pointerId);
    };

    input.addEventListener("input", onInput);
    panel.addEventListener("pointerdown", onPointerDown);
    panel.addEventListener("pointermove", onPointerMove);
    panel.addEventListener("pointerup", endDrag);
    panel.addEventListener("pointercancel", endDrag);

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      trigger = ScrollTrigger.create({
        trigger: panel,
        start: "top 80%",
        end: "bottom 40%",
        scrub: 0.6,
        onUpdate: (self) => setReveal(START + self.progress * (END - START)),
      });
      setReveal(START + trigger.progress * (END - START));

      return () => {
        trigger = null;
      };
    });

    return () => {
      input.removeEventListener("input", onInput);
      panel.removeEventListener("pointerdown", onPointerDown);
      panel.removeEventListener("pointermove", onPointerMove);
      panel.removeEventListener("pointerup", endDrag);
      panel.removeEventListener("pointercancel", endDrag);
      mm.revert();
    };
  }, []);

  return (
    <div className={styles.recipe}>
      <div ref={panelRef} className={styles.recipePanel} style={{ "--reveal": RESTING } as CSSProperties}>
        <div className={styles.recipeRow}>
          <div className={`${styles.recipeCell} ${styles.recipeHead}`}>
            <span className={styles.recipeTicket}>Recipe Nº 01</span>
            <span className={styles.recipeHeadTitle}>How I make anything</span>
          </div>
          <div className={`${styles.codeCell} ${styles.codeHead}`} aria-hidden="true">
            <span className={styles.codeDots}>
              <i />
              <i />
              <i />
            </span>
            <span className={styles.codeFile}>how-i-build.ts</span>
          </div>
        </div>

        <ol className={styles.recipeList}>
          {RECIPE_STEPS.map((step, index) => {
            const number = String(index + 1).padStart(2, "0");
            return (
              <li className={styles.recipeRow} key={step.kitchen}>
                <div className={styles.recipeCell}>
                  <span className={styles.recipeIndex} aria-hidden="true">{number}</span>
                  <span className={styles.recipeText}>
                    <strong className={styles.recipeStep}>{step.kitchen}</strong>
                    <span className={styles.recipeLine}>{step.kitchenLine}</span>
                    <span className={styles.srOnly}> In code: {step.dev}</span>
                  </span>
                </div>
                <div className={styles.codeCell} aria-hidden="true">
                  <span className={styles.codeIndex}>{number}</span>
                  <span className={styles.recipeText}>
                    <span className={styles.codeComment}>{`// ${step.dev}`}</span>
                    <code className={styles.codeLine}>
                      {step.code.map((token, tokenIndex) => (
                        <span className={styles[`tok_${token.kind}`]} key={tokenIndex}>
                          {token.text}
                        </span>
                      ))}
                    </code>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        <div className={styles.recipeHandle} aria-hidden="true">
          <span className={styles.recipeKnob}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 7l-5 5 5 5M14 7l5 5-5 5" />
            </svg>
          </span>
        </div>
      </div>

      <div className={styles.recipeControl}>
        <span id={labelId} className={styles.srOnly}>
          Blend the recipe into code
        </span>
        <span className={styles.recipeControlLabel} aria-hidden="true">Code</span>
        <input
          ref={inputRef}
          className={styles.recipeRange}
          type="range"
          min={0}
          max={100}
          step={1}
          defaultValue={RESTING}
          aria-labelledby={labelId}
          aria-valuetext={valueText(RESTING)}
        />
        <span className={styles.recipeControlLabel} aria-hidden="true">Recipe</span>
      </div>
      <p className={styles.recipeHint}>Drag across the card, use the slider, or keep scrolling.</p>
    </div>
  );
}
