"use client";

import gsap from "gsap";
import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, FocusEvent, KeyboardEvent, PointerEvent } from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { setMusicVolume, toggleMusic, useMusic } from "@/lib/music";
import styles from "./MusicToggle.module.css";

const BAR_COUNT = 4;
const REST_SCALE = 0.26; // paused: a quiet, flat line
const STILL_LEVELS = [0.5, 0.9, 0.66, 0.42]; // playing with reduced motion: a frozen equaliser
const TOUCH_IDLE_MS = 3200;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Navbar soundwave tile for the background music. Click plays or pauses; hovering (or keyboard
 * focus, or a tap on touch screens) reveals a small card with the action and a volume slider.
 */
export default function MusicToggle() {
  const { status, volume } = useMusic();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const barsRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const timers = useRef<{ show?: number; hide?: number }>({});
  const inputType = useRef("mouse");
  const labelId = useId();

  const playing = status === "playing";
  const active = playing || status === "loading";
  const percent = Math.round(volume * 100);
  const label =
    status === "loading"
      ? "Loading music…"
      : status === "error"
        ? "Music unavailable — retry"
        : playing
          ? "Pause music"
          : "Play music";
  const VolumeIcon = percent === 0 ? VolumeX : percent < 50 ? Volume1 : Volume2;

  const isTouch = () => inputType.current === "touch" || inputType.current === "pen";

  const clearTimers = () => {
    window.clearTimeout(timers.current.show);
    window.clearTimeout(timers.current.hide);
  };

  const show = (delay = 0) => {
    clearTimers();
    if (delay) timers.current.show = window.setTimeout(() => setOpen(true), delay);
    else setOpen(true);
  };

  const hide = (delay = 0) => {
    clearTimers();
    if (delay) timers.current.hide = window.setTimeout(() => setOpen(false), delay);
    else setOpen(false);
  };

  // Opened by a tap: fold away again once the visitor stops touching it.
  const armTouchIdle = () => {
    if (isTouch()) hide(TOUCH_IDLE_MS);
  };

  // Soundwave bars: they dance only while music plays.
  useEffect(() => {
    const bars = barsRef.current ? Array.from(barsRef.current.children) : [];
    if (!bars.length) return;
    const still = reducedMotion();

    if (playing) {
      if (still) {
        gsap.to(bars, { scaleY: (i: number) => STILL_LEVELS[i], duration: 0.2 });
      } else {
        bars.forEach((bar, i) =>
          gsap.to(bar, {
            scaleY: "random(0.32, 1)",
            duration: "random(0.32, 0.6)",
            ease: "sine.inOut",
            repeat: -1,
            repeatRefresh: true,
            delay: i * 0.07,
          })
        );
      }
    } else if (status === "loading" && !still) {
      gsap.to(bars, { scaleY: 0.62, duration: 0.44, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: 0.11 });
    } else {
      gsap.to(bars, { scaleY: REST_SCALE, duration: still ? 0 : 0.5, ease: "power3.out" });
    }

    // Kill rather than revert, so the next state animates on from wherever the bars are.
    return () => {
      gsap.killTweensOf(bars);
    };
  }, [playing, status]);

  // Close on taps outside the control.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (wrapRef.current?.contains(event.target as Node)) return;
      window.clearTimeout(timers.current.hide);
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    const pending = timers.current;
    const ring = ringRef.current;
    return () => {
      window.clearTimeout(pending.show);
      window.clearTimeout(pending.hide);
      if (ring) gsap.killTweensOf(ring);
    };
  }, []);

  const handleClick = () => {
    const willPlay = !active;
    toggleMusic();

    if (willPlay && ringRef.current && !reducedMotion()) {
      gsap.fromTo(
        ringRef.current,
        { scale: 0.9, opacity: 0.55 },
        { scale: 1.65, opacity: 0, duration: 0.7, ease: "power2.out", overwrite: true }
      );
    }
    if (isTouch()) {
      show();
      armTouchIdle();
    }
  };

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") show(90);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const focused = document.activeElement;
    // Stay up while a keyboard user is working inside it.
    if (focused instanceof HTMLElement && wrapRef.current?.contains(focused) && focused.matches(":focus-visible")) return;
    hide(180);
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target.matches(":focus-visible")) show();
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!wrapRef.current?.contains(event.relatedTarget as Node | null)) hide();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape" || !open) return;
    event.stopPropagation();
    hide();
    buttonRef.current?.focus({ preventScroll: true });
  };

  const handleVolume = (event: ChangeEvent<HTMLInputElement>) => {
    setMusicVolume(Number(event.target.value) / 100);
    armTouchIdle();
  };

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={(event) => {
        inputType.current = event.pointerType;
        if (isTouch()) clearTimers(); // touching the card keeps it open
      }}
      onPointerUp={armTouchIdle}
      onKeyDownCapture={() => {
        inputType.current = "keyboard";
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.toggle}
        data-state={status}
        aria-label="Background music"
        aria-pressed={active}
        aria-describedby={labelId}
        onClick={handleClick}
      >
        <span ref={ringRef} className={styles.ring} aria-hidden="true" />
        <span className={styles.face} aria-hidden="true">
          <span ref={barsRef} className={styles.bars}>
            {Array.from({ length: BAR_COUNT }, (_, i) => (
              <span key={i} className={styles.bar} />
            ))}
          </span>
        </span>
      </button>

      <div className={styles.popover} data-open={open || undefined} role="group" aria-label="Music controls">
        <div className={styles.head}>
          <span id={labelId} className={styles.label}>
            {label}
          </span>
          <span className={styles.value} aria-hidden="true">
            {percent}%
          </span>
        </div>
        <label className={styles.slider}>
          <VolumeIcon className={styles.volumeIcon} size={15} strokeWidth={1.9} aria-hidden="true" />
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={percent}
            onChange={handleVolume}
            aria-label="Music volume"
            aria-valuetext={`${percent}%`}
            style={{ "--fill": `${percent}%` } as CSSProperties}
          />
        </label>
      </div>
    </div>
  );
}
