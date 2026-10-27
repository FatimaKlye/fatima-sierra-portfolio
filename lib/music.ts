"use client";

import { useSyncExternalStore } from "react";

/*
 * One background-music player for the whole visit. It lives at module scope, so client-side
 * navigation never restarts or duplicates it, and it only ever starts from a visitor's click.
 *
 * Web Audio rather than an <audio> element: iOS ignores HTMLMediaElement.volume (so neither the
 * 15% default nor the fades would work there), and a buffer source loops without a gap.
 */

export type MusicStatus = "idle" | "loading" | "playing" | "paused" | "error";
export type MusicState = { status: MusicStatus; volume: number };

const SRC = "/assets/audio/soft-hours.mp3";
// The file wraps a 128s loop in 1s of pre-roll and post-roll, so looping between these points is
// seamless however a browser handles MP3 encoder padding. Tracks shorter than LOOP_END loop whole.
const LOOP_START = 1;
const LOOP_END = 129;
const DEFAULT_VOLUME = 0.15;
const VOLUME_KEY = "music-volume";
const FADE_IN = 1.4;
const FADE_OUT = 0.7;

type Engine = {
  ctx: AudioContext;
  fade: GainNode;
  level: GainNode;
  buffer?: Promise<AudioBuffer>;
  source?: AudioBufferSourceNode;
};

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
type HotGlobal = typeof globalThis & { __siteMusicEngine?: Engine };

const SERVER_STATE: MusicState = { status: "idle", volume: DEFAULT_VOLUME };

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function readVolume(): number {
  try {
    const value = Number.parseFloat(window.localStorage.getItem(VOLUME_KEY) ?? "");
    return Number.isFinite(value) ? clamp(value) : DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

// Volume is remembered between visits; playback deliberately is not.
let state: MusicState = typeof window === "undefined" ? SERVER_STATE : { status: "idle", volume: readVolume() };
let engine: Engine | null = null;
// Bumped by every play/pause so a slow load or a pending suspend can't override a newer choice.
let generation = 0;
const listeners = new Set<() => void>();

// A dev hot-reload re-runs this module; close the old context so two tracks never overlap.
if (typeof window !== "undefined") {
  const hot = globalThis as HotGlobal;
  hot.__siteMusicEngine?.ctx.close().catch(() => {});
  hot.__siteMusicEngine = undefined;
}

function setState(patch: Partial<MusicState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function getEngine(): Engine {
  if (engine) return engine;
  const Ctx = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!Ctx) throw new Error("Web Audio is not supported");

  const ctx = new Ctx();
  const fade = ctx.createGain();
  const level = ctx.createGain();
  fade.gain.value = 0;
  level.gain.value = state.volume;
  fade.connect(level).connect(ctx.destination);

  // The system can suspend audio on its own (an iOS call, a headphone change): reflect it.
  ctx.addEventListener("statechange", () => {
    if (ctx.state !== "running" && state.status === "playing") setState({ status: "paused" });
  });

  engine = { ctx, fade, level };
  (globalThis as HotGlobal).__siteMusicEngine = engine;
  return engine;
}

function loadBuffer(current: Engine): Promise<AudioBuffer> {
  current.buffer ??= fetch(SRC)
    .then((response) => {
      if (!response.ok) throw new Error(`Music request failed (${response.status})`);
      return response.arrayBuffer();
    })
    .then((bytes) => current.ctx.decodeAudioData(bytes))
    .catch((error: unknown) => {
      current.buffer = undefined; // let the next click retry
      throw error;
    });
  return current.buffer;
}

function startSource(current: Engine, buffer: AudioBuffer) {
  const source = current.ctx.createBufferSource();
  const hasPreRoll = buffer.duration >= LOOP_END;
  source.buffer = buffer;
  source.loop = true;
  if (hasPreRoll) {
    source.loopStart = LOOP_START;
    source.loopEnd = LOOP_END;
  }
  source.connect(current.fade);
  source.start(0, hasPreRoll ? LOOP_START : 0);
  current.source = source;
}

function rampFade(current: Engine, target: number, seconds: number) {
  const gain = current.fade.gain;
  const now = current.ctx.currentTime;
  if (typeof gain.cancelAndHoldAtTime === "function") {
    gain.cancelAndHoldAtTime(now);
  } else {
    const value = gain.value;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(value, now);
  }
  gain.linearRampToValueAtTime(target, now + seconds);
}

/** Starts (or resumes) the music with a fade-in. Call only from a visitor's gesture. */
export function playMusic() {
  if (state.status === "playing" || state.status === "loading") return;

  let current: Engine;
  try {
    current = getEngine();
  } catch {
    setState({ status: "error" });
    return;
  }

  const run = ++generation;
  // After a system interruption the fade is still up; drop it so the resume fades in too.
  if (current.ctx.state !== "running") current.fade.gain.setValueAtTime(0, current.ctx.currentTime);
  // resume() must be called inside the click itself to satisfy autoplay policies.
  const resumed = current.ctx.state === "running" ? Promise.resolve() : current.ctx.resume();
  const ready = current.source ? resumed : Promise.all([resumed, loadBuffer(current)]);
  setState({ status: current.source ? "playing" : "loading" });

  ready
    .then((result) => {
      if (run !== generation) return;
      if (!current.source && Array.isArray(result)) startSource(current, result[1]);
      rampFade(current, 1, FADE_IN);
      setState({ status: "playing" });
    })
    .catch(() => {
      if (run === generation) setState({ status: "error" });
    });
}

/** Fades out, then suspends the audio clock so the track resumes exactly where it left off. */
export function pauseMusic() {
  if (state.status !== "playing" && state.status !== "loading") return;
  const run = ++generation;
  setState({ status: "paused" });
  if (!engine) return;

  const current = engine;
  rampFade(current, 0, FADE_OUT);
  window.setTimeout(() => {
    if (run === generation && current.ctx.state === "running") current.ctx.suspend().catch(() => {});
  }, FADE_OUT * 1000 + 60);
}

export function toggleMusic() {
  if (state.status === "playing" || state.status === "loading") pauseMusic();
  else playMusic();
}

export function setMusicVolume(volume: number) {
  const next = clamp(volume);
  setState({ volume: next });
  try {
    window.localStorage.setItem(VOLUME_KEY, String(next));
  } catch {
    // Private mode or blocked storage: the level still applies for this visit.
  }
  if (engine) engine.level.gain.setTargetAtTime(next, engine.ctx.currentTime, 0.04);
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

/** Current music state. The server can't know the saved volume, so hydration starts at the default. */
export function useMusic(): MusicState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}
