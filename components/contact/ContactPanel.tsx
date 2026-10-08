import type { CSSProperties } from "react";
import { Mail } from "lucide-react";
import { SOCIAL_LINKS } from "./contactData";
import ContactForm from "./ContactForm";
import styles from "./ContactPanel.module.css";

type ContactPanelProps = {
  id?: string;
  headingId: string;
  headingLevel?: 1 | 2;
  /** "page" fills the viewport (dedicated /contact route); "section" is the compact homepage block. */
  variant?: "page" | "section";
};

const PANEL_SOCIAL_IDS = ["github", "linkedin", "instagram", "facebook"];

const EMAIL_LINK = SOCIAL_LINKS.find((link) => link.id === "email");
const PANEL_SOCIALS = PANEL_SOCIAL_IDS.flatMap((id) => {
  const link = SOCIAL_LINKS.find((item) => item.id === id);
  return link ? [link] : [];
});

/** The standalone page indexes its two halves; the embedded variant stays out of the section index. */
const navMarker = (variant: ContactPanelProps["variant"], id: string, label: string) =>
  variant === "section" ? {} : { id, "data-nav-label": label };

export default function ContactPanel({
  id,
  headingId,
  headingLevel = 2,
  variant = "page",
}: ContactPanelProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section
      id={id}
      className={`${styles.section}${variant === "section" ? ` ${styles.compact}` : ""}`}
      aria-labelledby={headingId}
    >
      <div className={styles.frame}>
        <div className={styles.intro} {...navMarker(variant, "say-hello", "Say hello")}>
          <div className={styles.headingWrap}>
            <Heading id={headingId} className={styles.heading}>
              Say hello.
            </Heading>
          </div>

          <div className={styles.links}>
            {EMAIL_LINK && (
              <a className={styles.email} href={`mailto:${EMAIL_LINK.handle}`}>
                <Mail className={styles.emailIcon} size={22} strokeWidth={1.5} aria-hidden="true" />
                <span className={styles.emailText}>{EMAIL_LINK.handle}</span>
              </a>
            )}

            <ul className={styles.socials} aria-label="Social links">
              {PANEL_SOCIALS.map((social) => (
                <li key={social.id}>
                  <a
                    className={styles.social}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${social.label} (opens in a new tab)`}
                  >
                    <span
                      className={styles.socialIcon}
                      style={{ "--icon": `url(${social.icon})` } as CSSProperties}
                      aria-hidden="true"
                    />
                    <span className={styles.socialLabel}>{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.formColumn} {...navMarker(variant, "message", "Send a message")}>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
