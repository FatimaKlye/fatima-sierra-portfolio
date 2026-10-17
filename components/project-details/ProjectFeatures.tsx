import type { ProjectHighlight } from "@/data/projectDetailsData";
import SectionHead from "./SectionHead";
import ZoomableMedia from "./ZoomableMedia";
import styles from "./ProjectDetails.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

function FeatureSteps({ steps, label }: { steps: string[]; label: string }) {
  return (
    <ol className={styles.featureSteps} aria-label={label}>
      {steps.map((step, stepIndex) => (
        <li key={step}>
          <span className={styles.stepNum} aria-hidden="true">
            {stepIndex + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  );
}

/**
 * Features with a real screenshot (or their own step flow) get an alternating split row;
 * text-only features follow as a compact card grid.
 */
export default function ProjectFeatures({ features, number }: { features: ProjectHighlight[]; number: string }) {
  const rows = features.filter((feature) => feature.media || feature.steps?.length);
  const cards = features.filter((feature) => !feature.media && !feature.steps?.length);

  return (
    <section className={styles.features} id="features" aria-labelledby="features-title" data-nav-label="Key features">
      <div className={styles.container}>
        <SectionHead id="features-title" number={number} eyebrow="Key features" title="What it does" />

        {rows.length > 0 && (
          <ul className={styles.showcase}>
            {rows.map((feature, featureIndex) => {
              const stepsLabel = `${feature.title}: steps`;

              return (
                <li key={feature.title} className={styles.showcaseRow} data-reveal>
                  <div className={styles.showcaseCopy}>
                    <span className={styles.featureNum} aria-hidden="true">
                      {pad(featureIndex + 1)}
                    </span>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureText}>{feature.description}</p>
                    {/* With a screenshot on the other side, the steps sit under the text. */}
                    {feature.media && feature.steps && feature.steps.length > 0 && (
                      <FeatureSteps steps={feature.steps} label={stepsLabel} />
                    )}
                  </div>

                  <div className={styles.showcaseVisual} data-frame={feature.media?.frame}>
                    {feature.media ? (
                      <ZoomableMedia
                        media={feature.media}
                        sizes={feature.media.frame === "phone" ? "260px" : "(min-width: 900px) 52vw, 100vw"}
                      />
                    ) : (
                      <FeatureSteps steps={feature.steps ?? []} label={stepsLabel} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {cards.length > 0 && (
          <ul className={styles.featureGrid} data-count={cards.length} data-stagger>
            {cards.map((feature, featureIndex) => (
              <li key={feature.title} className={styles.featureCard}>
                <span className={styles.featureNum} aria-hidden="true">
                  {pad(rows.length + featureIndex + 1)}
                </span>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureText}>{feature.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
