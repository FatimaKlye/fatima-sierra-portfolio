import Image from "next/image";
import type { MediaRedaction, ProjectMedia } from "@/data/projectDetailsData";
import styles from "./PhoneMockup.module.css";

type PhoneMockupProps = {
  media: ProjectMedia;
  sizes: string;
  priority?: boolean;
  quality?: number;
  className?: string;
  /** Decorative copies (e.g. fanned companions) hide their image from assistive tech. */
  decorative?: boolean;
};

/** Blurred patches over parts of a screenshot that must stay unreadable. */
export function Redactions({ regions }: { regions?: MediaRedaction[] }) {
  if (!regions?.length) {
    return null;
  }

  return (
    <>
      {regions.map((region) => (
        <span
          key={`${region.left}-${region.top}`}
          className={styles.redact}
          style={{
            left: `${region.left}%`,
            top: `${region.top}%`,
            width: `${region.width}%`,
            height: `${region.height}%`,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

/**
 * A handset frame drawn in CSS around a real, full-height phone screenshot.
 * Built from spans so it can sit inside links and buttons.
 */
export default function PhoneMockup({
  media,
  sizes,
  priority,
  quality = 85,
  className,
  decorative = false,
}: PhoneMockupProps) {
  return (
    <span className={[styles.phone, className].filter(Boolean).join(" ")}>
      <span className={styles.screen}>
        <Image
          src={media.src}
          alt={decorative ? "" : media.alt}
          width={media.width}
          height={media.height}
          sizes={sizes}
          quality={quality}
          priority={priority}
          draggable={false}
          className={styles.image}
        />
        <Redactions regions={media.redact} />
        <span className={styles.camera} aria-hidden="true" />
        <span className={styles.glare} aria-hidden="true" />
      </span>
    </span>
  );
}
