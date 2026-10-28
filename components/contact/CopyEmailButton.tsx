"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyState = "idle" | "copied" | "failed";

/** Copies the address for visitors whose device has no mail app wired to mailto: links. */
export default function CopyEmailButton({ email, className }: { email: string; className?: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setState("idle"), 2200);
  }

  const label = state === "copied" ? "Copied!" : state === "failed" ? "Couldn't copy" : "Copy";

  return (
    <button className={className} type="button" onClick={copy} data-state={state} aria-label="Copy email address">
      {state === "copied" ? (
        <Check size={15} strokeWidth={2.25} aria-hidden="true" />
      ) : (
        <Copy size={15} strokeWidth={1.9} aria-hidden="true" />
      )}
      <span aria-live="polite">{label}</span>
    </button>
  );
}
