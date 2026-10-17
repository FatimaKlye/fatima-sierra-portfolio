import type { CSSProperties } from "react";
import { Download, Mail } from "lucide-react";
import { CONTACT_EMAIL, RESUME_URL, SOCIAL_LINKS } from "./contactData";
import ContactForm from "./ContactForm";
import styles from "./ContactPanel.module.css";

type ContactPanelProps = {
  headingId: string;
  headingLevel?: 1 | 2;
};

const PANEL_SOCIAL_IDS = ["github", "linkedin", "instagram", "facebook"];

const EMAIL_LINK = SOCIAL_LINKS.find((link) => link.id === "email");
const PANEL_SOCIALS = PANEL_SOCIAL_IDS.flatMap((id) => {
  const link = SOCIAL_LINKS.find((item) => item.id === id);
  return link ? [link] : [];
});

/** Contact page: direct details on the left, the message form on the right. */
export default function ContactPanel({ headingId, headingLevel = 2 }: ContactPanelProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.frame}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Contact</p>
          <Heading id={headingId} className={styles.heading}>
            Say hello.
          </Heading>
          <p className={styles.lead}>
            I&apos;m open to internships and junior web or mobile developer roles. Send a message here or email me
            directly — I&apos;m happy to walk through any of my projects.
          </p>

          {EMAIL_LINK && (
            <a className={styles.email} href={EMAIL_LINK.href} target="_blank" rel="noreferrer">
              <Mail className={styles.emailIcon} size={20} strokeWidth={1.75} aria-hidden="true" />
              <span className={styles.emailText}>{CONTACT_EMAIL}</span>
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
                  <span>{social.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <a className={`ui-btn ui-btn--secondary ui-btn--sm ${styles.resume}`} href={RESUME_URL} download>
            Download Resume <Download size={15} aria-hidden="true" />
          </a>
        </div>

        <div className={styles.formColumn}>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
