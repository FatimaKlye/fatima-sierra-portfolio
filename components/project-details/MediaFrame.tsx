import Image from "next/image";
import type { ProjectMedia } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

type MediaFrameProps = {
  media: ProjectMedia;
  sizes: string;
  priority?: boolean;
  quality?: number;
  className?: string;
};

/** Renders a real project image inside a browser window or a soft rounded frame. */
export default function MediaFrame({ media, sizes, priority, quality = 82, className }: MediaFrameProps) {
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
        </div>
        {image}
      </div>
    );
  }

  return <div className={[styles.plain, className].filter(Boolean).join(" ")}>{image}</div>;
}
