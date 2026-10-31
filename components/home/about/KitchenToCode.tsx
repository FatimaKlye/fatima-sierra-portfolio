"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ChefHat, CodeXml } from "lucide-react";
import { PROJECTS } from "@/components/projects/projectsData";
import { KITCHEN_PHOTO, MEDALS } from "./aboutStoryData";
import styles from "./KitchenToCode.module.css";

type Token = [text: string, tone?: "kw" | "fn" | "prop" | "str" | "muted"];

/** One row per line: each recipe line sits exactly over the code that replaces it. */
const TITLE = { recipe: "Strawberry cupcakes", code: [["const ", "kw"], ["app = "], ["bake", "fn"], ["({"]] as Token[] };
const ROWS: { qty: string; recipe: string; code: Token[] }[] = [
  { qty: "2 cups", recipe: "Flour", code: [["  base: ", "prop"], ['"Next.js"', "str"], [","]] },
  { qty: "1 cup", recipe: "Sugar", code: [["  sweetener: ", "prop"], ['"TypeScript"', "str"], [","]] },
  { qty: "To finish", recipe: "Pink frosting", code: [["  frosting: ", "prop"], ['"Flutter"', "str"], [","]] },
  { qty: "Fresh", recipe: "Strawberry filling", code: [["  filling: ", "prop"], ['"Supabase"', "str"], [","]] },
  { qty: "A pinch", recipe: "Patience", code: [["}); "], ["// + patience", "muted"]] },
  { qty: "Method", recipe: "Taste, adjust, repeat.", code: [["while ", "kw"], ["(!app.isRight) "], ["taste", "fn"], ["(app);"]] },
];

// Code mode shows real screenshots of the IGNIS SAFE capstone, read from projectsData.
const WEB = PROJECTS.find((project) => project.slug === "ignis-safe-website");
const MOBILE = PROJECTS.find((project) => project.slug === "ignis-safe-mobile");
const WEB_SHOT = WEB?.screenshots?.[0];
const MOBILE_SHOT = MOBILE?.screenshots?.[0];

