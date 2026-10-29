"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent } from "react";
import ResumeModal from "./ResumeModal";
import UtilityMenu from "./UtilityMenu";
import styles from "./SiteHeader.module.css";

type NavItem = {
  label: string;
  href: string;
  /** Extra route prefixes that also mark this item active. */
  activeOn?: string[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About Me", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Skills", href: "/skills" },
  { label: "Experience", href: "/experience", activeOn: ["/certifications"] },
  { label: "Contact", href: "/contact" },
];

/** Vercel's background (ISR) regeneration of the homepage renders it as "/index"; both mean Home. */
const normalizePath = (pathname: string) => (pathname === "/index" ? "/" : pathname);

function isActive(item: NavItem, pathname: string): boolean {
  if (item.href === "/") return pathname === "/";
  return [item.href, ...(item.activeOn ?? [])].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const menuId = useId();
  const pathname = normalizePath(usePathname());
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isHome = pathname === "/";

  // The item just clicked takes the highlight at once, while its route is still loading, so a
  // click never leaves the old page and the new one lit together. Cleared when any route commits
  // (adjusted during render, not in an effect).
  const [pending, setPending] = useState<{ from: string; to: string } | null>(null);
  if (pending && pending.from !== pathname) setPending(null);
  const navigating = pending !== null;
  const activePath = pending?.to ?? pathname;

  useEffect(() => {
    if (!menuOpen) return;

    const toggleButton = toggleRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 901px)").matches) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
      toggleButton?.focus();
    };
  }, [menuOpen]);

  const closeMenu = () => {
    // Release the scroll lock first so the smooth scroll that follows isn't blocked.
    document.body.style.overflow = "";
    setMenuOpen(false);
  };

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    closeMenu();
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    // Re-selecting Home on the homepage glides back to the top instead of reloading.
    if (!(item.href === "/" && isHome)) {
      if (item.href !== pathname) setPending({ from: pathname, to: item.href });
      return;
    }

    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    if (window.location.hash) window.history.replaceState(null, "", "/");
  };

  const getAriaCurrent = (item: NavItem): "page" | undefined => (isActive(item, activePath) ? "page" : undefined);

  return (
    <>
      <header className={styles.header} data-site-header>
        {/* Immediate feedback while the next route loads; hidden again the moment it commits. */}
        <span className={styles.progress} data-active={navigating || undefined} aria-hidden="true" />
        <div className={styles.container}>
          <Link
            className={styles.brand}
            href="/"
            aria-label="Fatima Klye Sierra home"
            onClick={(event) => handleNavClick(event, NAV_ITEMS[0])}
          >
            {/* Both marks ship in the markup; CSS shows the one for the current theme, so there's no flash. */}
            <Image
              className={`${styles.brandLogo} ${styles.brandLogoLight}`}
              src="/assets/profile/nav-logo.png"
              alt=""
              width={1494}
              height={591}
              sizes="(max-width: 480px) 106px, (max-width: 900px) 116px, 132px"
              priority
            />
            <Image
              className={`${styles.brandLogo} ${styles.brandLogoDark}`}
              src="/assets/profile/nav-logo-dark.png"
              alt=""
              width={1494}
              height={591}
              sizes="(max-width: 480px) 106px, (max-width: 900px) 116px, 132px"
              priority
            />
          </Link>

          <nav className={styles.desktopNav} aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const current = getAriaCurrent(item);
              return (
                <Link
                  className={current ? styles.active : undefined}
                  aria-current={current}
                  href={item.href}
                  key={item.label}
                  onClick={(event) => handleNavClick(event, item)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.actions}>
            <UtilityMenu />

            <div className={styles.resumeCta}>
              <button type="button" className="ui-btn ui-btn--primary ui-btn--sm" onClick={() => setResumeOpen(true)}>
                Resume
              </button>
            </div>

            <button
              ref={toggleRef}
              type="button"
              className={`${styles.menuToggle}${menuOpen ? ` ${styles.menuToggleOpen}` : ""}`}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise become the containing block of these fixed layers. */}
      {menuOpen && (
        <>
          <button type="button" className={styles.backdrop} aria-label="Close menu" onClick={closeMenu} />
          <aside id={menuId} className={styles.drawer} aria-label="Mobile navigation">
            <button ref={closeRef} type="button" className={styles.drawerClose} aria-label="Close menu" onClick={closeMenu}>
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
            <p className={styles.drawerLabel}>Navigation</p>
            <nav className={styles.drawerNav} aria-label="Mobile primary navigation">
              {NAV_ITEMS.map((item, index) => (
                <Link
                  className={getAriaCurrent(item) ? styles.drawerActive : undefined}
                  aria-current={getAriaCurrent(item)}
                  href={item.href}
                  key={item.label}
                  onClick={(event) => handleNavClick(event, item)}
                >
                  <span>0{index + 1}</span>{item.label}
                </Link>
              ))}
              <button
                type="button"
                className={`ui-btn ui-btn--primary ${styles.drawerResume}`}
                onClick={() => {
                  closeMenu();
                  setResumeOpen(true);
                }}
              >
                Resume
              </button>
            </nav>
          </aside>
        </>
      )}
      <ResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} />
    </>
  );
}
