import { ArrowUpRight, Code, Play } from "lucide-react";
import type { ProjectLinks as ProjectLinksData } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

type ProjectLinksProps = {
  links: ProjectLinksData;
  /** "onDark" switches the secondary buttons to a light outline. */
  tone?: "light" | "onDark";
};

/** Only verified URLs are ever passed in; each button renders only when its URL exists. */
export default function ProjectLinks({ links, tone = "light" }: ProjectLinksProps) {
  const { liveUrl, videoUrl, repoUrl } = links;

  if (!liveUrl && !videoUrl && !repoUrl) {
    return null;
  }

  const secondary = tone === "onDark" ? `${styles.btn} ${styles.btnGhostDark}` : `${styles.btn} ${styles.btnGhost}`;

  return (
    <div className={styles.linkRow}>
      {liveUrl && (
        <a
          className={`${styles.btn} ${styles.btnPrimary}`}
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Live Website
          <ArrowUpRight size={18} aria-hidden="true" />
          <span className={styles.srOnly}> (opens in a new tab)</span>
        </a>
      )}
      {videoUrl && (
        <a className={secondary} href={videoUrl} target="_blank" rel="noopener noreferrer">
          <Play size={16} aria-hidden="true" />
          Watch Demo
          <span className={styles.srOnly}> (opens in a new tab)</span>
        </a>
      )}
      {repoUrl && (
        <a className={secondary} href={repoUrl} target="_blank" rel="noopener noreferrer">
          <Code size={16} aria-hidden="true" />
          GitHub Repository
          <span className={styles.srOnly}> (opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}
