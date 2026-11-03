"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";
import PhoneMockup, { Redactions } from "@/components/project-details/PhoneMockup";
import TechIcon from "./TechIcon";
import type { BrowserShot, DataSystem, PracticeShowcase as Showcase } from "./skillsData";
import styles from "./Skills.module.css";

type PracticeShowcaseProps = {
  showcase: Showcase;
  /** Project currently pointed at in the area's "Used in" list. */
  active?: string;
  onActivate: (slug: string) => void;
};

const SHOT_SIZES = "(min-width: 900px) 46vw, 92vw";

/**
 * Real screenshots of the web projects in one browser window. The "Used in"
 * list beside it and the tabs below both switch the screen; every image is
 * the case study's own hero, and screenshots that carry their own window
 * chrome (the ITSO exports) are cropped so the bar isn't drawn twice.
 */
function BrowserStage({
  shots,
  active,
  onActivate,
}: {
  shots: BrowserShot[];
  active?: string;
  onActivate: (slug: string) => void;
}) {
  const current = shots.find((shot) => shot.slug === active) ?? shots[0];
  if (!current) return null;

  return (
    <figure className={styles.showcase} aria-label="Screens from the web projects">
      <div className={styles.window}>
        <div className={styles.windowBar} aria-hidden="true">
          <span className={styles.windowDots}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.windowUrl}>
            {current.address && <Lock size={10} strokeWidth={2.5} />}
            {current.address ?? current.title}
          </span>
        </div>
        <div className={styles.windowScreen}>
          {shots.map((shot) => {
            const isCurrent = shot.slug === current.slug;
            return (
              <span
                key={shot.slug}
                className={`${styles.shot}${shot.media.frame === "plain" ? ` ${styles.shotCropped}` : ""}`}
                data-active={isCurrent ? "" : undefined}
                aria-hidden={!isCurrent}
              >
                <Image
                  src={shot.media.src}
                  alt={isCurrent ? shot.media.alt : ""}
                  fill
                  sizes={SHOT_SIZES}
                  quality={80}
                  className={styles.shotImage}
                  draggable={false}
                />
                <Redactions regions={shot.media.redact} />
              </span>
            );
          })}
        </div>
      </div>

      <figcaption className={styles.stageCaption}>
        <span className={styles.stageTabs} role="group" aria-label="Choose a project screen">
          {shots.map((shot, index) => (
            <button
              key={shot.slug}
              type="button"
              className={styles.stageTab}
              aria-pressed={shot.slug === current.slug}
              onClick={() => onActivate(shot.slug)}
            >
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.srOnly}>Show {shot.title}</span>
            </button>
          ))}
        </span>
        <span className={styles.stageMeta}>
          <strong>{current.title}</strong>
          <span className={styles.stageLinks}>
            <Link href={`/projects/${current.slug}`}>
              Case study
              <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
            </Link>
            {current.liveUrl && (
              <a href={current.liveUrl} target="_blank" rel="noopener noreferrer">
                Live site
                <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
                <span className={styles.srOnly}> (opens in a new tab)</span>
              </a>
            )}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** The IGNIS SAFE app's real screens, fanned in handset frames. */
function PhoneStage({ showcase }: { showcase: Extract<Showcase, { kind: "phones" }> }) {
  const labels = [showcase.front, ...showcase.back.slice(0, 2)].map((media) => media.label).filter(Boolean);

  return (
    <figure className={styles.showcase} aria-label={`Screens from ${showcase.title}`}>
      <div className={styles.phones}>
        {showcase.back.slice(0, 2).map((media, index) => (
          <span key={media.src} className={`${styles.phoneBack} ${index === 0 ? styles.phoneLeft : styles.phoneRight}`}>
            <PhoneMockup media={media} sizes="(min-width: 900px) 12vw, 30vw" decorative />
          </span>
        ))}
        <span className={styles.phoneFront}>
          <PhoneMockup media={showcase.front} sizes="(min-width: 900px) 15vw, 40vw" />
        </span>
      </div>

      <figcaption className={styles.stageCaption}>
        <span className={styles.stageMeta}>
          <strong>{showcase.title}</strong>
          {labels.length > 0 && <span className={styles.stageNote}>{labels.join(" · ")}</span>}
          <span className={styles.stageLinks}>
            <Link href={`/projects/${showcase.slug}`}>
              Case study
              <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
            </Link>
            {showcase.repoUrl && (
              <a href={showcase.repoUrl} target="_blank" rel="noopener noreferrer">
                Repository
                <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden="true" />
                <span className={styles.srOnly}> (opens in a new tab)</span>
              </a>
            )}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/** One connector per client, from the middle of its row to the hub's middle. */
const wirePaths = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    const y = ((index + 0.5) / count) * 100;
    return `M0,${y} C50,${y} 50,50 100,50`;
  });

/** How the apps reach their data, drawn only from what the case studies verify. */
function DataStage({ systems, active }: { systems: DataSystem[]; active?: string }) {
  return (
    <figure className={`${styles.showcase} ${styles.dataStage}`} aria-label="How my projects connect to their databases">
      {systems.map((system) => (
        <div className={styles.system} key={system.id}>
          <p className={styles.systemTitle}>{system.title}</p>
          <div className={styles.systemFlow}>
            <ul className={styles.clients}>
              {system.clients.map((client) => (
                <li key={client.slug} className={styles.client} data-lit={client.slug === active ? "" : undefined}>
                  {client.tool && (
                    <span className={styles.clientIcon}>
                      <TechIcon tech={client.tool} size={20} fallbackClassName={styles.iconFallback} />
                    </span>
                  )}
                  <span className={styles.clientText}>
                    <strong>{client.title}</strong>
                    <span>{client.does}</span>
                  </span>
                </li>
              ))}
            </ul>

            <svg className={styles.flowWires} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {wirePaths(system.clients.length).map((d) => (
                <path key={d} d={d} vectorEffect="non-scaling-stroke" />
              ))}
            </svg>

            <div className={styles.hubNode}>
              {system.hub.tool && (
                <span className={styles.clientIcon}>
                  <TechIcon tech={system.hub.tool} size={22} fallbackClassName={styles.iconFallback} />
                </span>
              )}
              <span className={styles.clientText}>
                <strong>{system.hub.title}</strong>
                <span>{system.hub.detail}</span>
              </span>
            </div>
          </div>
          {system.note && <p className={styles.systemNote}>{system.note}</p>}
        </div>
      ))}
      <figcaption className={styles.dataCaption}>
        Architecture drawn from the project repositories. No table names, keys or user data are shown.
      </figcaption>
    </figure>
  );
}

export default function PracticeShowcase({ showcase, active, onActivate }: PracticeShowcaseProps) {
  if (showcase.kind === "browser") return <BrowserStage shots={showcase.shots} active={active} onActivate={onActivate} />;
  if (showcase.kind === "phones") return <PhoneStage showcase={showcase} />;
  return <DataStage systems={showcase.systems} active={active} />;
}
