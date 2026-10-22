"use client";

import gsap from "gsap";
import { Delete, X } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import {
  MAX_GUESSES,
  WORD_LENGTH,
  answerForDay,
  evaluateGuess,
  formatCountdown,
  keyboardStates,
  loadGame,
  loadStats,
  manilaDayNumber,
  msUntilNextDay,
  puzzleNumber,
  recordResult,
  saveGame,
  statusFor,
  unpackWords,
  visibleStreak,
} from "./wordbreakLogic";
import type { SavedGame, Stats, TileState } from "./wordbreakLogic";
import styles from "./WordBreak.module.css";

type Words = { answers: string; valid: Set<string> };

// Survives closing the modal, so reopening never re-parses the list.
let wordsCache: Words | null = null;

const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
/** Must match the flip timing in WordBreak.module.css. */
const FLIP_STAGGER_MS = 260;
const FLIP_MS = 520;
const REVEAL_MS = FLIP_STAGGER_MS * (WORD_LENGTH - 1) + FLIP_MS;
const WIN_LINES = ["First try — unreal!", "Brilliant!", "So sharp!", "Lovely work!", "Nicely done!", "Made it, just!"];
const STATE_LABEL: Record<TileState, string> = {
  correct: "correct spot",
  present: "in the word, wrong spot",
  absent: "not in the word",
};

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// On-screen keys never take focus on click, so a physical Enter always submits the guess.
const keepFocus = (event: MouseEvent) => event.preventDefault();

type Props = { titleId: string; descriptionId: string; onClose: () => void };

