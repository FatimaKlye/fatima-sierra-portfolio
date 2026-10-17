"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import styles from "./AboutStory.module.css";

type Photo = { src: string; alt: string; width?: number; height?: number };

/** Frame (width / height) — matches .openingVisual's 4:5 aspect ratio. */
const FRAME_RATIO = 4 / 5;
const DEFAULT_PRINT_RATIO = 4 / 5;

/**
 * Where each extra photo settles, as a share of the 4:5 frame: centre (x, y),
 * width (w), tilt (r) and whether it lands over or behind the portrait.
 * Overhang is mostly to the left (the gap beside the copy) and stays small on
 * the right so prints never reach the page edge or the section nav.
 * Slot 4 is narrower so a tall (9:16) photo there stays clear of the sticker;
 * slot 5 sits left of centre so it never runs under the hint line.
 */
const SLOTS = [
  { x: 2, y: 18, w: 36, r: -8, over: true },
  { x: 88, y: 32, w: 28, r: 7, over: true },
  { x: 82, y: 86, w: 30, r: -5, over: true },
  { x: 76, y: 2, w: 26, r: 10, over: false },
  { x: -6, y: 54, w: 24, r: 6, over: false },
  { x: 40, y: 96, w: 28, r: 3, over: true },
];

const printRatio = (photo: Photo) =>
  photo.width && photo.height ? photo.width / photo.height : DEFAULT_PRINT_RATIO;

/** Pointer travel (px) that reveals one more photo while hovering. */
const REVEAL_DISTANCE = 70;
const FIRST_REVEAL = 2;

type AboutCollageProps = {
  primary: Photo;
  photos: Photo[];
  /** Decorations drawn in the same frame (journey line, sticker). */
  children?: ReactNode;
};

/**
 * The About portrait. Hovering scatters more real photos around it, one more
 * for every short stretch of pointer travel; leaving tidies them back behind
 * the portrait. Touch and keyboard users toggle the same collage with a tap / Enter.
 */
