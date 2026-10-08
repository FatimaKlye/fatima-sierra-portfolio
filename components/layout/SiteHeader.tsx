"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent } from "react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import ResumeModal from "./ResumeModal";
import styles from "./SiteHeader.module.css";

type NavItem = {
  label: string;
  href: string;
  /** id of the homepage section this item scrolls to / is highlighted for. */
  section: string;
  /** Dedicated page: clicking navigates instead of scrolling the homepage. */
  page?: boolean;
  /** Route prefix that also marks this item active on other pages. */
  activeOn?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", section: "home" },
  { label: "About Me", href: "/#about", section: "about", activeOn: "/about" },
  { label: "Projects", href: "/#projects", section: "projects", activeOn: "/projects" },
  { label: "Skills", href: "/#skills", section: "skills" },
  { label: "Experience", href: "/#experience", section: "experience" },
  { label: "Contact", href: "/contact", section: "contact", page: true, activeOn: "/contact" },
];

/** Distance from the viewport top used as the "reading line" for the active section. */
const READING_LINE = 96;

function scrollToSection(id: string): boolean {
  const target = document.getElementById(id);
  if (!target) return false;

  const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  if (id === "home") {
    window.scrollTo({ top: 0, behavior });
  } else {
    target.scrollIntoView({ behavior, block: "start" });
  }
  return true;
}

function getActiveSection(): string | null {
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom && window.scrollY > 0) return "contact";

  for (const item of NAV_ITEMS) {
    const rect = document.getElementById(item.section)?.getBoundingClientRect();
    if (rect && rect.top <= READING_LINE && rect.bottom > READING_LINE) return item.section;
  }
  return null;
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const menuId = useId();
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      setActiveSection(isHome ? getActiveSection() : null);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome, pathname]);

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

    // Dedicated pages, other routes and modified clicks use normal navigation.
    if (item.page || !isHome) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!document.getElementById(item.section)) return;

    event.preventDefault();
    scrollToSection(item.section);
    window.history.replaceState(null, "", item.href);
  };

  const getAriaCurrent = (item: NavItem): "page" | "location" | undefined => {
    if (item.activeOn && pathname.startsWith(item.activeOn)) return "page";
    if (isHome && activeSection === item.section) return "location";
    return undefined;
  };

  return (
    <>
      <header className={`${styles.header}${scrolled ? ` ${styles.scrolled}` : ""}`}>
        <div className={styles.container}>
          <Link
            className={styles.brand}
            href="/"
            aria-label="Fatima Sierra home"
            onClick={(event) => handleNavClick(event, NAV_ITEMS[0])}
          >
            Fatima Sierra<span aria-hidden="true">.</span>
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

          <div className={styles.resumeCta}>
            <AnimatedButton type="button" onClick={() => setResumeOpen(true)}>
              RESUME
            </AnimatedButton>
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
                className={styles.drawerResume}
                onClick={() => {
                  closeMenu();
                  setResumeOpen(true);
                }}
              >
                Resume <span aria-hidden="true">↗</span>
              </button>
            </nav>
          </aside>
        </>
      )}
      <ResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} />
    </>
  );
}
