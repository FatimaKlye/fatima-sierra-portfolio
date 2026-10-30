"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { canReloadForNewBuild, isChunkLoadError, reloadForNewBuild } from "@/lib/chunkError";

/**
 * Route-level safety net: if a page throws while rendering, the visitor gets this instead of a
 * blank screen. The header, jukebox and footer live in the root layout above it, so the music
 * keeps playing and every other page is still one click away.
 *
 * A stale-build chunk error (a tab left open across a deploy) isn't a broken page: it reloads
 * once onto the current build, showing a quiet "updating" note instead of the error. `reset()`
 * can't fix that case — the old file is gone — so "Try again" does a full load for it too.
 */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const stale = isChunkLoadError(error);
  const [reloading] = useState(() => stale && canReloadForNewBuild());

  useEffect(() => {
    console.error(error);
    if (reloading) reloadForNewBuild();
  }, [error, reloading]);

  if (reloading) {
    return (
      <main style={{ display: "grid", minHeight: "70vh", placeItems: "center", padding: "64px 20px" }}>
        <p role="status" style={{ margin: 0, color: "var(--color-text-muted)" }}>
          Loading the latest version…
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        display: "grid",
        minHeight: "70vh",
        placeItems: "center",
        padding: "64px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <p
          style={{
            margin: 0,
            color: "var(--color-primary)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          Something slipped
        </p>
        <h1 style={{ margin: "14px 0 0", color: "var(--color-text-primary)", fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1.1 }}>
          This page didn&apos;t load properly.
        </h1>
        <p style={{ margin: "16px 0 0", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
          Try it again — or head back home while I take a look.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 28 }}>
          <button type="button" className="ui-btn ui-btn--primary" onClick={stale ? () => window.location.reload() : reset}>
            Try again
          </button>
          <Link className="ui-btn ui-btn--secondary" href="/">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
