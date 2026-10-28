"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_ATTR } from "@/components/intro/introScript";

export interface FairyDustCursorProps {
  colors?: string[];
  characterSet?: string[];
  particleSize?: number;
  particleCount?: number;
  gravity?: number;
  fadeSpeed?: number;
  initialVelocity?: { min: number; max: number };
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  scale: number;
  sprite: HTMLCanvasElement;
}

/* Restraint guards: keep the trail a whisper, not a firework. */
const MAX_PARTICLES = 70;
const SPAWN_DISTANCE = 10; // px the pointer must travel before another burst
const START_ALPHA = 0.85;
const MIN_ALPHA = 0.02;
const FRAME_MS = 1000 / 60; // physics values are tuned per 60fps frame

const ENABLE_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

const TINT_STRENGTH = 0.8; // how much of the emoji's own colour is painted over

/**
 * Pre-renders a sparkle glyph tinted to `color`. Emoji ignore fillStyle, so
 * the colour is painted over the glyph with "source-atop" (which keeps the
 * glyph's own shape and a hint of its shading). Drawing cached sprites each
 * frame is far cheaper than rasterising emoji text.
 */
function createSprite(character: string, color: string, size: number, dpr: number) {
  const box = Math.ceil(size * 1.4 * dpr);
  const canvas = document.createElement("canvas");
  canvas.width = box;
  canvas.height = box;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.font = `${size * dpr}px ${EMOJI_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(character, box / 2, box / 2);

  ctx.globalCompositeOperation = "source-atop";
  ctx.globalAlpha = TINT_STRENGTH;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, box, box);
  return canvas;
}

/**
 * Sparkle trail that drifts off the mouse pointer. Rendered once from the root
 * layout on a fixed, click-through canvas; it is skipped entirely on
 * touch-only devices and for visitors who prefer reduced motion, and the
 * animation loop sleeps whenever no particles are alive.
 */
export default function FairyDustCursor({
  colors = ["#f3bcd3", "#e8a0bf", "#c982a2"],
  characterSet = ["✨", "⭐", "🌟"],
  particleSize = 24,
  particleCount = 2,
  gravity = 0.015,
  fadeSpeed = 0.97,
  initialVelocity = { min: 0.7, max: 2.0 },
}: FairyDustCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia(ENABLE_QUERY);
    const reduced = window.matchMedia(REDUCED_QUERY);
    const sync = () => setEnabled(fine.matches && !reduced.matches);

    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  // Primitive keys so inline array/object props don't restart the effect each render.
  const colorKey = colors.join("|");
  const characterKey = characterSet.join("|");
  const { min: velocityMin, max: velocityMax } = initialVelocity;

  // A colour change (theme switch) only re-tints the sprite cache, and lazily — on the next burst,
  // not inside the switch's own frame. Sparkles already in the air finish in their own tint.
  const colorKeyRef = useRef(colorKey);
  useEffect(() => {
    colorKeyRef.current = colorKey;
  }, [colorKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const characters = characterKey.split("|");
    let dpr = 1;
    let sprites: HTMLCanvasElement[] = [];
    let spritesKey = "";
    const particles: Particle[] = [];
    let frame = 0;
    let lastTime = 0;
    let lastSpawn: { x: number; y: number } | null = null;

    const buildSprites = () => {
      spritesKey = colorKeyRef.current;
      const palette = spritesKey.split("|");
      sprites = characters.flatMap((character) =>
        palette.map((color) => createSprite(character, color, particleSize, dpr))
      );
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      buildSprites();
      particles.length = 0;
    };

    const tick = (time: number) => {
      const step = Math.min(time - (lastTime || time), 50) / FRAME_MS;
      lastTime = time;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += gravity * step;
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.alpha *= Math.pow(fadeSpeed, step);

        if (p.alpha < MIN_ALPHA) {
          particles.splice(i, 1);
          continue;
        }

        const size = p.sprite.width * p.scale * (0.6 + 0.4 * (p.alpha / START_ALPHA));
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(p.sprite, p.x * dpr - size / 2, p.y * dpr - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      if (particles.length) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
        lastTime = 0;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      // The entrance intro covers the screen with its own ink; don't spend frames on hidden sparkles.
      if (document.documentElement.hasAttribute(INTRO_ATTR)) return;
      const { clientX: x, clientY: y } = event;
      if (lastSpawn && Math.hypot(x - lastSpawn.x, y - lastSpawn.y) < SPAWN_DISTANCE) return;
      lastSpawn = { x, y };
      if (spritesKey !== colorKeyRef.current) buildSprites();

      for (let i = 0; i < particleCount && particles.length < MAX_PARTICLES; i++) {
        const speed = velocityMin + Math.random() * (velocityMax - velocityMin);
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * speed,
          vy: -speed * (0.4 + Math.random() * 0.6),
          alpha: START_ALPHA,
          scale: 0.7 + Math.random() * 0.3,
          sprite: sprites[Math.floor(Math.random() * sprites.length)],
        });
      }

      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      lastSpawn = null;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [enabled, characterKey, particleSize, particleCount, gravity, fadeSpeed, velocityMin, velocityMax]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 1200,
      }}
    />
  );
}
