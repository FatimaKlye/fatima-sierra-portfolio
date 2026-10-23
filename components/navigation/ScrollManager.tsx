"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Site-wide scroll position on route changes — the one place it is decided.
 *
 *  new page (link, button, router.push)   opens at the top
 *  link with a hash ("/skills#tech-stack") lands on that section (Next scrolls it into view,
 *                                          SectionNav re-lands it once fonts and images settle)
 *  browser Back / Forward                  left alone, so the browser restores where the visitor was
 *
 * Next.js already scrolls new pages to the top, but bails when the new page's first element
 * happens to sit inside the viewport, so a short page could open part-way down. The reset here
 * runs in the same commit, before paint and before any ScrollTrigger refresh records a position.
 */

type NavigationKind = "push" | "traverse";

let lastNavigation: NavigationKind = "push";
/** URL a Back/Forward step is heading to, until the route it renders has committed. */
let pendingTraverseHref: string | null = null;

/** How the current route was reached; lets mount-time scroll effects stand down on Back/Forward. */
export function getLastNavigation(): NavigationKind {
  return lastNavigation;
}

export default function ScrollManager() {
  const pathname = usePathname();
  const previousPathRef = useRef(pathname);

  useEffect(() => {
    // Capture phase: runs before Next's own popstate listener renders the restored route.
    const onPopState = () => {
      pendingTraverseHref = window.location.href;
    };
    window.addEventListener("popstate", onPopState, { capture: true });
    return () => window.removeEventListener("popstate", onPopState, { capture: true });
  }, []);

  useLayoutEffect(() => {
    if (previousPathRef.current === pathname) return;
    previousPathRef.current = pathname;

    const traversed = pendingTraverseHref === window.location.href;
    pendingTraverseHref = null;
    lastNavigation = traversed ? "traverse" : "push";

    if (traversed || window.location.hash) return;
    if (window.scrollY !== 0 || window.scrollX !== 0) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
