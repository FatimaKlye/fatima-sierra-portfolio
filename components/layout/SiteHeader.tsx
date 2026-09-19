"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import AnimatedButton from "@/components/ui/AnimatedButton";
import ResumeModal from "./ResumeModal";
import styles from "./SiteHeader.module.css";

type NavLink = { href: string; label: string; isCta?: boolean };

const HOME_NAV_LINKS: NavLink[] = [
  { href: "/about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
];

const DEFAULT_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Me" },
  { href: "/projects", label: "Projects" },
  { href: "/credentials", label: "Credentials" },
  { href: "/contact", label: "Contact", isCta: true },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const menuId = useId();
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isHome = pathname === "/";
  const links = isHome ? HOME_NAV_LINKS : DEFAULT_NAV_LINKS;

  useEffect(() => {
    if (!isHome) return;

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={`${styles.header}${isHome ? ` ${styles.homeHeader}` : ""}${isHome && scrolled ? ` ${styles.scrolled}` : ""}`}
      >
        <div className={styles.container}>
          <Link className={styles.brand} href="/" aria-label="Fatima Sierra home">
            Fatima Sierra<span aria-hidden="true">.</span>
          </Link>

          <nav className={styles.desktopNav} aria-label="Primary navigation">
            {links.map((link) => {
              const active = !isHome && (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href));
              return (
                <Link className={active ? styles.active : undefined} href={link.href} key={link.href}>
                  {link.label}
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
                {links.map((link, index) => (
                  <Link href={link.href} key={link.href} onClick={closeMenu}>
                    <span>0{index + 1}</span>{link.label}
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
      </header>
      <ResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} />
    </>
  );
}