const SCENE_LABEL = {
  kitchen:
    "A recipe journal page for strawberry cupcakes beside a plated dish" +
    (MEDALS.length ? ` and a note of her gold medals in ${MEDALS.map((medal) => medal.label).join(" and ")}.` : "."),
  code:
    "The same recipe rewritten as source code in an editor, beside screenshots of " +
    [WEB?.title, MOBILE?.title].filter(Boolean).join(" and ") +
    ".",
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const NARROW = "(max-width: 640px)";
const ENTRANCE_FAILSAFE = 4000;

function Tokens({ tokens }: { tokens: Token[] }) {
  return tokens.map(([text, tone], index) => (
    <span key={index} className={tone && styles[tone]}>
      {text}
    </span>
  ));
}

/**
 * The homepage About centrepiece: an editorial kitchen composition — recipe
 * journal, plated dish, medal note — that becomes a developer's workspace. The
 * journal is wiped back to its source code, the plate opens onto the IGNIS SAFE
 * website and the note gives way to the mobile app. Hovering the journal peeks
 * at the code beneath; clicking it (or the switch) makes the change.
 *
 * One paused GSAP timeline holds the whole change and plays forwards or in
 * reverse, so the only React state is the switch itself.
 */
export default function KitchenToCode() {
  const [coded, setCoded] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const journalRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const codedRef = useRef(false);
  const shownRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    const journal = journalRef.current;
    if (!stage || !journal) return;

    const reduceMotion = window.matchMedia(REDUCED_MOTION).matches;
    let entranceObserver: IntersectionObserver | undefined;
    let entranceFailsafe = 0;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(stage);
      const ease = "expo.inOut";

      timelineRef.current = gsap
        .timeline({ paused: true })
        // The editor wipes across the journal, a rose seam riding its edge.
        .to(journal, { "--reveal": 1, duration: 1.15, ease }, 0)
        .fromTo(q("[data-seam]"), { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" }, 0)
        .to(q("[data-seam]"), { opacity: 0, duration: 0.2, ease: "none" }, 0.95)
        .fromTo(q("[data-code-row]"), { x: -14, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.045 }, 0.32)
        // The plate opens through a circular mask onto the website.
        .to(q("[data-plate]"), { "--open": 1, duration: 1.2, ease }, 0.12)
        .fromTo(q("[data-plate-shot]"), { scale: 1.12 }, { scale: 1, duration: 1.3, ease: "power3.out" }, 0.2)
        .to(q("[data-plate-dish]"), { scale: 0.92, duration: 1, ease }, 0.12)
        // The medal note lifts away; the phone rises into its place.
        .to(q("[data-note-copy]"), { yPercent: -10, opacity: 0, duration: 0.45, ease: "power2.in" }, 0.1)
        .to(q("[data-note]"), { "--rise": 1, duration: 1.05, ease }, 0.22)
        .fromTo(q("[data-phone-shot]"), { yPercent: 8 }, { yPercent: 0, duration: 1.1, ease: "power3.out" }, 0.3)
        // Warm linen light cools to the workspace glow; the caption rolls over.
        .to(q("[data-glow-code]"), { opacity: 1, duration: 1.1, ease }, 0)
        .to(q("[data-caption]"), { yPercent: -50, duration: 0.8, ease: "power3.inOut" }, 0.2);

      if (reduceMotion) return;

      const peek = (distance: number, vars: gsap.TweenVars = {}) =>
        gsap.to(journal, { "--peek": `${distance}px`, duration: 0.6, ease: "power3.out", overwrite: "auto", ...vars });

      // Entrance: the journal unmasks from the bottom, then the plate and note settle beside it.
      // Only armed while the stage is still below the fold, so a stage that is already on screen
      // (anchor jump, restored scroll, slow hydration) is never hidden again, and started by an
      // IntersectionObserver rather than a ScrollTrigger: content must never wait on a recorded
      // trigger position (stale after late layout shifts, iOS toolbar resizes) to appear. The
      // switch is never hidden at all.
      if (stage.getBoundingClientRect().top > window.innerHeight && typeof IntersectionObserver !== "undefined") {
        const entrance = gsap
          .timeline({
            paused: true,
            onComplete: () => {
              if (!codedRef.current) peek(36, { delay: 0.3, yoyo: true, repeat: 1, repeatDelay: 0.5, ease: "power2.inOut" });
            },
          })
          .fromTo(journal, { clipPath: "inset(100% 0% 0% 0% round 14px)" }, { clipPath: "inset(0% 0% 0% 0% round 14px)", duration: 1.2, ease: "expo.out", clearProps: "clipPath" })
          .fromTo(q("[data-float]"), { y: 48, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.12, clearProps: "opacity" }, 0.25)
          // Phones see the whole stage at once: a quicker entrance keeps it from reading as empty.
          .timeScale(window.matchMedia(NARROW).matches ? 1.5 : 1);

        let answered = false;
        entranceObserver = new IntersectionObserver(
          ([entry]) => {
            answered = true;
            // Above the viewport counts too: a fast flick can carry the stage past in one frame.
            if (!entry.isIntersecting && entry.boundingClientRect.top >= 0) return;
            entranceObserver?.disconnect();
            entrance.play();
          },
          { rootMargin: "0px 0px -12% 0px" }
        );
        entranceObserver.observe(stage);
        // If the observer never reports, show the composition rather than leave it masked.
        entranceFailsafe = window.setTimeout(() => {
          if (!answered) entrance.progress(1);
        }, ENTRANCE_FAILSAFE);
      }

      if (!window.matchMedia(FINE_POINTER).matches) return;

      const lift = () => {
        if (!codedRef.current) peek(44);
      };
      const settle = () => peek(0, { duration: 0.7, ease: "power3.inOut" });

      // Barely-there depth: the two floating prints drift a few pixels with the pointer.
      const movers = q("[data-float]").map((element) => ({
        depth: Number((element as HTMLElement).dataset.float) || 1,
        x: gsap.quickTo(element, "x", { duration: 1, ease: "power3.out" }),
        y: gsap.quickTo(element, "y", { duration: 1, ease: "power3.out" }),
      }));
      const drift = (event: PointerEvent) => {
        const box = stage.getBoundingClientRect();
        const nx = (event.clientX - box.left) / box.width - 0.5;
        const ny = (event.clientY - box.top) / box.height - 0.5;
        movers.forEach((mover) => {
          mover.x(nx * mover.depth * 8);
          mover.y(ny * mover.depth * 6);
        });
      };
      const rest = () =>
        movers.forEach((mover) => {
          mover.x(0);
          mover.y(0);
        });

      journal.addEventListener("pointerenter", lift);
      journal.addEventListener("pointerleave", settle);
      stage.addEventListener("pointermove", drift);
      stage.addEventListener("pointerleave", rest);
      return () => {
        journal.removeEventListener("pointerenter", lift);
        journal.removeEventListener("pointerleave", settle);
        stage.removeEventListener("pointermove", drift);
        stage.removeEventListener("pointerleave", rest);
      };
    }, stage);

    return () => {
      entranceObserver?.disconnect();
      window.clearTimeout(entranceFailsafe);
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

    gsap.to(journalRef.current, { "--peek": "0px", duration: 0.4, overwrite: "auto" });
    if (coded) timeline.timeScale(1).play();
    else timeline.timeScale(1.25).reverse();
  }, [coded]);

  const toggle = () => setCoded((value) => !value);

  return (
    <div className={styles.stage} ref={stageRef} data-coded={coded ? "" : undefined}>
      <div className={styles.scene} role="img" aria-label={coded ? SCENE_LABEL.code : SCENE_LABEL.kitchen}>
        <span className={styles.glow} />
        <span className={`${styles.glow} ${styles.glowCode}`} data-glow-code />

        {/* Journal ↔ editor: both sheets share one row grid so every line swaps in place. */}
        <div className={styles.journal} ref={journalRef} onClick={toggle}>
          <div className={`${styles.sheet} ${styles.paper}`}>
            <p className={styles.sheetHead}>
              <span>Recipe journal</span>
              <span>Nº 01</span>
            </p>
            <p className={styles.titleRow}>{TITLE.recipe}</p>
            <ol className={styles.rows}>
              {ROWS.map((row) => (
                <li key={row.recipe}>
                  <span className={styles.qty}>{row.qty}</span>
                  <span>{row.recipe}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className={`${styles.sheet} ${styles.editor}`}>
            <p className={styles.sheetHead}>
              <span className={styles.dots}>
                <i />
                <i />
                <i />
              </span>
              <span className={styles.tab}>first-app.ts</span>
            </p>
            <p className={styles.titleRow} data-code-row>
              <span className={styles.ln}>1</span>
              <span>
                <Tokens tokens={TITLE.code} />
              </span>
            </p>
            <ol className={styles.rows}>
              {ROWS.map((row, index) => (
                <li key={row.recipe} data-code-row>
                  <span className={styles.ln}>{index + 2}</span>
                  <span>
                    <Tokens tokens={row.code} />
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <span className={styles.seam} data-seam />
          <span className={styles.hint}>{coded ? "Back to the kitchen" : "Peek at the code"}</span>
        </div>

        {/* Plated dish ↔ website. */}
        <div className={styles.plate} data-plate data-float="1">
          <div className={styles.plateKitchen} data-plate-dish>
            {KITCHEN_PHOTO ? (
              <Image src={KITCHEN_PHOTO.src} alt="" fill sizes="(max-width: 640px) 60vw, 26vw" className={styles.cover} />
            ) : (
              <span className={styles.dish} />
            )}
            <span className={styles.plateCaption}>Made from scratch</span>
          </div>
          {WEB_SHOT && (
            <div className={styles.plateCode}>
              <span className={styles.browserBar}>
                <span className={styles.dots}>
                  <i />
                  <i />
                  <i />
                </span>
                <span>{WEB?.title}</span>
              </span>
              <span className={styles.shotWrap}>
                <Image src={WEB_SHOT.src} alt="" fill sizes="(max-width: 640px) 60vw, 26vw" className={styles.cover} data-plate-shot />
              </span>
            </div>
          )}
        </div>

        {/* Medal note ↔ mobile app. */}
        <div className={styles.note} data-note data-float="1.6">
          <div className={styles.noteCopy} data-note-copy>
            <span className={styles.noteKicker}>{MEDALS.length > 0 ? "Certified" : "Kitchen notes"}</span>
            {MEDALS.length > 0 && (
              <ul className={styles.noteList}>
                {MEDALS.map((medal) => (
                  <li key={medal.label}>{medal.label}</li>
                ))}
              </ul>
            )}
            <span className={styles.noteFoot}>{MEDALS.length > 0 ? "Gold medalist" : "Taste, adjust, repeat."}</span>
          </div>
          {MOBILE_SHOT && (
            <div className={styles.phone}>
              <Image src={MOBILE_SHOT.src} alt="" fill sizes="(max-width: 640px) 30vw, 12vw" className={styles.phoneShot} data-phone-shot />
            </div>
          )}
        </div>
      </div>

      <div className={styles.foot} data-foot>
        <p className={styles.caption} aria-hidden="true">
          <span className={styles.captionTrack} data-caption>
            <span>
              <b>Fig. 01</b> The recipe journal
            </span>
            <span>
              <b>Fig. 02</b> {WEB ? "IGNIS SAFE, web & mobile" : "The workspace"}
            </span>
          </span>
        </p>

        <button type="button" role="switch" aria-checked={coded} aria-label="Code mode" className={styles.switch} onClick={toggle}>
          <span className={styles.indicator} />
          <span className={styles.option} data-option="kitchen">
            <ChefHat strokeWidth={1.6} />
            Kitchen
          </span>
          <span className={styles.option} data-option="code">
            <CodeXml strokeWidth={1.6} />
            Code
          </span>
        </button>
      </div>
    </div>
  );
}
