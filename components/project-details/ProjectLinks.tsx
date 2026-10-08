import { ArrowUpRight, Code, Download, Play } from "lucide-react";
import type { ProjectLinks as ProjectLinksData } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

type ProjectLinksProps = {
  links: ProjectLinksData;
  /** "onDark" switches to the light button tones for the pink/dark bands. */
  tone?: "light" | "onDark";
  /** Added to the APK button's accessible name, e.g. "223.4 MB". */
  apkSize?: string;
};

/** Only verified URLs are ever passed in; each button renders only when its URL exists. */
export default function ProjectLinks({ links, tone = "light", apkSize }: ProjectLinksProps) {
  const { liveUrl, videoUrl, repoUrl, apkUrl } = links;

  if (!liveUrl && !videoUrl && !repoUrl && !apkUrl) {
    return null;
  }

  const onDark = tone === "onDark";
  const primary = onDark ? "ui-btn ui-btn--light" : "ui-btn ui-btn--primary";
  const secondary = onDark ? "ui-btn ui-btn--ghost-light" : "ui-btn ui-btn--secondary";

  return (
    <div className={styles.linkRow}>
      {apkUrl && (
        // Same-tab link: the server sends the file as an APK download, so no blank tab is left behind.
        <a className={primary} href={apkUrl} type="application/vnd.android.package-archive" download>
          <Download size={16} aria-hidden="true" />
          Download APK
          <span className={styles.srOnly}> for Android{apkSize ? ` (${apkSize})` : ""}</span>
        </a>
      )}
      {liveUrl && (
        <a className={`${primary} ${styles.ctaLive}`} href={liveUrl} target="_blank" rel="noopener noreferrer">
          Visit Live Website
          <ArrowUpRight size={16} aria-hidden="true" />
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