export default function AboutCollage({ primary, photos, children }: AboutCollageProps) {
  const extras = photos.slice(0, SLOTS.length);
  const rootRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || extras.length === 0) return;

    const arch = root.querySelector<HTMLElement>("[data-collage-primary]");
    const slots = Array.from(root.querySelectorAll<HTMLElement>("[data-collage-slot]"));
    const prints = slots.map((slot) => slot.firstElementChild as HTMLElement);
    const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Hidden state: each print tucked behind the portrait's centre.
    // Percentages of the print's own size, so it holds at any frame width;
    // the print's height (as a share of the frame) follows its photo's ratio.
    const tucked = (index: number) => {
      const slot = SLOTS[index];
      const ratio = Number(slots[index].dataset.ratio) || DEFAULT_PRINT_RATIO;
      const height = (slot.w * FRAME_RATIO) / ratio;
      return {
        xPercent: ((50 - slot.x) / slot.w) * 100,
        yPercent: ((50 - slot.y) / height) * 100,
        rotation: 0,
        scale: 0.55,
        opacity: 0,
      };
    };
    prints.forEach((print, index) => gsap.set(print, tucked(index)));

    // Gentle depth drift that follows the pointer while the collage is open.
    const drift = slots.map((slot) => ({
      x: gsap.quickTo(slot, "x", { duration: 0.9, ease: "power3.out" }),
      y: gsap.quickTo(slot, "y", { duration: 0.9, ease: "power3.out" }),
    }));

    let revealed = 0;
    let travel = 0;
    let last: { x: number; y: number } | null = null;
    let lastPointer = "mouse";

    const revealTo = (count: number) => {
      const target = Math.min(count, prints.length);
      if (target <= revealed) return;
      const batch = prints.slice(revealed, target);
      const offset = revealed;
      revealed = target;
      setExpanded(true);

      gsap.killTweensOf(batch);
      if (reducedMotion()) {
        batch.forEach((print, i) => {
          gsap.set(print, { xPercent: 0, yPercent: 0, scale: 1, rotation: SLOTS[offset + i].r });
          gsap.to(print, { opacity: 1, duration: 0.25 });
        });
        return;
      }
      gsap.to(batch, {
        xPercent: 0,
        yPercent: 0,
        scale: 1,
        opacity: 1,
        rotation: (i) => SLOTS[offset + i].r,
        duration: 0.85,
        ease: "expo.out",
        stagger: 0.07,
      });
      if (arch && offset === 0) gsap.to(arch, { scale: 0.95, rotation: -1.5, duration: 0.8, ease: "expo.out" });
    };

    const hideAll = () => {
      if (revealed === 0) return;
      revealed = 0;
      travel = 0;
      last = null;
      setExpanded(false);
      gsap.killTweensOf(prints);
      drift.forEach((d) => {
        d.x(0);
        d.y(0);
      });
      if (reducedMotion()) {
        prints.forEach((print, index) =>
          gsap.to(print, { opacity: 0, duration: 0.2, onComplete: () => gsap.set(print, tucked(index)) })
        );
      } else {
        prints.forEach((print, index) =>
          gsap.to(print, { ...tucked(index), duration: 0.6, ease: "power3.inOut", delay: (prints.length - index) * 0.03 })
        );
      }
      if (arch) gsap.to(arch, { scale: 1, rotation: 0, duration: 0.6, ease: "power3.inOut" });
    };

    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      last = { x: event.clientX, y: event.clientY };
      revealTo(FIRST_REVEAL);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (last) {
        travel += Math.hypot(event.clientX - last.x, event.clientY - last.y);
        if (travel >= REVEAL_DISTANCE) {
          travel = 0;
          revealTo(revealed + 1);
        }
      }
      last = { x: event.clientX, y: event.clientY };

      if (reducedMotion() || revealed === 0) return;
      const box = root.getBoundingClientRect();
      const nx = (event.clientX - box.left) / box.width - 0.5;
      const ny = (event.clientY - box.top) / box.height - 0.5;
      drift.forEach((d, index) => {
        const depth = SLOTS[index].over ? 18 : 9;
        d.x(nx * depth);
        d.y(ny * depth);
      });
    };

    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === "mouse") hideAll();
    };

    const onDown = (event: PointerEvent) => {
      lastPointer = event.pointerType;
    };

    // Taps (and Enter / Space on the button) toggle the whole collage;
    // a mouse click while hovering simply shows the rest.
    const button = root.querySelector<HTMLButtonElement>("[data-collage-toggle]");
    const onClick = (event: MouseEvent) => {
      const fromMouse = event.detail > 0 && lastPointer === "mouse";
      if (fromMouse) revealTo(prints.length);
      else if (revealed > 0) hideAll();
      else revealTo(prints.length);
    };

    // Tapping anywhere else on the page closes an open collage.
    const onOutside = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && !root.contains(event.target as Node)) hideAll();
    };

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    button?.addEventListener("click", onClick);
    document.addEventListener("pointerdown", onOutside);

    return () => {
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      button?.removeEventListener("click", onClick);
      document.removeEventListener("pointerdown", onOutside);
      gsap.killTweensOf([...prints, ...slots]);
      if (arch) gsap.killTweensOf(arch);
    };
  }, [extras.length]);

  return (
    <div
      ref={rootRef}
      className={`${styles.openingVisual} ${extras.length > 0 ? styles.collage : ""}`}
      data-expanded={expanded || undefined}
    >
      {children}

      <div className={styles.portraitArch} data-collage-primary>
        <div className={styles.portraitInner} data-parallax="5">
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            sizes="(max-width: 820px) 78vw, 32vw"
            className={styles.portraitImage}
          />
        </div>
      </div>

      {extras.map((photo, index) => {
        const slot = SLOTS[index];
        const ratio = printRatio(photo);
        return (
          <div
            className={styles.collageSlot}
            data-collage-slot
            data-ratio={ratio}
            key={photo.src}
            style={{ "--x": `${slot.x}%`, "--y": `${slot.y}%`, "--w": `${slot.w}%`, zIndex: slot.over ? 3 : 0 } as CSSProperties}
          >
            <div className={styles.collagePrint} style={{ aspectRatio: ratio }}>
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 820px) 34vw, 180px" />
            </div>
          </div>
        );
      })}

      {extras.length > 0 && (
        <>
          <button
            type="button"
            className={styles.collageToggle}
            data-collage-toggle
            aria-expanded={expanded}
            aria-label={expanded ? "Hide extra photos of Fatima" : `Show ${extras.length} more photos of Fatima`}
          />
          <p className={styles.collageHint} aria-hidden="true">
            <span className={styles.collageHintHover}>Hover to see more of me</span>
            <span className={styles.collageHintTouch}>{expanded ? "Tap to tidy up" : "Tap to see more of me"}</span>
          </p>
        </>
      )}
    </div>
  );
}
