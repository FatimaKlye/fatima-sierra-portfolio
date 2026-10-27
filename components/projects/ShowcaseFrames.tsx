import Image from "next/image";
import PhoneMockup, { Redactions } from "@/components/project-details/PhoneMockup";
import type { ProjectMedia } from "@/data/projectDetailsData";
import styles from "./ProjectsPage.module.css";

type FrameProps = {
  media: ProjectMedia;
  sizes: string;
  priority?: boolean;
  /** Decorative copies hide their image from assistive tech. */
  decorative?: boolean;
  className?: string;
};

/**
 * A real screenshot in the frame its case study uses: a drawn browser window,
 * a soft plain frame (exports that already carry browser chrome) or a handset.
 * Plain spans so it can sit inside links.
 */
export function Shot({ media, sizes, priority, decorative, className }: FrameProps) {
  if (media.frame === "phone") {
    return <PhoneMockup media={media} sizes={sizes} priority={priority} decorative={decorative} className={className} />;
  }

  const image = (
    <span className={styles.shotImage} style={{ aspectRatio: `${media.width} / ${media.height}` }}>
      <Image
        src={media.src}
        alt={decorative ? "" : media.alt}
        fill
        sizes={sizes}
        priority={priority}
        draggable={false}
        data-zoom
      />
      <Redactions regions={media.redact} />
    </span>
  );

  if (media.frame === "browser") {
    return (
      <span className={[styles.browser, className].filter(Boolean).join(" ")}>
        <span className={styles.browserBar} aria-hidden="true">
          <i />
          <i />
          <i />
          {media.url && <span className={styles.browserUrl}>{media.url}</span>}
        </span>
        {image}
      </span>
    );
  }

  return <span className={[styles.plain, className].filter(Boolean).join(" ")}>{image}</span>;
}
