"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/components/contact/contactData";
import styles from "./SiteFooter.module.css";

type FooterNavLink = { href: string; label: string; activeOn?: string[] };

const FOOTER_NAV_LINKS: FooterNavLink[] = [
  { href: "/about", label: "About Me" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/experience", label: "Experience", activeOn: ["/certifications"] },
  { href: "/contact", label: "Contact" },
];

type FooterSocial = { id: string; label: string; href: string; external: boolean };

const profile = (id: string): FooterSocial[] => {
  const link = SOCIAL_LINKS.find((item) => item.id === id);
  return link ? [{ id: link.id, label: link.label, href: link.href, external: true }] : [];
};

// Profiles come from the contact data; email is a plain mailto so it opens the visitor's mail app.
const FOOTER_SOCIALS: FooterSocial[] = [
  ...profile("linkedin"),
  ...profile("github"),
  { id: "email", label: "Email", href: `mailto:${CONTACT_EMAIL}`, external: false },
  ...profile("facebook"),
];

const HEADLINE = [
  { word: "LET'S", tone: "outline" },
  { word: "CONNECT.", tone: "solid" },
] as const;

// Read on the client after hydration, so a page built last year still shows the current year.
const subscribeNever = () => () => {};
const getYear = () => new Date().getFullYear();

function isActive(link: FooterNavLink, pathname: string): boolean {
  return [link.href, ...(link.activeOn ?? [])].some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export default function SiteFooter() {
  const rootRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const year = useSyncExternalStore(subscribeNever, getYear, getYear);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const all = <T extends Element = HTMLElement>(selector: string) => Array.from(root.querySelectorAll<T>(selector));
    const mm = gsap.matchMedia();

    // Nothing is hidden by CSS: start states are set here, so reduced-motion and no-JS visitors see everything.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap
        .timeline({ scrollTrigger: { trigger: root, start: "top 85%", once: true } })
        .fromTo(all("[data-ft-line]"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "expo.out", stagger: 0.12 }, 0)
        .fromTo(
          all("[data-ft-char]"),
          { yPercent: 115, rotate: 6 },
          { yPercent: 0, rotate: 0, duration: 1.1, ease: "power4.out", stagger: 0.035, clearProps: "transform" },
          0.1
        )
        .fromTo(
          all("[data-ft-rise]"),
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.07, clearProps: "transform" },
          0.4
        );
    });

    // Pointer-only flourishes: letter bounce, magnetic socials and the cursor glow.
    mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
      const cleanups: Array<() => void> = [];
      const listen = (target: EventTarget, type: string, handler: (event: PointerEvent) => void) => {
        const listener = handler as EventListener;
        target.addEventListener(type, listener);
        cleanups.push(() => target.removeEventListener(type, listener));
      };

      all("[data-ft-char]").forEach((char) => {
        listen(char, "pointerenter", () => {
          if (gsap.isTweening(char)) return;
          gsap.fromTo(
            char,
            { yPercent: 0, skewX: 0 },
            { yPercent: -14, skewX: -6, duration: 0.22, ease: "power2.out", yoyo: true, repeat: 1 }
          );
        });
      });

      all("[data-ft-magnet]").forEach((cell) => {
        const inner = cell.querySelector<HTMLElement>("[data-ft-magnet-inner]");
        if (!inner) return;
        const toX = gsap.quickTo(inner, "x", { duration: 0.5, ease: "power3.out" });
        const toY = gsap.quickTo(inner, "y", { duration: 0.5, ease: "power3.out" });
        listen(cell, "pointermove", (event) => {
          const rect = cell.getBoundingClientRect();
          toX((event.clientX - rect.left - rect.width / 2) * 0.16);
          toY((event.clientY - rect.top - rect.height / 2) * 0.3);
        });
        listen(cell, "pointerleave", () => {
          toX(0);
          toY(0);
        });
      });

      const glow = root.querySelector<HTMLElement>("[data-ft-glow]");
      if (glow) {
        const toX = gsap.quickTo(glow, "x", { duration: 0.9, ease: "power3.out" });
        const toY = gsap.quickTo(glow, "y", { duration: 0.9, ease: "power3.out" });
        listen(root, "pointermove", (event) => {
          const rect = root.getBoundingClientRect();
          toX(event.clientX - rect.left);
          toY(event.clientY - rect.top);
        });
        listen(root, "pointerenter", () => gsap.to(glow, { opacity: 1, duration: 0.6 }));
        listen(root, "pointerleave", () => gsap.to(glow, { opacity: 0, duration: 0.6 }));
      }

      return () => cleanups.forEach((cleanup) => cleanup());
    });

    return () => mm.revert();
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    // Hand keyboard focus back to the start of the page without a second jump.
    document.querySelector<HTMLElement>("[data-site-header] a")?.focus({ preventScroll: true });
  };

  return (
    <footer className={styles.footer} ref={rootRef}>
      <div className={styles.glow} data-ft-glow aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.eyebrowRow}>
          <p className={styles.eyebrow} data-ft-rise>
            <span className={styles.pulse} aria-hidden="true" />
            Open to internships &amp; junior developer roles
          </p>
          <span className={styles.rule} data-ft-line aria-hidden="true" />
        </div>

        <div className={styles.stage}>
          <h2 className={styles.headline} aria-label="Let's connect.">
            {HEADLINE.map(({ word, tone }) => (
              <span className={`${styles.line} ${styles[tone]}`} key={word} aria-hidden="true">
                {Array.from(word).map((char, index) => (
                  <span className={styles.charMask} key={index}>
                    <span className={char === "." ? `${styles.char} ${styles.dot}` : styles.char} data-ft-char>
                      {char}
                    </span>
                  </span>
                ))}
                {tone === "solid" && <span className={styles.spark}>✦</span>}
              </span>
            ))}
          </h2>

          <div className={styles.invite}>
            <p className={styles.inviteText} data-ft-rise>
              Have a project, a role, or an idea worth building? I&apos;d love to hear about it — let&apos;s create
              something purposeful together.
            </p>
            <Link className={styles.inviteLink} href="/contact" data-ft-rise>
              <span className={styles.underline}>Start a conversation</span>
              <span className={styles.arrowTrack} aria-hidden="true">
                <span>→</span>
                <span>→</span>
              </span>
            </Link>
          </div>
        </div>

        <ul className={styles.socials} aria-label="Social links">
          {FOOTER_SOCIALS.map((social, index) => (
            <li key={social.id} data-ft-rise>
              <a
                className={styles.social}
                href={social.href}
                data-ft-magnet
                {...(social.external
                  ? { target: "_blank", rel: "noopener noreferrer", "aria-label": `${social.label} (opens in a new tab)` }
                  : { "aria-label": `Email Fatima at ${CONTACT_EMAIL}` })}
              >
                <span className={styles.socialInner} data-ft-magnet-inner>
                  <span className={styles.socialIndex} aria-hidden="true">0{index + 1}</span>
                  <span className={`${styles.socialLabel} ${styles.underline}`}>{social.label}</span>
                  <span className={`${styles.arrowTrack} ${styles.arrowDiagonal}`} aria-hidden="true">
                    <span>↗</span>
                    <span>↗</span>
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <nav className={styles.nav} aria-label="Footer navigation" data-ft-rise>
          <span className={styles.navLabel} aria-hidden="true">Explore</span>
          <ul>
            {FOOTER_NAV_LINKS.map((link, index) => (
              <li key={link.href}>
                <Link
                  className={styles.underline}
                  href={link.href}
                  aria-current={isActive(link, pathname) ? "page" : undefined}
                >
                  {link.label}
                  <sup aria-hidden="true">0{index + 1}</sup>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <span className={styles.rule} data-ft-line aria-hidden="true" />

        <div className={styles.bottom}>
          <Link className={styles.signature} href="/" aria-label="Fatima Klye Sierra home">
            {/* Both marks ship in the markup; CSS shows the one for the current theme, so there's no flash. */}
            <Image
              className={`${styles.signatureLogo} ${styles.signatureLight}`}
              src="/assets/profile/nav-logo.png"
              alt=""
              width={1494}
              height={591}
              sizes="120px"
            />
            <Image
              className={`${styles.signatureLogo} ${styles.signatureDark}`}
              src="/assets/profile/nav-logo-dark.png"
              alt=""
              width={1494}
              height={591}
              sizes="120px"
            />
            <svg className={styles.swash} viewBox="0 0 120 10" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 7 C 30 2, 60 9, 118 3" pathLength="1" />
            </svg>
          </Link>

          <p className={styles.identity}>
            <strong>Fatima Klye M. Sierra</strong>
            <span>Web &amp; Mobile Developer</span>
          </p>

          <p className={styles.credits}>
            <span>© {year}</span>
            <span aria-hidden="true">·</span>
            <span>Designed &amp; Developed by Fatima Sierra</span>
          </p>

          <button className={styles.backToTop} type="button" onClick={scrollToTop} aria-label="Back to top">
            <svg className={styles.ring} viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <path id="footer-ring-path" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0" />
              </defs>
              <text>
                <textPath href="#footer-ring-path">BACK TO TOP · BACK TO TOP · </textPath>
              </text>
            </svg>
            <span className={styles.topArrow} aria-hidden="true">
              <span>↑</span>
              <span>↑</span>
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
