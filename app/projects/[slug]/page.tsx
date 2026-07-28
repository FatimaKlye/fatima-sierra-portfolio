import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PROJECT_DETAILS,
  getAdjacentProjects,
  getProjectDetailBySlug,
} from "@/data/projectDetailsData";
import ProjectHero from "@/components/project-details/ProjectHero";
import ProjectOverview from "@/components/project-details/ProjectOverview";
import ProjectProblemSolution from "@/components/project-details/ProjectProblemSolution";
import ProjectContribution from "@/components/project-details/ProjectContribution";
import ProjectFeatures from "@/components/project-details/ProjectFeatures";
import ProjectMediaGallery from "@/components/project-details/ProjectMediaGallery";
import ProjectImpact from "@/components/project-details/ProjectImpact";
import ProjectChallenges from "@/components/project-details/ProjectChallenges";
import ProjectSkills from "@/components/project-details/ProjectSkills";
import ProjectLinks from "@/components/project-details/ProjectLinks";
import ProjectNavigation from "@/components/project-details/ProjectNavigation";
import styles from "@/components/project-details/ProjectDetails.module.css";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return PROJECT_DETAILS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectDetailBySlug(slug);

  if (!project) {
    return { title: "Project Not Found | Fatima Sierra" };
  }

  return {
    title: `${project.title} | Fatima Sierra`,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectDetailBySlug(slug);

  if (!project) {
    notFound();
  }

  const { previous, next } = getAdjacentProjects(slug);

  return (
    <main className={styles.page}>
      <ProjectHero project={project} />
      <ProjectOverview project={project} />
      <ProjectProblemSolution project={project} />
      <ProjectContribution project={project} />
      <ProjectFeatures project={project} />
      <ProjectMediaGallery project={project} />
      <ProjectImpact project={project} />
      <ProjectChallenges project={project} />
      <ProjectSkills project={project} />
      <ProjectLinks project={project} />
      <ProjectNavigation previous={previous} next={next} />
    </main>
  );
}
