"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import styles from "./WordBreak.module.css";

// The game (and its word list) only loads once someone shows interest — the navbar stays light.
const WordBreakModal = dynamic(() => import("./WordBreakModal"), { ssr: false });

const preload = () => {
  import("./WordBreakModal").catch(() => {});
  import("./words").catch(() => {});
};

/** The navbar's little "W" tile — a hidden daily word game for curious visitors. */
export default function WordBreak() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label="Open A Little Word Break, a daily word game"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="A little word break"
        onPointerEnter={preload}
        onFocus={preload}
        onClick={() => setOpen(true)}
      >
        <span className={styles.triggerFace} aria-hidden="true">
          W
        </span>
      </button>
      {open && <WordBreakModal onClose={close} />}
    </>
  );
}
