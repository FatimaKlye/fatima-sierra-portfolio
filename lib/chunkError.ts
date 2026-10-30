/**
 * A ChunkLoadError means the browser asked for a JavaScript file from a build that is no longer
 * deployed — a tab left open across a redeploy, navigating client-side to a page whose chunk
 * hashes changed. Nothing is wrong with the page itself; a full load fetches the current build.
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "ChunkLoadError" ||
    /Failed to load chunk|Loading chunk [\w-]+ failed|Loading CSS chunk|Failed to fetch dynamically imported module/i.test(
      error.message
    )
  );
}

const RELOAD_KEY = "chunk-reload";
/** One automatic reload per page within this window, so a genuinely missing file can't loop. */
const RELOAD_WINDOW = 30_000;

const reloadKey = () => `${RELOAD_KEY}:${window.location.pathname}`;

/** Whether this page may still reload itself onto the current build (no recent attempt). */
export function canReloadForNewBuild(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = Number(window.sessionStorage.getItem(reloadKey()));
    return !last || Date.now() - last >= RELOAD_WINDOW;
  } catch {
    // Storage blocked (private mode, etc.): allow the reload — the fresh document loads the
    // current build's chunks, so a stale-build error can't repeat after it.
    return true;
  }
}

/** Reloads the page to pick up the current build, remembering the attempt. */
export function reloadForNewBuild() {
  try {
    window.sessionStorage.setItem(reloadKey(), String(Date.now()));
  } catch {
    // See canReloadForNewBuild.
  }
  window.location.reload();
}
