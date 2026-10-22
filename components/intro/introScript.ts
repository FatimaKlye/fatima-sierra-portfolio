/** Set on <html> while the entrance intro owns the screen (see globals.css for the pre-hydration cover). */
export const INTRO_ATTR = "data-entrance-intro";

const SEEN_KEY = "fs-intro-seen";

/**
 * Runs synchronously in <head>, before first paint, so the homepage never flashes ahead of the
 * intro. The intro plays only when a browsing session *begins* on the bare homepage: deep links,
 * #section links, later reloads and every in-app navigation go straight to content. If storage is
 * unavailable the intro is skipped rather than risk replaying it.
 */
export const INTRO_SCRIPT = `(function(){try{var s=window.sessionStorage;if(s.getItem("${SEEN_KEY}"))return;s.setItem("${SEEN_KEY}","1");var l=window.location;if(l.pathname!=="/"||l.hash)return;var n=window.navigator;if(n.webdriver||/bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(n.userAgent))return;document.documentElement.setAttribute("${INTRO_ATTR}","")}catch(e){}})();`;
