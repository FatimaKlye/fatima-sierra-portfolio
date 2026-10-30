"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CommunityMembership.module.css";

/**
 * "Beyond the code": the official For Girls Who Build PH membership card, embedded as-is.
 *
 * The card is designed at 420 × 560, so the iframe always renders at that size and is scaled
 * down to fit narrower columns — the official design never reflows. The frame's box reserves
 * the 3:4 space up front (no layout shift), and the iframe is only mounted once the section
 * nears the viewport. A frame that never reports a load within the timeout is treated as
 * blocked and swapped for a direct link; the link beside the card is always there regardless.
 */

const CARD_URL = "https://forgirlswhobuild.com/card/FGWB-19535";
const CARD_WIDTH = 420;
const CARD_HEIGHT = 560;
const LOAD_TIMEOUT = 15000;

type Status = "idle" | "loading" | "loaded" | "failed";

export default function CommunityMembership() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  // Mount the iframe once the card is about a screen away.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setStatus("loading");
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  // Scale the fixed-size card to the column it sits in.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const scale = Math.min(1, entry.contentRect.width / CARD_WIDTH);
      frame.style.setProperty("--card-scale", scale.toFixed(4));
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (status !== "loading") return;
    const timer = window.setTimeout(() => setStatus("failed"), LOAD_TIMEOUT);
    return () => window.clearTimeout(timer);
  }, [status]);

  return (
    <section className={styles.community} id="community" aria-labelledby="community-title" data-nav-label="Community">
      <div className={styles.container}>
        <div className={styles.copy}>
          <p className={styles.eyebrow} data-reveal>
            Beyond the code
          </p>
          <h2 id="community-title" className={styles.title} data-reveal>
            Building alongside <em>women who build.</em>
          </h2>
          <p className={styles.body} data-reveal>
            A member of For Girls Who Build PH — connecting with a community of women who share an interest in
            technology, creativity, and building things.
          </p>

          <dl className={styles.facts} data-stagger>
            <div>
              <dt>Community</dt>
              <dd>For Girls Who Build PH</dd>
            </div>
            <div>
              <dt>Involvement</dt>
              <dd>FGWB PH Member</dd>
            </div>
            <div>
              <dt>Card no.</dt>
              <dd>FGWB-19535</dd>
            </div>
          </dl>

          <a
            className={`ui-btn ui-btn--secondary ui-btn--sm ${styles.cta}`}
            href={CARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-reveal
          >
            View Membership <span aria-hidden="true">↗</span>
            <span className={styles.srOnly}> (opens in a new tab)</span>
          </a>
        </div>

        <figure className={styles.stage} data-reveal>
          <div className={styles.frame} ref={frameRef} data-status={status}>
            {status !== "failed" && (
              <div className={styles.placeholder} aria-hidden="true">
                <span className={styles.placeholderMark}>FGWB PH</span>
                <span className={styles.placeholderText}>Loading membership card…</span>
              </div>
            )}

            {(status === "loading" || status === "loaded") && (
              <iframe
                className={styles.iframe}
                src={CARD_URL}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                title="FATIMA SIERRA's FGWB PH membership card"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                onLoad={() => setStatus("loaded")}
              />
            )}

            {status === "failed" && (
              <div className={styles.fallback} role="status">
                <span className={styles.placeholderMark}>FGWB PH</span>
                <p>The membership card couldn&apos;t be displayed here.</p>
                <a href={CARD_URL} target="_blank" rel="noopener noreferrer">
                  Open the official card <span aria-hidden="true">↗</span>
                  <span className={styles.srOnly}> (opens in a new tab)</span>
                </a>
              </div>
            )}
          </div>
          <figcaption className={styles.caption}>Official membership card · forgirlswhobuild.com</figcaption>
        </figure>
      </div>
    </section>
  );
}
