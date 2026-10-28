import type { CSSProperties } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { CONTACT_EMAIL, RESUME_URL, SOCIAL_LINKS } from "./contactData";
import ContactForm from "./ContactForm";
import ContactMotion from "./ContactMotion";
import CopyEmailButton from "./CopyEmailButton";
import LocalTime from "./LocalTime";
import styles from "./ContactPanel.module.css";

type ContactPanelProps = {
  headingId: string;
  headingLevel?: 1 | 2;
};

const PANEL_SOCIAL_IDS = ["github", "linkedin", "instagram", "facebook"];

const PANEL_SOCIALS = PANEL_SOCIAL_IDS.flatMap((id) => {
  const link = SOCIAL_LINKS.find((item) => item.id === id);
  return link ? [link] : [];
});

/** Four-point star drawn in a 24-unit box. */
const SPARK_PATH = "M12 0C12.9 7.1 16.9 11.1 24 12C16.9 12.9 12.9 16.9 12 24C11.1 16.9 7.1 12.9 0 12C7.1 11.1 11.1 7.1 12 0Z";

/**
 * Contact page: an editorial invitation on the left (heading, direct email, profiles, résumé)
 * and the message form on the right. The section fills the screen below the navbar, so the
 * footer's divider lands at the bottom edge of the viewport.
 */
export default function ContactPanel({ headingId, headingLevel = 2 }: ContactPanelProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <ContactMotion className={styles.stage}>
        <span className={styles.glyphLayer} data-depth="-1.4" aria-hidden="true">
          <span className={styles.glyph} data-contact-reveal="glyph">
            @
          </span>
        </span>

        <div className={styles.frame}>
          <div className={styles.intro}>
            <p className={styles.eyebrow} data-contact-reveal="eyebrow">
              <span className={styles.eyebrowRule} aria-hidden="true" />
              Get in touch
            </p>

            <Heading id={headingId} className={styles.heading}>
              <span className={styles.wordMask}>
                <span className={styles.word} data-contact-word>
                  Say
                </span>
              </span>{" "}
              {/* The spark travels with "hello." so a wrapped heading never strands it on its own line. */}
              <span className={styles.nowrap}>
                <span className={styles.wordMask}>
                  <span className={styles.word} data-contact-word>
                    hello<span className={styles.headingDot}>.</span>
                  </span>
                </span>
                <span className={styles.sparkLayer} data-depth="1.2" aria-hidden="true">
                  <span className={styles.spark} data-contact-sparkle>
                    <svg viewBox="0 0 24 24" className={styles.sparkMain}>
                      <path d={SPARK_PATH} />
                    </svg>
                    <svg viewBox="0 0 24 24" className={styles.sparkSmall}>
                      <path d={SPARK_PATH} />
                    </svg>
                  </span>
                </span>
              </span>
            </Heading>

            <p className={styles.lead} data-contact-reveal="lead">
              Have an idea, an opportunity, a recommendation, or just want to say hi? I&apos;d love to hear from
              you! Drop me a message or reach out directly — I&apos;m always happy to connect.
            </p>

            <div className={styles.direct} data-contact-reveal="direct">
              <p className={styles.kicker}>Write to me directly</p>
              <div className={styles.emailRow}>
                <a className={styles.email} href={`mailto:${CONTACT_EMAIL}`}>
                  <span className={styles.emailText}>{CONTACT_EMAIL}</span>
                  <ArrowUpRight className={styles.emailArrow} size={22} strokeWidth={1.75} aria-hidden="true" />
                </a>
                <CopyEmailButton email={CONTACT_EMAIL} className={styles.copy} />
              </div>
            </div>

            <ul className={styles.socials} aria-label="Social profiles">
              {PANEL_SOCIALS.map((social) => (
                <li key={social.id} data-contact-reveal="social">
                  <a className={styles.social} href={social.href} target="_blank" rel="noopener noreferrer">
                    <span className={styles.socialBadge} aria-hidden="true">
                      <span
                        className={styles.socialIcon}
                        style={{ "--icon": `url(${social.icon})` } as CSSProperties}
                      />
                    </span>
                    <span className={styles.socialText}>
                      <span className={styles.socialLabel}>{social.label}</span>
                      <span className={styles.socialHandle}>{social.handle}</span>
                    </span>
                    <ArrowUpRight className={styles.socialArrow} size={16} strokeWidth={2} aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>

            <a className={styles.resume} href={RESUME_URL} download data-contact-reveal="resume">
              <span className={styles.resumeIcon} aria-hidden="true">
                <ArrowDown size={15} strokeWidth={2.25} />
              </span>
              <span className={styles.resumeLabel}>Download Resume</span>
              <span className={styles.resumeMeta}>PDF</span>
            </a>
          </div>

          <div className={styles.formColumn} data-contact-reveal="form">
            <ContactForm />
          </div>
        </div>

        <div className={styles.meta} data-contact-reveal="meta">
          <p className={styles.metaItem}>
            <span className={styles.metaLabel}>Local time</span>
            <span>
              <LocalTime className={styles.metaTime} /> in the Philippines
            </span>
          </p>
          <p className={styles.metaItem}>
            <span className={styles.statusDot} aria-hidden="true" />
            Usually replies within a day
          </p>
        </div>
      </ContactMotion>
    </section>
  );
}
