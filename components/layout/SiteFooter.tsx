import Link from "next/link";
import { EDUCATION } from "@/components/about/aboutData";
import { SOCIAL_LINKS } from "@/components/contact/contactData";
import styles from "./SiteFooter.module.css";

const FOOTER_NAV_LINKS = [
  { href: "/about", label: "About me" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/experience", label: "Experience" },
  { href: "/certifications", label: "Certifications" },
  { href: "/contact", label: "Contact" },
];

const PROFESSIONAL_LINKS = ["linkedin", "github", "email"].flatMap((id) => {
  const link = SOCIAL_LINKS.find((item) => item.id === id);
  return link ? [link] : [];
});

export default function SiteFooter() {
  const currentEducation = EDUCATION[0];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div>
          <Link className={styles.footerBrand} href="/">Fatima Sierra</Link>
          <p className={styles.footerDescription}>Web &amp; Mobile Developer creating purposeful digital experiences.</p>
        </div>
        <div>
          <p className={styles.footerLabel}>Navigate</p>
          <nav aria-label="Footer navigation">
            {FOOTER_NAV_LINKS.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          </nav>
        </div>
        <div>
          <p className={styles.footerLabel}>Connect</p>
          <nav aria-label="Social links">
            {PROFESSIONAL_LINKS.map((link) => (
              <a href={link.href} target="_blank" rel="noreferrer" key={link.id} aria-label={`${link.label} (opens in a new tab)`}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div>
          <p className={styles.footerLabel}>Education</p>
          <p className={styles.footerEducation}>{currentEducation.detail}<br />Mobile &amp; Web Applications</p>
        </div>
      </div>
      <div className={styles.footerBottom}><span>© 2026 Fatima Sierra</span><span>Designed &amp; developed by Fatima Sierra</span></div>
    </footer>
  );
}
