import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PROJECT_DETAILS,
  getAdjacentProjects,
  getProjectDetailBySlug,
  getProjectPosition,
} from "@/data/projectDetailsData";
import BackToProjects from "@/components/project-details/BackToProjects";
import ProjectChallenges from "@/components/project-details/ProjectChallenges";
import ProjectDownload from "@/components/project-details/ProjectDownload";
import ProjectEcosystem from "@/components/project-details/ProjectEcosystem";
import ProjectFeatures from "@/components/project-details/ProjectFeatures";
import ProjectGallery from "@/components/project-details/ProjectGallery";
import ProjectHero from "@/components/project-details/ProjectHero";
import ProjectMotion from "@/components/project-details/ProjectMotion";
import ProjectNext from "@/components/project-details/ProjectNext";
import ProjectOutcomes from "@/components/project-details/ProjectOutcomes";
import ProjectOverview from "@/components/project-details/ProjectOverview";
import ProjectRole from "@/components/project-details/ProjectRole";
import ProjectStack from "@/components/project-details/ProjectStack";
import ProjectTimeline from "@/components/project-details/ProjectTimeline";

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
    return { title: "Project not found | Fatima Sierra" };
  }

  return {
    title: `${project.title} — Case Study | Fatima Sierra`,
    description: project.summary,
    openGraph: {
      title: `${project.title} — Case Study`,
      description: project.summary,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectDetailBySlug(slug);

  if (!project) {
    notFound();
  }

  const { previous, next } = getAdjacentProjects(slug);
  const { index, total } = getProjectPosition(slug);

  // Section numbers follow whichever sections this project actually has.
  let counter = 0;
  const nextNumber = () => String(++counter).padStart(2, "0");

  return (
    <ProjectMotion key={project.slug}>
      <noscript>
        <style>{`[data-motion="pending"] [data-reveal],[data-motion="pending"] [data-intro],[data-motion="pending"] [data-intro-visual],[data-motion="pending"] [data-stagger] > *{opacity:1!important;transform:none!important}[data-motion="pending"] [data-word]{transform:none!important}`}</style>
      </noscript>

      <main>
        <ProjectHero project={project} index={index} total={total} />
        <ProjectOverview project={project} number={nextNumber()} />

        {project.contributions && project.contributions.length > 0 && (
          <ProjectRole project={project} number={nextNumber()} />
        )}

        {project.features.length > 0 && <ProjectFeatures features={project.features} number={nextNumber()} />}

        {project.gallery.length > 0 && <ProjectGallery items={project.gallery} number={nextNumber()} />}

        {project.download && (
          <ProjectDownload
            download={project.download}
            number={nextNumber()}
            phone={project.gallery.find((item) => item.frame === "phone" && !item.redact)}
          />
        )}

        {project.ecosystem && (
          <ProjectEcosystem ecosystem={project.ecosystem} currentSlug={project.slug} number={nextNumber()} />
        )}

        {project.journey && (
          <ProjectTimeline
            id="journey-title"
            number={nextNumber()}
            eyebrow={project.journey.eyebrow}
            title={project.journey.title}
            steps={project.journey.steps}
            variant="journey"
          />
        )}

        {project.process && project.process.length > 0 && (
          <ProjectTimeline
            id="process-title"
            number={nextNumber()}
            eyebrow="Development process"
            title="How it was built"
            steps={project.process}
            variant="process"
          />
        )}

        {project.stack.length > 0 && <ProjectStack stack={project.stack} number={nextNumber()} />}

        {project.challenges && project.challenges.length > 0 && (
          <ProjectChallenges challenges={project.challenges} number={nextNumber()} />
        )}

        {project.outcomes && project.outcomes.length > 0 && (
          <ProjectOutcomes project={project} number={nextNumber()} />
        )}

        <ProjectNext next={next} previous={previous} />
      </main>

      <BackToProjects />
    </ProjectMotion>
  );
}
