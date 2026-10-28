"use client";

import { useEffect, useRef } from "react";
import { getAnalyser } from "@/lib/music";

const BAR_COUNT = 14;
const REST = 0.14;
// Reduced motion while playing: a still, hand-shaped wave that still reads as "on".
const STILL = [0.3, 0.52, 0.74, 0.58, 0.86, 0.66, 0.44, 0.7, 0.92, 0.6, 0.48, 0.72, 0.4, 0.26];

/**
 * A row of bars that follows the real audio through the player's analyser. It only animates while
 * the music plays and the bars are mounted; at rest it settles into a low line.
 */
export default function Soundwave({ playing, className }: { playing: boolean; className?: string }) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const bars = Array.from(root.children) as HTMLElement[];
    const set = (levels: (i: number) => number) => bars.forEach((bar, i) => bar.style.setProperty("--level", levels(i).toFixed(3)));

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!playing) {
      set(() => REST);
      return;
    }
    if (still) {
      set((i) => STILL[i]);
      return;
    }

    const analyser = getAnalyser();
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let frame = 0;
    let t = 0;
    const tick = () => {
      t += 1;
      if (analyser && data) {
        analyser.getByteFrequencyData(data);
        // Skip the lowest bin (mostly rumble) and spread the rest across the bars.
        const usable = data.length - 4;
        set((i) => {
          const value = data[1 + Math.floor((i / BAR_COUNT) * usable)] / 255;
          return Math.max(REST, Math.min(1, value * 1.15));
        });
      } else {
        // No analyser (Web Audio unavailable): a gentle synthetic wave.
        set((i) => 0.35 + 0.3 * Math.sin(t / 7 + i * 0.7) + 0.15 * Math.sin(t / 3 + i));
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing]);

  return (
    <span ref={rootRef} className={className} aria-hidden="true" data-playing={playing || undefined}>
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <span key={i} />
      ))}
    </span>
  );
}
