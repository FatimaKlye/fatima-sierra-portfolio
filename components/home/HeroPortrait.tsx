"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./HeroSection.module.css";

export default function HeroPortrait() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={styles.portraitArea}>
      <div className={styles.portraitGlow} aria-hidden="true" />
      <div className={styles.portraitFrame}>
        <div className={styles.portraitPlaceholder} aria-hidden={!imageFailed}>
          <span>FS</span>
          <small>Add your profile photo</small>
        </div>

        {!imageFailed && (
          <Image
            className={styles.portraitImage}
            src="/assets/profile/fatima-sierra-profile.png"
            alt="Portrait of Fatima Sierra"
            fill
            priority
            sizes="(max-width: 820px) 78vw, 42vw"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className={styles.codeBadgeOne} aria-hidden="true">
        <span>APP</span>
        Flutter + Supabase
      </div>
      <div className={styles.codeBadgeTwo} aria-hidden="true">
        <span>WEB</span>
        Next.js + TypeScript
      </div>
      <div className={styles.smallOrb} aria-hidden="true" />
    </div>
  );
}
