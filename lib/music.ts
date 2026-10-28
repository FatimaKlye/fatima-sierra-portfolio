"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_TRACK_ID, TRACKS, type CategoryId } from "./musicLibrary";

/*
 * One music player for the whole visit. It lives at module scope, so client-side navigation never
 * restarts or duplicates it, and audible playback only ever starts from a visitor's click. A fresh
 * page load always starts silent: volume, the chosen track, shuffle and repeat are remembered,
 * playback is not.
 *
 * A single <audio> element streams the track (so a four-minute song isn't decoded into memory) and
 * is routed through Web Audio: iOS ignores HTMLMediaElement.volume, so level and fades live on gain
 * nodes, and an analyser feeds the jukebox's soundwave. Reusing the one element also keeps the
 * browser's autoplay permission when the next song starts on its own.
 */

export type MusicStatus = "idle" | "loading" | "playing" | "paused" | "error";
export type RepeatMode = "off" | "all" | "one";
export type PanelState = "closed" | "open" | "minimized";

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  category: CategoryId;
  src: string;
  duration: number;
};

export type MusicState = {
  status: MusicStatus;
  volume: number;
  muted: boolean;
  trackId: string;
  /** Track ids that Next and Previous walk through: the list the current song was picked from. */
  queue: string[];
  shuffle: boolean;
  repeat: RepeatMode;
  panel: PanelState;
  /** The latest problem worth telling the visitor about (blocked playback, a song that won't load). */
  notice: string | null;
};

export type MusicProgress = { current: number; duration: number };

const DEFAULT_VOLUME = 0.35;
const VOLUME_KEY = "music-volume";
const PREFS_KEY = "music-prefs";
const FADE_IN = 0.6;
const FADE_OUT = 0.35;
const RESTART_THRESHOLD = 3; // Previous restarts the song once it's this many seconds in

export const CURATED: Track[] = TRACKS.map((track) => ({
  id: track.id,
  title: track.title,
  artist: track.artist,
  album: track.album,
  category: track.category,
  src: track.src,
  duration: track.duration,
}));
const CURATED_IDS = CURATED.map((track) => track.id);

type Engine = {
  audio: HTMLAudioElement;
  ctx?: AudioContext;
  fade?: GainNode;
  level?: GainNode;
  analyser?: AnalyserNode;
};

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
type HotGlobal = typeof globalThis & { __siteMusicEngine?: Engine };
type Prefs = { trackId?: string; shuffle?: boolean; repeat?: RepeatMode; muted?: boolean };

const SERVER_STATE: MusicState = {
  status: "idle",
  volume: DEFAULT_VOLUME,
  muted: false,
  trackId: DEFAULT_TRACK_ID,
  queue: CURATED_IDS,
  shuffle: false,
  repeat: "all",
  panel: "closed",
  notice: null,
};
const SERVER_PROGRESS: MusicProgress = { current: 0, duration: 0 };

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function readStorage<T>(key: string, parse: (raw: string) => T): T | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? undefined : parse(raw);
  } catch {
    return undefined;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the setting still applies for this visit.
  }
}

function initialState(): MusicState {
  const volume = readStorage(VOLUME_KEY, Number.parseFloat);
  const prefs = readStorage<Prefs>(PREFS_KEY, (raw) => JSON.parse(raw) as Prefs) ?? {};
  return {
    ...SERVER_STATE,
    volume: volume !== undefined && Number.isFinite(volume) ? clamp(volume) : DEFAULT_VOLUME,
    muted: prefs.muted === true,
    trackId: prefs.trackId && CURATED_IDS.includes(prefs.trackId) ? prefs.trackId : DEFAULT_TRACK_ID,
    shuffle: prefs.shuffle === true,
    repeat: prefs.repeat === "off" || prefs.repeat === "one" ? prefs.repeat : "all",
  };
}

let state: MusicState = typeof window === "undefined" ? SERVER_STATE : initialState();
let progress: MusicProgress = SERVER_PROGRESS;
let engine: Engine | null = null;
// Whether the visitor wants sound right now; the element's own events can lag behind it.
let wantsPlay = false;
// Bumped by every play/pause/track change so a slow promise can't override a newer choice.
let generation = 0;
let shuffleHistory: string[] = [];
let panelOpener: HTMLElement | null = null;
const listeners = new Set<() => void>();
const progressListeners = new Set<() => void>();

// A dev hot-reload re-runs this module; silence the old player so two songs never overlap.
if (typeof window !== "undefined") {
  const hot = globalThis as HotGlobal;
  const stale = hot.__siteMusicEngine;
  if (stale) {
    stale.audio.pause();
    stale.audio.removeAttribute("src");
    stale.ctx?.close().catch(() => {});
  }
  hot.__siteMusicEngine = undefined;
}

