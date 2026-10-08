import Image from "next/image";
import { Lock } from "lucide-react";
import type { ProjectMedia } from "@/data/projectDetailsData";
import PhoneMockup from "./PhoneMockup";
import styles from "./ProjectDetails.module.css";

type MediaFrameProps = {
  media: ProjectMedia;
  sizes: string;
  priority?: boolean;
  quality?: number;
  className?: string;
};

/** Renders a real project image inside a browser window, a phone, or a soft rounded frame. */
export default function MediaFrame({ media, sizes, priority, quality = 82, className }: MediaFrameProps) {
  if (media.frame === "phone") {
    return (
      <PhoneMockup
        media={media}
        sizes={sizes}
        priority={priority}
        quality={Math.max(quality, 85)}
        className={className}
      />
    );
  }

  const image = (
    <Image
      src={media.src}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes={sizes}
      quality={quality}
      priority={priority}
      draggable={false}
      className={styles.frameImage}
    />
  );

  if (media.frame === "browser") {
    return (
      <div className={[styles.browser, className].filter(Boolean).join(" ")}>
        <div className={styles.browserBar} aria-hidden="true">
          <span />
          <span />
          <span />
          {media.url && (
            <em className={styles.browserUrl}>
              <Lock size={10} strokeWidth={2.5} />
              {media.url}
            </em>
          )}
        </div>
        {image}
      </div>
    );
  }

  return <div className={[styles.plain, className].filter(Boolean).join(" ")}>{image}</div>;
}