export default function WordBreakGame({ titleId, descriptionId, onClose }: Props) {
  const [words, setWords] = useState<Words | null>(() => wordsCache);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const [game, setGame] = useState<SavedGame>(() => loadGame(manilaDayNumber()));
  const [stats, setStats] = useState<Stats>(() => loadStats());
  const [revealRow, setRevealRow] = useState<number | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const timers = useRef<number[]>([]);

  const answer = words ? answerForDay(game.day, words.answers) : null;
  const evaluations = useMemo(
    () => (answer ? game.guesses.map((guess) => evaluateGuess(guess, answer)) : []),
    [answer, game.guesses]
  );
  const status = answer ? statusFor(game.guesses, answer) : "playing";
  const revealing = revealRow !== null;
  // The keyboard learns a row's colours only once its tiles have finished flipping.
  const settledRows = revealing ? revealRow : evaluations.length;
  const keyStates = useMemo(
    () => keyboardStates(game.guesses.slice(0, settledRows), evaluations.slice(0, settledRows)),
    [game.guesses, evaluations, settledRows]
  );
  const finished = status !== "playing" && !revealing;
  const streak = visibleStreak(stats, game.day);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // Input reads these refs, not render state, so keys pressed faster than React re-renders
  // never act on a stale board (e.g. a double Enter can't submit twice or interrupt a reveal).
  const gameRef = useRef(game);
  const busyRef = useRef(false);

  const commit = (next: SavedGame) => {
    gameRef.current = next;
    setGame(next);
    saveGame(next);
  };

  const showToast = (text: string) => {
    const id = Date.now();
    setToast({ id, text });
    later(() => setToast((current) => (current?.id === id ? null : current)), 1500);
  };

  const reject = (text: string) => {
    showToast(text);
    setShakeCount((count) => count + 1);
    setShaking(true);
    later(() => setShaking(false), 450);
  };

  const submit = (current: SavedGame, answer: string, valid: Set<string>) => {
    const guess = current.draft;
    if (guess.length < WORD_LENGTH) return reject("Not enough letters");
    if (!valid.has(guess)) return reject("Not in word list");

    const guesses = [...current.guesses, guess];
    const row = guesses.length - 1;
    const result = statusFor(guesses, answer);
    commit({ day: current.day, guesses, draft: "" });
    // Re-read storage so another open tab's result is never overwritten or double-counted.
    if (result !== "playing") setStats(recordResult(loadStats(), current.day, result === "won"));

    const evaluation = evaluateGuess(guess, answer);
    busyRef.current = true;
    setRevealRow(row);
    later(() => {
      busyRef.current = false;
      setRevealRow(null);
      const spoken = evaluation.map((state, i) => `${guess[i].toUpperCase()} ${STATE_LABEL[state]}`).join(", ");
      const outcome =
        result === "won"
          ? ` ${WIN_LINES[row]} Solved in ${row + 1}.`
          : result === "lost"
            ? ` The word was ${answer.toUpperCase()}.`
            : "";
      setAnnouncement(`${spoken}.${outcome}`);
      if (result === "won" && !reducedMotion()) {
        setCelebrating(true);
        later(() => setCelebrating(false), 2200);
      }
    }, reducedMotion() ? 0 : REVEAL_MS);
  };

  const handleKey = (key: string) => {
    const current = gameRef.current;
    if (!words || busyRef.current) return;
    const todaysAnswer = answerForDay(current.day, words.answers);
    if (statusFor(current.guesses, todaysAnswer) !== "playing") return;

    if (key === "enter") submit(current, todaysAnswer, words.valid);
    else if (key === "backspace") {
      if (current.draft) commit({ ...current, draft: current.draft.slice(0, -1) });
    } else if (current.draft.length < WORD_LENGTH) {
      commit({ ...current, draft: current.draft + key });
    }
  };

  // The document listener is attached once; it always calls the latest handler.
  const handleKeyRef = useRef(handleKey);
  useLayoutEffect(() => {
    handleKeyRef.current = handleKey;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Enter") {
        // A keyboard-focused button (close, retry, a tabbed-to key) keeps its own Enter.
        if (event.target instanceof HTMLButtonElement || event.repeat) return;
        event.preventDefault();
        handleKeyRef.current("enter");
      } else if (event.key === "Backspace") {
        event.preventDefault();
        handleKeyRef.current("backspace");
      } else if (/^[a-z]$/i.test(event.key)) {
        handleKeyRef.current(event.key.toLowerCase());
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Word list: a lazy chunk, fetched on first open (usually already warmed by hovering the "W").
  useEffect(() => {
    if (words) return;
    let alive = true;
    import("./words")
      .then(({ ANSWERS, VALID }) => {
        wordsCache = { answers: ANSWERS, valid: unpackWords(VALID) };
        if (alive) setWords(wordsCache);
      })
      .catch(() => {
        if (alive) setLoadFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [words, loadAttempt]);

  // Midnight in Manila brings a new word — even with the dialog open, or a tab left in the background.
  useEffect(() => {
    let timer = 0;
    const check = () => {
      window.clearTimeout(timer);
      const today = manilaDayNumber();
      if (today !== game.day) {
        timers.current.forEach((id) => window.clearTimeout(id));
        timers.current.length = 0;
        setRevealRow(null);
        setCelebrating(false);
        setShaking(false);
        setToast(null);
        setAnnouncement("");
        busyRef.current = false;
        gameRef.current = loadGame(today);
        setGame(gameRef.current);
        setStats(loadStats());
        return;
      }
      timer = window.setTimeout(check, msUntilNextDay() + 500);
    };

    timer = window.setTimeout(check, msUntilNextDay() + 500);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [game.day]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const currentRow = status === "playing" ? game.guesses.length : -1;
  const winningRow = status === "won" ? game.guesses.length - 1 : -1;

  return (
    <>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>
            <span aria-hidden="true">✦</span> No. {puzzleNumber(game.day)}
          </p>
          <h2 id={titleId} className={styles.title}>
            A Little Word Break
          </h2>
          <p id={descriptionId} className={styles.subtitle}>
            One word. Every day.
          </p>
        </div>
        <button type="button" className={styles.close} aria-label="Close word game" onClick={onClose}>
          <X size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </header>

      <div className={styles.stage}>
        <div className={styles.toastSlot} aria-live="polite">
          {toast && (
            <p key={toast.id} className={styles.toast}>
              {toast.text}
            </p>
          )}
        </div>

        <div className={styles.board} role="group" aria-label="Guesses">
          {Array.from({ length: MAX_GUESSES }, (_, row) => {
            const submitted = row < game.guesses.length;
            const isCurrent = row === currentRow;
            const letters = submitted ? game.guesses[row] : isCurrent ? game.draft : "";
            const evaluation = submitted ? evaluations[row] : undefined;
            const flipping = row === revealRow;
            const hopping = celebrating && row === winningRow;
            const label =
              evaluation && !flipping
                ? `Guess ${row + 1}: ${evaluation.map((state, i) => `${letters[i].toUpperCase()} ${STATE_LABEL[state]}`).join(", ")}`
                : `Guess ${row + 1}: ${letters ? letters.toUpperCase().split("").join(" ") : "empty"}`;

            return (
              <div
                // The typing row remounts on each rejected guess so the shake can replay.
                key={isCurrent ? `current-${shakeCount}` : row}
                className={cx(styles.row, isCurrent && shaking && styles.shake)}
                role="group"
                aria-label={label}
              >
                {Array.from({ length: WORD_LENGTH }, (_, i) => {
                  const letter = letters[i] ?? "";
                  const state = evaluation?.[i];
                  return (
                    <span
                      key={i}
                      className={cx(
                        styles.tile,
                        letter && styles.filled,
                        isCurrent && letter && styles.typing,
                        state && styles[state],
                        flipping && styles.flip,
                        hopping && styles.hop
                      )}
                      style={{ "--i": i } as CSSProperties}
                      aria-hidden="true"
                    >
                      {letter}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>

        {celebrating && <Celebration />}
      </div>

      {loadFailed && !words ? (
        <div className={styles.result}>
          <p className={styles.resultText}>Today&rsquo;s word didn&rsquo;t load. Check your connection.</p>
          <button
            type="button"
            className="ui-btn ui-btn--secondary ui-btn--sm"
            onClick={() => {
              setLoadFailed(false);
              setLoadAttempt((n) => n + 1);
            }}
          >
            Try again
          </button>
        </div>
      ) : finished ? (
        <div className={styles.result}>
          <p className={styles.resultTitle}>{status === "won" ? WIN_LINES[game.guesses.length - 1] : "So close."}</p>
          <p className={styles.resultText}>
            {status === "won" ? (
              <>
                Solved in <strong>{game.guesses.length}</strong>/{MAX_GUESSES}
              </>
            ) : (
              <>
                Today&rsquo;s word was <strong className={styles.answer}>{answer}</strong>
              </>
            )}
          </p>
          <dl className={styles.stats}>
            <div>
              <dt>Played</dt>
              <dd>{stats.played}</dd>
            </div>
            <div>
              <dt>Streak</dt>
              <dd>{streak}</dd>
            </div>
            <div>
              <dt>Best</dt>
              <dd>{stats.maxStreak}</dd>
            </div>
          </dl>
          <p className={styles.next}>
            Next word in <Countdown />
          </p>
        </div>
      ) : (
        <>
          <div className={styles.keyboard} role="group" aria-label="Keyboard">
            {KEY_ROWS.map((keys, row) => (
              <div className={styles.keyRow} key={keys}>
                {row === 2 && (
                  <button
                    type="button"
                    className={cx(styles.key, styles.keyWide)}
                    onMouseDown={keepFocus}
                    onClick={() => handleKey("enter")}
                  >
                    Enter
                  </button>
                )}
                {[...keys].map((key) => {
                  const state = keyStates[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      className={cx(styles.key, state && styles[state])}
                      aria-label={state ? `${key.toUpperCase()}, ${STATE_LABEL[state]}` : key.toUpperCase()}
                      onMouseDown={keepFocus}
                      onClick={() => handleKey(key)}
                    >
                      {key}
                    </button>
                  );
                })}
                {row === 2 && (
                  <button
                    type="button"
                    className={cx(styles.key, styles.keyWide)}
                    aria-label="Delete letter"
                    onMouseDown={keepFocus}
                    onClick={() => handleKey("backspace")}
                  >
                    <Delete size={18} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className={styles.meta}>
            Played {stats.played} <span aria-hidden="true">·</span> Streak {streak}
          </p>
        </>
      )}

      <p className={styles.srOnly} aria-live="polite">
        {announcement}
      </p>
    </>
  );
}

function Countdown() {
  const [ms, setMs] = useState(() => msUntilNextDay());

  useEffect(() => {
    const id = window.setInterval(() => setMs(msUntilNextDay()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <time className={styles.countdown} aria-label="until 12:00 AM Philippine time">
      {formatCountdown(ms)}
    </time>
  );
}

const BURST_SIZE = 18;

/** A small burst of hearts and sparkles over the board on a win. */
function Celebration() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(root.children).forEach((particle, i) => {
        const angle = (i / BURST_SIZE) * Math.PI * 2 + gsap.utils.random(-0.25, 0.25);
        const distance = gsap.utils.random(80, 150);
        gsap
          .timeline()
          .fromTo(
            particle,
            { x: 0, y: 0, scale: 0, rotation: 0, opacity: 1 },
            {
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance * 0.75 - 24,
              scale: gsap.utils.random(0.7, 1.15),
              rotation: gsap.utils.random(-70, 70),
              duration: 0.7,
              ease: "power3.out",
            }
          )
          .to(particle, { y: "+=46", opacity: 0, duration: 0.8, ease: "power1.in" });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={styles.burst} aria-hidden="true">
      {Array.from({ length: BURST_SIZE }, (_, i) => (
        <span key={i}>{i % 3 === 0 ? "✦" : "♥"}</span>
      ))}
    </div>
  );
}
