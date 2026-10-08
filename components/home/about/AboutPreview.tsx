import EditorialMotion from "@/components/motion/EditorialMotion";
import AboutOpening from "./AboutOpening";
import styles from "./AboutStory.module.css";

/** Homepage About Me highlight — the opening of the story, linking to the full /about page. */
export default function AboutPreview() {
  return (
    <section className={`${styles.about} ${styles.preview}`} id="about" aria-labelledby="about-title" data-nav-label="About">
      <EditorialMotion>
        <AboutOpening headingLevel={2} eyebrow="01 — About me" variant="preview" />
      </EditorialMotion>
    </section>
  );
}