function setState(patch: Partial<MusicState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function setProgress(next: MusicProgress) {
  if (next.current === progress.current && next.duration === progress.duration) return;
  progress = next;
  progressListeners.forEach((listener) => listener());
}

function savePrefs() {
  const prefs: Prefs = { trackId: state.trackId, shuffle: state.shuffle, repeat: state.repeat, muted: state.muted };
  writeStorage(PREFS_KEY, JSON.stringify(prefs));
}

export function findTrack(id: string): Track | undefined {
  return CURATED.find((track) => track.id === id);
}

export function getCurrentTrack(): Track {
  return findTrack(state.trackId) ?? CURATED[0];
}

/* Engine ------------------------------------------------------------------ */

function getEngine(): Engine {
  if (engine) return engine;
  const audio = new Audio();
  audio.preload = "metadata";
  audio.addEventListener("timeupdate", syncProgress);
  audio.addEventListener("durationchange", syncProgress);
  audio.addEventListener("seeked", syncProgress);
  audio.addEventListener("emptied", syncProgress);
  audio.addEventListener("playing", () => {
    if (wantsPlay) setState({ status: "playing", notice: null });
    syncMediaSession();
  });
  audio.addEventListener("waiting", () => {
    if (wantsPlay) setState({ status: "loading" });
  });
  // Paused from outside (headphones unplugged, another app taking audio): reflect it. A pause
  // queued by a track switch arrives after the new play() and finds the element playing again.
  audio.addEventListener("pause", () => {
    if (wantsPlay && audio.paused && !audio.ended) {
      wantsPlay = false;
      setState({ status: "paused" });
    }
  });
  audio.addEventListener("ended", handleEnded);
  audio.addEventListener("error", handleError);

  engine = { audio };
  (globalThis as HotGlobal).__siteMusicEngine = engine;
  setupMediaSession();
  return engine;
}

/** Builds the Web Audio graph on the first play. Without Web Audio, element volume is the fallback. */
function ensureGraph(current: Engine) {
  if (current.ctx) return;
  const Ctx = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!Ctx) return;
  try {
    const ctx = new Ctx();
    const source = ctx.createMediaElementSource(current.audio);
    const fade = ctx.createGain();
    const level = ctx.createGain();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.78;
    fade.gain.value = 0;
    source.connect(fade).connect(level).connect(analyser).connect(ctx.destination);
    // The system can suspend audio on its own (an iOS call): reflect it.
    ctx.addEventListener("statechange", () => {
      if (ctx.state !== "running" && wantsPlay) pauseMusic();
    });
    Object.assign(current, { ctx, fade, level, analyser });
    applyLevel();
  } catch {
    // Graph refused (very old browser): plain element playback still works.
  }
}

function applyLevel() {
  if (!engine) return;
  const target = state.muted ? 0 : state.volume;
  if (engine.level && engine.ctx) {
    engine.level.gain.setTargetAtTime(target, engine.ctx.currentTime, 0.04);
  } else {
    engine.audio.volume = target;
  }
}

