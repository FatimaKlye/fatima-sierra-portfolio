import { ArrowRight } from "lucide-react";
import type { ProjectChallenge } from "@/data/projectDetailsData";
import SectionHead from "./SectionHead";
import styles from "./ProjectDetails.module.css";

export default function ProjectChallenges({
  challenges,
  number,
}: {
  challenges: ProjectChallenge[];
  number: string;
}) {
  return (
    <section className={styles.challenges} id="challenges" aria-labelledby="challenges-title" data-nav-label="Challenges">
      <div className={styles.container}>
        <SectionHead
          id="challenges-title"
          number={number}
          eyebrow="Challenges & solutions"
          title="Problems worth solving"
        />

        <ol className={styles.challengeList}>
          {challenges.map((item, itemIndex) => (
            <li key={item.challenge} className={styles.challenge} data-reveal>
              <div className={styles.challengeProblem}>
                <p className={styles.tag}>Challenge {itemIndex + 1}</p>
                <p className={styles.challengeText}>{item.challenge}</p>
              </div>
              <span className={styles.challengeArrow} aria-hidden="true">
                <ArrowRight size={22} />
              </span>
              <div className={styles.challengeSolution}>
                <p className={`${styles.tag} ${styles.tagSolution}`}>Solution</p>
                <p className={styles.challengeText}>{item.solution}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
