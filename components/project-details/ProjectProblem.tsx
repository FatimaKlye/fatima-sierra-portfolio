import { ArrowRight } from "lucide-react";
import type { ProjectDetail } from "@/data/projectDetailsData";
import SectionHead from "./SectionHead";
import styles from "./ProjectDetails.module.css";

type ProjectProblemProps = {
  project: ProjectDetail;
  problemNumber: string;
  solutionNumber: string;
};

/** Why the project was needed, then what was built in answer — read side by side before any features. */
export default function ProjectProblem({ project, problemNumber, solutionNumber }: ProjectProblemProps) {
  return (
    <section className={styles.story} aria-label="Problem and solution">
      <div className={`${styles.container} ${styles.storyGrid}`}>
        <article className={styles.storyPart} id="problem" aria-labelledby="problem-title" data-nav-label="Problem">
          <SectionHead
            id="problem-title"
            number={problemNumber}
            eyebrow="The problem"
            title="Why it was needed"
            className={styles.storyHead}
          />
          <p className={styles.storyText} data-reveal>
            {project.problem}
          </p>
        </article>

        <span className={styles.storyArrow} aria-hidden="true">
          <ArrowRight size={22} />
        </span>

        <article
          className={`${styles.storyPart} ${styles.storySolution}`}
          id="solution"
          aria-labelledby="solution-title"
          data-nav-label="Solution"
        >
          <SectionHead
            id="solution-title"
            number={solutionNumber}
            eyebrow="The solution"
            title="What we built"
            className={styles.storyHead}
          />
          <p className={styles.storyText} data-reveal>
            {project.solution}
          </p>
        </article>
      </div>
    </section>
  );
}
