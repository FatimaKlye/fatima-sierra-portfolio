"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import styles from "./SiteHeader.module.css";

type NavLink = {
  href: string;
  label: string;
  isCta?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Me" },
  { href: "/projects", label: "Projects" },
  { href: "/credentials", label: "Credentials" },
  { href: "/contact", label: "Contact", isCta: true },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const onResize = () => {
      if (window.matchMedia("(min-width: 901px)").matches) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.navbar}>
          <Link
            className={styles.brand}
            href="/"
            aria-label="Fatima Sierra home"
            onClick={closeMenu}
          >
            <span className={styles.brandText}>
              SIERRA<span>.</span>
            </span>
          </Link>

          <button
            type="button"
            className={`${styles.menuToggle}${menuOpen ? ` ${styles.menuToggleOpen}` : ""}`}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.menuToggleBar} aria-hidden="true" />
            <span className={styles.menuToggleBar} aria-hidden="true" />
            <span className={styles.menuToggleBar} aria-hidden="true" />
          </button>

          <nav
            id={menuId}
            className={`${styles.navigation}${menuOpen ? ` ${styles.navigationOpen}` : ""}`}
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  className={
                    link.isCta
                      ? styles.contactNav
                      : isActive
                        ? styles.activeNav
                        : undefined
                  }
                  href={link.href}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {menuOpen && (
            <button
              type="button"
              className={styles.menuBackdrop}
              aria-label="Close menu"
              onClick={closeMenu}
            />
          )}
        </div>
      </div>
    </header>
  );
}
