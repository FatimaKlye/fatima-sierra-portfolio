/** The chosen theme lives on <html data-theme>; every themed style keys off that attribute. */
export const THEME_ATTR = "data-theme";
export const THEME_STORAGE_KEY = "fs-theme";
export const THEME_SYSTEM_QUERY = "(prefers-color-scheme: dark)";

/**
 * Runs synchronously in <head>, before first paint, so the page never flashes the wrong theme.
 * A saved choice wins; otherwise the visitor's system preference decides.
 */
export const THEME_SCRIPT = `(function(){var t;try{t=window.localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}if(t!=="light"&&t!=="dark"){try{t=window.matchMedia("${THEME_SYSTEM_QUERY}").matches?"dark":"light"}catch(e){t="light"}}document.documentElement.setAttribute("${THEME_ATTR}",t)})();`;
