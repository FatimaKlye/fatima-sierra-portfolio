import { ArrowRight } from "lucide-react";
import type { ProjectChallenge } from "@/data/projectDetailsData";
import styles from "./ProjectDetails.module.css";

/** Technical problems found in the project and how they were solved; shown inside Technologies. */
export default function ProjectChallenges({ challenges }: { challenges: ProjectChallenge[] }) {
  return (
    <div className={styles.subBlock}>
      <div className={styles.subHead} data-reveal>
        <p className={styles.eyebrow}>Challenges &amp; solutions</p>
        <h3 className={styles.subTitle}>Technical problems solved</h3>
        <p className={styles.subIntro}>Each fix is marked by who made it, according to the repository&apos;s history.</p>
      </div>

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
              <p className={`${styles.tag} ${styles.tagSolution}`}>
                Solution · {item.solvedBy === "me" ? "My fix" : "Team fix"}
              </p>
              <p className={styles.challengeText}>{item.solution}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
