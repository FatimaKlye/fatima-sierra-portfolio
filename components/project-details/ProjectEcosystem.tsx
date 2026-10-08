import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Database, Globe, Smartphone } from "lucide-react";
import type { EcosystemSurface, ProjectEcosystem as ProjectEcosystemData } from "@/data/projectDetailsData";
import PhoneMockup from "./PhoneMockup";
import SectionHead from "./SectionHead";
import styles from "./ProjectDetails.module.css";

type ProjectEcosystemProps = {
  ecosystem: ProjectEcosystemData;
  currentSlug: string;
  number: string;
};

function Surface({ surface, current }: { surface: EcosystemSurface; current: boolean }) {
  const isPhone = surface.media.frame === "phone";
  const Icon = isPhone ? Smartphone : Globe;

  const body = (
    <>
      <span className={`${styles.surfaceVisual} ${isPhone ? styles.surfaceVisualPhone : ""}`} aria-hidden="true">
        {isPhone ? (
          <span className={styles.surfacePhone}>
            <PhoneMockup media={surface.media} sizes="160px" decorative />
          </span>
        ) : (
          <span className={styles.surfaceBrowser}>
            <Image src={surface.media.src} alt="" fill sizes="(min-width: 900px) 30vw, 90vw" />
          </span>
        )}
      </span>

      <span className={styles.surfaceBody}>
        <span className={styles.surfaceKind}>
          <Icon size={14} aria-hidden="true" />
          {surface.kind}
        </span>
        <span className={styles.surfaceName}>{surface.name}</span>
        <span className={styles.surfaceRole}>{surface.role}</span>
        {current ? (
          <span className={styles.surfaceHere}>You are here</span>
        ) : (
          <span className={styles.surfaceGo}>
            View case study <ArrowRight size={15} aria-hidden="true" />
          </span>
        )}
      </span>
    </>
  );

  if (current) {
    return <div className={`${styles.surface} ${styles.surfaceCurrent}`}>{body}</div>;
  }

  return (
    <Link className={`${styles.surface} ${styles.surfaceLink}`} href={`/projects/${surface.slug}`}>
      {body}
    </Link>
  );
}

export default function ProjectEcosystem({ ecosystem, currentSlug, number }: ProjectEcosystemProps) {
  const [first, second] = ecosystem.surfaces;

  return (
    <section className={styles.ecosystem} aria-labelledby="ecosystem-title">
      <div className={styles.container}>
        <div className={styles.ecosystemHead}>
          <SectionHead id="ecosystem-title" number={number} eyebrow="Connected system" title={ecosystem.title} />
          <p className={styles.ecosystemIntro} data-reveal>
            {ecosystem.intro}
          </p>
        </div>

        <div className={styles.ecoMap} data-reveal>
          <Surface surface={first} current={first.slug === currentSlug} />

          <div className={styles.ecoBridge} aria-hidden="true">
            <span className={styles.ecoTrack}>
              <span className={styles.ecoFill} data-line />
              <span className={styles.ecoPulse} />
            </span>
            <span className={styles.ecoHub}>
              <Database size={16} />
              {ecosystem.hub}
            </span>
          </div>

          <Surface surface={second} current={second.slug === currentSlug} />
        </div>

        <ol className={styles.ecoLinks} data-stagger>
          {ecosystem.connections.map((connection, connectionIndex) => (
            <li key={connection.title} className={styles.ecoLink}>
              <span className={styles.ecoLinkNum}>{String(connectionIndex + 1).padStart(2, "0")}</span>
              <h3 className={styles.ecoLinkTitle}>{connection.title}</h3>
              <p className={styles.ecoLinkText}>{connection.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
