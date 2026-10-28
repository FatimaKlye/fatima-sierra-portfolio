"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { JUKEBOX_PANEL_ID, closeJukebox, findTrack, openJukebox, preloadMusic, useMusic } from "@/lib/music";
import styles from "./HeroVinyl.module.css";

const SPIN_SECONDS = 7; // one turn at full speed
const SPIN_UP = 0.9; // a little longer than the music's fade-in
const SPIN_DOWN = 0.8; // a touch longer than the fade-out, like a platter coasting to a stop

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The hero's circular "open to work" badge, pressed into a miniature record that opens the site's
 * jukebox. It reads as decoration until hovered; a click opens the player, the disc spins up and
 * coasts down with the music, and a small pill under it says what's playing. Playback itself lives
 * in lib/music, so it carries on across pages and stays in step with the navbar toggle.
 */
export default function HeroVinyl() {
  const { status, panel, trackId } = useMusic();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const discRef = useRef<HTMLSpanElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);
  const spinRef = useRef<gsap.core.Tween | null>(null);
  const firstRun = useRef(true);

  const playing = status === "playing";
  const active = playing || status === "loading";

  const expanded = panel === "open";
  const title = findTrack(trackId)?.title;
  // The title only rides along while music is on, so the resting hover pill stays short.
  const nowLabel =
    status === "loading" ? "Loading" : status === "error" ? "Music unavailable" : active && title ? `Now playing · ${title}` : "Now playing";

  // One endless turn, held at zero speed; playback ramps its timeScale so the disc keeps its angle.
  useEffect(() => {
    const disc = discRef.current;
    if (!disc) return;
    const spin = gsap.to(disc, { rotation: "+=360", duration: SPIN_SECONDS, ease: "none", repeat: -1, paused: true });
    spin.timeScale(0);
    spinRef.current = spin;
    return () => {
      gsap.killTweensOf(spin);
      spin.kill();
      spinRef.current = null;
    };
  }, []);

  useEffect(() => {
    const spin = spinRef.current;
    const arriving = firstRun.current;
    firstRun.current = false;
    if (!spin || reducedMotion()) return;

    if (playing) {
      spin.play();
      // Landing on the page mid-song: the record is already at speed.
      if (arriving) spin.timeScale(1);
      else gsap.to(spin, { timeScale: 1, duration: SPIN_UP, ease: "power1.inOut", overwrite: true });
    } else if (!arriving) {
      gsap.to(spin, {
        timeScale: 0,
        duration: SPIN_DOWN,
        ease: "power2.out",
        overwrite: true,
        onComplete: () => {
          spin.pause();
        },
      });
    }
  }, [playing]);

  const handleClick = () => {
    if (expanded) closeJukebox();
    else openJukebox(buttonRef.current);
    if (reducedMotion()) return;
    if (buttonRef.current) {
      gsap.fromTo(buttonRef.current, { scale: 0.9 }, { scale: 1, duration: 0.8, ease: "elastic.out(1, 0.45)", overwrite: true });
    }
    if (rippleRef.current) {
      gsap.fromTo(
        rippleRef.current,
        { scale: 1, autoAlpha: 0.6 },
        { scale: 1.42, autoAlpha: 0, duration: 0.85, ease: "power2.out", overwrite: true }
      );
    }
  };

  return (
    <div
      className={styles.badge}
      data-status={status}
      data-active={active || undefined}
      data-hero-reveal="badge"
      data-depth="1.8"
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.vinyl}
        aria-label={active && title ? `Jukebox, now playing ${title}` : "Jukebox"}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        aria-controls={JUKEBOX_PANEL_ID}
        data-jukebox-opener
        onClick={handleClick}
        onPointerEnter={preloadMusic}
        onFocus={preloadMusic}
      >
        <span className={styles.halo} aria-hidden="true" />
        <span className={styles.plate} aria-hidden="true" />
        <span ref={discRef} className={styles.disc} aria-hidden="true">
          <span className={styles.grooves} />
          <svg className={styles.ring} viewBox="0 0 120 120" focusable="false">
            <defs>
              <path id="hero-badge-path" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1 -90 0" />
            </defs>
            <text>
              <textPath href="#hero-badge-path" textLength="282" lengthAdjust="spacing">
                WEB &amp; MOBILE DEVELOPER · OPEN TO WORK ·
              </textPath>
            </text>
          </svg>
          <span className={styles.label} />
        </span>
        <span className={styles.sheen} aria-hidden="true" />
        {/* Upright above the turning label: the site's sparkle at rest, a note on hover (open the
            jukebox), a little equaliser while music is on. */}
        <span className={styles.control} aria-hidden="true">
          <svg className={styles.sparkle} viewBox="0 0 24 24" focusable="false">
            <path
              d="M12 0C12.8 7.2 16.8 11.2 24 12C16.8 12.8 12.8 16.8 12 24C11.2 16.8 7.2 12.8 0 12C7.2 11.2 11.2 7.2 12 0Z"
              fill="currentColor"
            />
          </svg>
          <svg className={styles.note} viewBox="0 0 24 24" focusable="false">
            <path d="M9 4.8v9.7a3.4 3.4 0 1 0 2 3.1V8.4l7-1.9v6.1a3.4 3.4 0 1 0 2 3.1V2.6Z" fill="currentColor" />
          </svg>
          <svg className={styles.live} viewBox="0 0 24 24" focusable="false">
            <rect x="4.5" y="9" width="3.6" height="10" rx="1.4" fill="currentColor" />
            <rect x="10.2" y="4" width="3.6" height="15" rx="1.4" fill="currentColor" />
            <rect x="15.9" y="11" width="3.6" height="8" rx="1.4" fill="currentColor" />
          </svg>
        </span>
        <span ref={rippleRef} className={styles.ripple} aria-hidden="true" />
      </button>

      <span className={styles.caption} aria-hidden="true">
        <span className={styles.hint}>{expanded ? "Jukebox open" : "Open jukebox"}</span>
        <span className={styles.now}>
          <span className={styles.bars}>
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className={styles.nowText}>{nowLabel}</span>
        </span>
      </span>
    </div>
  );
}
