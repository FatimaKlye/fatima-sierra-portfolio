/** Pure game rules for A Little Word Break — no React, no DOM, so they stay easy to reason about. */

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
export const TIME_ZONE = "Asia/Manila";

export type TileState = "correct" | "present" | "absent";
export type GameStatus = "playing" | "won" | "lost";

/** Puzzle #1 is 1 Jan 2026 (Manila). Changing this shifts every day's answer — leave it fixed. */
const START_DAY = Date.UTC(2026, 0, 1) / 86_400_000;
const DAY_MS = 86_400_000;

const manilaClock = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function manilaParts(now: Date) {
  const parts: Record<string, number> = {};
  for (const { type, value } of manilaClock.formatToParts(now)) {
    if (type !== "literal") parts[type] = Number(value);
  }
  return parts as Record<"year" | "month" | "day" | "hour" | "minute" | "second", number>;
}

/** Whole days since the Unix epoch on the Manila calendar — the same number for every visitor. */
export function manilaDayNumber(now = new Date()): number {
  const { year, month, day } = manilaParts(now);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

/** Milliseconds until the next 12:00 AM in Manila (no DST there, so every day is exactly 24h). */
export function msUntilNextDay(now = new Date()): number {
  const { hour, minute, second } = manilaParts(now);
  const elapsed = ((hour * 60 + minute) * 60 + second) * 1000 + now.getMilliseconds();
  return Math.max(0, DAY_MS - elapsed);
}

/** 1-based puzzle number shown to the player. */
export function puzzleNumber(day: number): number {
  return day - START_DAY + 1;
}

/** Deterministic: the answer depends only on the Manila date, never on the visitor or a refresh. */
export function answerForDay(day: number, answers: string): string {
  const count = answers.length / WORD_LENGTH;
  const index = (((day - START_DAY) % count) + count) % count;
  return answers.slice(index * WORD_LENGTH, index * WORD_LENGTH + WORD_LENGTH);
}

/** Packed word string → Set for O(1) guess validation. */
export function unpackWords(packed: string): Set<string> {
  const words = new Set<string>();
  for (let i = 0; i < packed.length; i += WORD_LENGTH) words.add(packed.slice(i, i + WORD_LENGTH));
  return words;
}

/**
 * Two passes so repeated letters score like the classic game: exact matches claim their letters
 * first, then misplaced letters are marked "present" only while unclaimed copies remain.
 * e.g. answer ABBEY, guess BABES → present, present, correct, correct, absent.
 */
export function evaluateGuess(guess: string, answer: string): TileState[] {
  const result: TileState[] = Array(WORD_LENGTH).fill("absent");
  const remaining = new Map<string, number>();

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) result[i] = "correct";
    else remaining.set(answer[i], (remaining.get(answer[i]) ?? 0) + 1);
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    const left = remaining.get(guess[i]) ?? 0;
    if (left > 0) {
      result[i] = "present";
      remaining.set(guess[i], left - 1);
    }
  }

  return result;
}

const RANK: Record<TileState, number> = { absent: 0, present: 1, correct: 2 };

/** Best-known state per letter for the on-screen keyboard (correct beats present beats absent). */
export function keyboardStates(guesses: string[], evaluations: TileState[][]): Record<string, TileState> {
  const states: Record<string, TileState> = {};
  guesses.forEach((guess, row) => {
    [...guess].forEach((letter, i) => {
      const next = evaluations[row][i];
      const current = states[letter];
      if (!current || RANK[next] > RANK[current]) states[letter] = next;
    });
  });
  return states;
}

export function statusFor(guesses: string[], answer: string): GameStatus {
  if (guesses.includes(answer)) return "won";
  return guesses.length >= MAX_GUESSES ? "lost" : "playing";
}

/* ---------- Local persistence ---------- */

const GAME_KEY = "wordbreak:game:v1";
const STATS_KEY = "wordbreak:stats:v1";

export type SavedGame = { day: number; guesses: string[]; draft: string };

export type Stats = {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** Manila day of the last win — a streak only survives if the next win is the following day. */
  lastWinDay: number | null;
  /** Manila day last counted, so a finished game is never counted twice (e.g. two open tabs). */
  lastCountedDay: number | null;
};

export const EMPTY_STATS: Stats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastWinDay: null,
  lastCountedDay: null,
};

const isWord = (value: unknown): value is string => typeof value === "string" && /^[a-z]{5}$/.test(value);
const isCount = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0;
const isDayOrNull = (value: unknown): value is number | null => value === null || Number.isInteger(value);

function read(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode / full storage: the game still plays, it just won't remember.
  }
}

/** Today's saved progress, or a fresh board if the save is from another day or malformed. */
export function loadGame(day: number): SavedGame {
  const saved = read(GAME_KEY) as Partial<SavedGame> | null;
  if (
    saved &&
    saved.day === day &&
    Array.isArray(saved.guesses) &&
    saved.guesses.length <= MAX_GUESSES &&
    saved.guesses.every(isWord)
  ) {
    const draft = typeof saved.draft === "string" && /^[a-z]{0,5}$/.test(saved.draft) ? saved.draft : "";
    return { day, guesses: saved.guesses, draft };
  }
  return { day, guesses: [], draft: "" };
}

export function saveGame(game: SavedGame) {
  write(GAME_KEY, game);
}

export function loadStats(): Stats {
  const saved = read(STATS_KEY) as Partial<Stats> | null;
  if (
    saved &&
    isCount(saved.played) &&
    isCount(saved.wins) &&
    isCount(saved.currentStreak) &&
    isCount(saved.maxStreak) &&
    isDayOrNull(saved.lastWinDay) &&
    isDayOrNull(saved.lastCountedDay)
  ) {
    return saved as Stats;
  }
  return EMPTY_STATS;
}

/** Records a finished game once per day and returns the updated stats. */
export function recordResult(stats: Stats, day: number, won: boolean): Stats {
  if (stats.lastCountedDay === day) return stats;

  const currentStreak = won ? (stats.lastWinDay === day - 1 ? stats.currentStreak + 1 : 1) : 0;
  const next: Stats = {
    played: stats.played + 1,
    wins: stats.wins + (won ? 1 : 0),
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    lastWinDay: won ? day : stats.lastWinDay,
    lastCountedDay: day,
  };
  write(STATS_KEY, next);
  return next;
}

/** A streak is broken by a missed day too, not only by a loss. */
export function visibleStreak(stats: Stats, today: number): number {
  return stats.lastWinDay !== null && stats.lastWinDay >= today - 1 ? stats.currentStreak : 0;
}

export function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
