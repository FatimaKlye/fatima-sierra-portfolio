import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { CAPABILITIES } from "@/components/about/aboutData";
import TechIcon from "./TechIcon";
import { ALL_SKILLS, SKILL_PROJECTS, STACK_LAYERS } from "./skillsData";
import styles from "./Skills.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/** Headline lines; each word slides up out of its own mask. */
const HEADLINE = [
  { words: ["From", "interface"], accent: false },
  { words: ["to", "database."], accent: true },
];

/**
 * Opening of /skills: a compact headline beside a layered diagram of the stack
 * (interface, mobile, data), then the four things I take on. The layers drift
 * with the pointer on desktop via SkillsPointer ([data-depth]).
 */
export default function SkillsHero() {
  return (
    <header className={styles.hero} id="intro" data-nav-label="Intro" data-nav-intro data-depth-scope>
      <div className={styles.heroGrid} aria-hidden="true" />

      <div className={`${styles.container} ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-current="page">Skills</li>
            </ol>
          </nav>

          <p className={styles.heroEyebrow} data-reveal>
            Skills · Web &amp; mobile developer
          </p>

          <h1 className={styles.heroTitle} aria-label="From interface to database.">
            {HEADLINE.map((line) => (
              <span
                className={`${styles.titleLine}${line.accent ? ` ${styles.accent}` : ""}`}
                key={line.words[0]}
                aria-hidden="true"
              >
                {line.words.map((word) => (
                  <span className={styles.mask} key={word}>
                    <span data-word>{word}</span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p className={styles.heroIntro} data-reveal>
            I build responsive web apps with Next.js and React, mobile apps with Flutter, and connect them to
            Supabase. Below is the stack, how I use each part of it, and where you can see it working.
          </p>

          <div className={styles.heroActions} data-reveal>
            <a className="ui-btn ui-btn--primary" href="#stack" data-magnetic>
              Explore the stack
              <ArrowDown size={16} strokeWidth={1.75} aria-hidden="true" />
            </a>
            <Link className="ui-btn ui-btn--secondary" href="/projects" data-magnetic>
              See the projects
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <figure className={styles.layers} aria-label="The layers I build: interface, mobile and data">
          <span className={styles.layersSpine} aria-hidden="true" data-grow />
          <ol className={styles.layerList} data-stagger>
            {STACK_LAYERS.map((layer, index) => (
              <li className={styles.layer} key={layer.id} data-depth={index + 1}>
                <span className={styles.layerIndex} aria-hidden="true">
                  {pad(index + 1)}
                </span>
                <span className={styles.layerText}>
                  <span className={styles.layerLabel}>{layer.label}</span>
                  <span className={styles.layerBuilds}>{layer.builds}</span>
                </span>
                <ul className={styles.layerTools}>
                  {layer.tools.map((tool) => (
                    <li key={tool.name} title={tool.name}>
                      <TechIcon tech={tool} size={26} fallbackClassName={styles.iconFallback} />
                      <span className={styles.srOnly}>{tool.name}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <figcaption className={styles.layersCaption} data-reveal>
            <span>
              <strong>{pad(ALL_SKILLS.length)}</strong> technologies
            </span>
            <span>
              <strong>{pad(SKILL_PROJECTS.length)}</strong> documented projects
            </span>
          </figcaption>
        </figure>
      </div>

      <div className={styles.container}>
        <ol className={styles.capabilities} data-stagger aria-label="What I can take on">
          {CAPABILITIES.map((capability) => (
            <li className={styles.capability} key={capability.id}>
              <span className={styles.capabilityVerb}>{capability.verb}</span>
              <span className={styles.capabilityTitle}>{capability.title}</span>
              <span className={styles.capabilityText}>{capability.description}</span>
            </li>
          ))}
        </ol>
      </div>
    </header>
  );
}