function rampFade(current: Engine, target: number, seconds: number) {
  if (!current.fade || !current.ctx) return;
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

function silence(current: Engine) {
  if (!current.fade || !current.ctx) return;
  current.fade.gain.cancelScheduledValues(current.ctx.currentTime);
  current.fade.gain.setValueAtTime(0, current.ctx.currentTime);
}

function syncProgress() {
  if (!engine) return;
  const { audio } = engine;
  const duration = Number.isFinite(audio.duration) ? audio.duration : getCurrentTrack().duration;
  setProgress({ current: audio.currentTime || 0, duration });
  updatePositionState(audio, duration);
}

function loadTrack(current: Engine, track: Track) {
  if (current.audio.dataset.trackId === track.id) return;
  silence(current);
  current.audio.dataset.trackId = track.id;
  current.audio.src = track.src;
  setProgress({ current: 0, duration: track.duration });
  syncMediaSession();
}

/* Playback ------------------------------------------------------------------ */

function blocked() {
  wantsPlay = false;
  engine?.audio.pause();
  setState({ status: "paused", notice: "Your browser held the music back. Press play to start it." });
}

function start() {
  let current: Engine;
  try {
    current = getEngine();
  } catch {
    setState({ status: "error", notice: "Music isn't supported in this browser." });
    return;
  }
  ensureGraph(current);
  const track = getCurrentTrack();
  loadTrack(current, track);
  if (state.status === "error") current.audio.load(); // a retry after a failed load

  const run = ++generation;
  wantsPlay = true;
  silence(current);
  // resume() must be called inside the click itself to satisfy autoplay policies.
  const resumed = current.ctx && current.ctx.state !== "running" ? current.ctx.resume() : Promise.resolve();
  setState({ status: current.audio.readyState >= 3 ? "playing" : "loading", notice: null });

  Promise.all([resumed, current.audio.play()])
    .then(() => {
      if (run !== generation) return;
      // Without a gesture Safari can leave the context suspended: playing, but silent.
      if (current.ctx && current.ctx.state !== "running") return blocked();
      rampFade(current, 1, FADE_IN);
      setState({ status: "playing" });
      syncMediaSession();
    })
    .catch((error: unknown) => {
      if (run !== generation) return;
      const name = error instanceof DOMException ? error.name : "";
      if (name === "AbortError") return; // superseded by a newer track
      if (name === "NotAllowedError") return blocked();
      // Load failures surface through the element's error event, which explains them.
      if (current.audio.error) return;
      wantsPlay = false;
      setState({ status: "error", notice: "Playback couldn't start. Try again in a moment." });
    });
}

/** Starts (or resumes) the selected track with a fade-in. Call only from a visitor's gesture. */
export function playMusic() {
  if (state.status === "playing" || state.status === "loading") return;
  start();
}

/** Fades out, then pauses, so the song resumes exactly where it left off. */
export function pauseMusic() {
  if (!wantsPlay && state.status !== "playing" && state.status !== "loading") return;
  const run = ++generation;
  wantsPlay = false;
  setState({ status: "paused" });
  syncMediaSession();
  if (!engine) return;
  const current = engine;
  if (!current.fade) {
    current.audio.pause();
    return;
  }
  rampFade(current, 0, FADE_OUT);
  window.setTimeout(() => {
    if (run === generation) current.audio.pause();
  }, FADE_OUT * 1000 + 40);
}

export function toggleMusic() {
  if (state.status === "playing" || state.status === "loading") pauseMusic();
  else playMusic();
}

/** Selects a track and plays it. `queue` is the list it was picked from, for Next and Previous. */
export function playTrack(id: string, queue?: string[]) {
  if (!findTrack(id)) return;
  if (queue?.length) setState({ queue });
  if (id === state.trackId && wantsPlay) return;
  if (id !== state.trackId) {
    setState({ trackId: id, status: state.status === "idle" ? "idle" : "paused" });
    savePrefs();
  }
  start();
}

/** Selects a track without starting it (Next/Previous while paused). */
function selectTrack(id: string) {
  const track = findTrack(id);
  if (!track) return;
  setState({ trackId: id, status: state.status === "error" ? "paused" : state.status, notice: null });
  savePrefs();
  if (engine) loadTrack(engine, track);
  else setProgress({ current: 0, duration: track.duration });
}

function activeQueue(): string[] {
  const queue = state.queue.filter((id) => findTrack(id));
  return queue.length ? queue : CURATED_IDS;
}

function step(id: string, keepPlaying: boolean) {
  if (keepPlaying) playTrack(id);
  else selectTrack(id);
}

/** Next song. `auto` is the end of a song, where Repeat decides whether to stop. */
export function nextTrack(auto = false) {
  const queue = activeQueue();
  const keepPlaying = auto || wantsPlay;
  const index = queue.indexOf(state.trackId);

  if (state.shuffle && queue.length > 1) {
    const others = queue.filter((id) => id !== state.trackId);
    shuffleHistory = [...shuffleHistory.slice(-49), state.trackId];
    step(others[Math.floor(Math.random() * others.length)], keepPlaying);
    return;
  }

  if (index === queue.length - 1 && auto && state.repeat === "off") {
    // End of the list: rest on the first song, ready to go again.
    wantsPlay = false;
    selectTrack(queue[0]);
    setState({ status: "paused" });
    syncMediaSession();
    return;
  }
  step(queue[(index + 1) % queue.length], keepPlaying);
}

/** Restarts the song if it's a few seconds in, otherwise goes back one. */
export function previousTrack() {
  if (engine && engine.audio.currentTime > RESTART_THRESHOLD) {
    seekTo(0);
    return;
  }
  const queue = activeQueue();
  const keepPlaying = wantsPlay;
  if (state.shuffle && shuffleHistory.length) {
    const previous = shuffleHistory.pop()!;
    if (findTrack(previous)) {
      step(previous, keepPlaying);
      return;
    }
  }
  const index = queue.indexOf(state.trackId);
  step(queue[(index - 1 + queue.length) % queue.length], keepPlaying);
}

function handleEnded() {
  if (state.repeat === "one" && engine) {
    engine.audio.currentTime = 0;
    engine.audio.play().catch(blocked);
    return;
  }
  nextTrack(true);
}

function handleError() {
  if (!engine?.audio.error || !engine.audio.getAttribute("src")) return;
  const track = getCurrentTrack();
  wantsPlay = false;
  generation++;
  setState({ status: "error", notice: `“${track.title}” couldn't load. Check your connection and press play to retry.` });
}

export function seekTo(seconds: number) {
  if (!engine) return;
  const { audio } = engine;
  const duration = Number.isFinite(audio.duration) ? audio.duration : progress.duration;
  audio.currentTime = Math.min(Math.max(0, seconds), Math.max(0, duration - 0.25));
  syncProgress();
}

export function setMusicVolume(volume: number) {
  const next = clamp(volume);
  // Dragging the level up from zero is an unmute.
  setState({ volume: next, muted: next === 0 ? state.muted : false });
  writeStorage(VOLUME_KEY, String(next));
  savePrefs();
  applyLevel();
}

export function toggleMute() {
  setState({ muted: !state.muted });
  savePrefs();
  applyLevel();
}

export function toggleShuffle() {
  shuffleHistory = [];
  setState({ shuffle: !state.shuffle });
  savePrefs();
}

export function cycleRepeat() {
  const order: RepeatMode[] = ["all", "one", "off"];
  setState({ repeat: order[(order.indexOf(state.repeat) + 1) % order.length] });
  savePrefs();
}

export function dismissNotice() {
  if (state.notice) setState({ notice: null });
}

/**
 * Warms up the selected track's metadata ahead of a likely click (hover, keyboard focus).
 * No audio context, no sound.
 */
export function preloadMusic() {
  try {
    const current = getEngine();
    if (!current.audio.getAttribute("src")) loadTrack(current, getCurrentTrack());
  } catch {
    // Unsupported browsers find out on the actual click.
  }
}

/** The live analyser for soundwaves, or null before the first play / without Web Audio. */
export function getAnalyser(): AnalyserNode | null {
  return engine?.analyser ?? null;
}

/* Panel --------------------------------------------------------------------- */

export const JUKEBOX_PANEL_ID = "jukebox-panel";

export function openJukebox(opener?: HTMLElement | null) {
  if (opener) panelOpener = opener;
  // Already open: just bring focus to it.
  if (state.panel === "open") document.getElementById(JUKEBOX_PANEL_ID)?.focus({ preventScroll: true });
  else setState({ panel: "open" });
}

export function minimizeJukebox() {
  setState({ panel: "minimized" });
}

export function closeJukebox() {
  setState({ panel: "closed" });
}

/** The control that opened the panel, so focus can go back to it on close. */
export function getPanelOpener(): HTMLElement | null {
  return panelOpener?.isConnected ? panelOpener : null;
}

/* Media Session: lock-screen and hardware media keys ------------------------- */

function setupMediaSession() {
  if (!("mediaSession" in navigator)) return;
  const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
    ["play", () => playMusic()],
    ["pause", () => pauseMusic()],
    ["nexttrack", () => nextTrack()],
    ["previoustrack", () => previousTrack()],
    ["seekto", (details) => details.seekTime !== undefined && seekTo(details.seekTime)],
  ];
  for (const [action, handler] of handlers) {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      // Action not supported here.
    }
  }
}

function syncMediaSession() {
  if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
  const track = getCurrentTrack();
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: [{ src: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    });
    navigator.mediaSession.playbackState = wantsPlay ? "playing" : "paused";
  } catch {
    // Metadata is a nicety.
  }
}

function updatePositionState(audio: HTMLAudioElement, duration: number) {
  if (!("mediaSession" in navigator) || !duration) return;
  try {
    navigator.mediaSession.setPositionState({
      duration,
      playbackRate: audio.playbackRate,
      position: Math.min(audio.currentTime, duration),
    });
  } catch {
    // Older implementations reject position updates.
  }
}

/* React bindings ------------------------------------------------------------- */

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function subscribeProgress(onChange: () => void): () => void {
  progressListeners.add(onChange);
  return () => progressListeners.delete(onChange);
}

/** Current music state. The server can't know saved settings, so hydration starts at the defaults. */
export function useMusic(): MusicState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

/** Playback position, kept apart from useMusic so only progress bars re-render a few times a second. */
export function useMusicProgress(): MusicProgress {
  return useSyncExternalStore(subscribeProgress, () => progress, () => SERVER_PROGRESS);
}
