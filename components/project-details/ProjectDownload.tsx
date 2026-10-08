import { Download, Lock, ShieldCheck } from "lucide-react";
import type { ProjectDownload as ProjectDownloadData, ProjectMedia } from "@/data/projectDetailsData";
import MediaFrame from "./MediaFrame";
import PhoneMockup from "./PhoneMockup";
import SectionHead from "./SectionHead";
import styles from "./ProjectDetails.module.css";

type ProjectDownloadProps = {
  download: ProjectDownloadData;
  number: string;
  /** A real app screen floated over the download page for depth. */
  phone?: ProjectMedia;
};

export default function ProjectDownload({ download, number, phone }: ProjectDownloadProps) {
  const specs = [
    { label: "Version", value: download.version },
    { label: "Size", value: download.size },
    { label: "Requires", value: download.platform },
    { label: "Device", value: download.architecture },
    { label: "Format", value: download.format },
  ];

  return (
    <section className={styles.download} id="download" aria-labelledby="download-title" data-nav-label="Try the app">
      <div className={`${styles.container} ${styles.downloadGrid}`}>
        <div className={styles.downloadCopy}>
          <SectionHead id="download-title" number={number} eyebrow="Try it on Android" title="Install the app" />

          <div className={styles.downloadCard} data-reveal>
            <a
              className={`ui-btn ui-btn--primary ui-btn--lg ${styles.downloadBtn}`}
              href={download.url}
              type="application/vnd.android.package-archive"
              download
            >
              <Download size={18} aria-hidden="true" />
              Download APK
              <span className={styles.downloadBtnSize}>{download.size}</span>
              <span className={styles.srOnly}> for Android, version {download.version}</span>
            </a>

            <dl className={styles.specs}>
              {specs.map((spec) => (
                <div key={spec.label} className={styles.spec}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>

            <p className={styles.downloadHost}>
              <Lock size={13} aria-hidden="true" />
              Served directly from <strong>{download.host}</strong>
            </p>
          </div>

          <ol className={styles.installSteps} aria-label="How to install" data-stagger>
            {download.steps.map((installStep, stepIndex) => (
              <li key={installStep}>
                <span className={styles.installNum} aria-hidden="true">
                  {stepIndex + 1}
                </span>
                {installStep}
              </li>
            ))}
          </ol>

          <p className={styles.installNote} data-reveal>
            <ShieldCheck size={18} aria-hidden="true" />
            {download.note}
          </p>
        </div>

        {download.preview && (
          <figure className={styles.downloadVisual} data-reveal>
            <div data-parallax="3">
              <MediaFrame media={download.preview} sizes="(min-width: 1024px) 52vw, 100vw" />
            </div>
            {phone && (
              <div className={styles.downloadPhone} data-parallax="10">
                <PhoneMockup media={phone} sizes="(min-width: 1024px) 12vw, 28vw" decorative />
              </div>
            )}
            <figcaption className={styles.downloadCaption}>
              The app&apos;s official download page on {download.host}, which serves this same APK.
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
