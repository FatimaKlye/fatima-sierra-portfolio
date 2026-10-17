import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PROJECT_DETAILS,
  getAdjacentProjects,
  getProjectDetailBySlug,
  getProjectPosition,
} from "@/data/projectDetailsData";
import BackToProjects from "@/components/project-details/BackToProjects";
import ProjectContributions from "@/components/project-details/ProjectContributions";
import ProjectDownload from "@/components/project-details/ProjectDownload";
import ProjectFeatures from "@/components/project-details/ProjectFeatures";
import ProjectHero from "@/components/project-details/ProjectHero";
import ProjectMotion from "@/components/project-details/ProjectMotion";
import ProjectNext from "@/components/project-details/ProjectNext";
import ProjectOutcomes from "@/components/project-details/ProjectOutcomes";
import ProjectStack from "@/components/project-details/ProjectStack";

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

  const { liveUrl, repoUrl, videoUrl, apkUrl } = project.links;
  const hasResults = (project.outcomes?.length ?? 0) > 0 || Boolean(liveUrl || repoUrl || videoUrl || apkUrl);

  return (
    <ProjectMotion key={project.slug}>
      <noscript>
        <style>{`[data-motion="pending"] [data-reveal],[data-motion="pending"] [data-intro],[data-motion="pending"] [data-intro-visual],[data-motion="pending"] [data-stagger] > *{opacity:1!important;transform:none!important}[data-motion="pending"] [data-word]{transform:none!important}`}</style>
      </noscript>

      {/* Same structure on every case study: first glance → my contributions → key features →
          technologies → results & links. Sections without verified content are left out. */}
      <main>
        <ProjectHero project={project} index={index} total={total} />

        {project.contributions && project.contributions.length > 0 && (
          <ProjectContributions project={project} number={nextNumber()} />
        )}

        {project.features.length > 0 && <ProjectFeatures features={project.features} number={nextNumber()} />}

        {project.stack.length > 0 && <ProjectStack project={project} number={nextNumber()} />}

        {hasResults && <ProjectOutcomes project={project} number={nextNumber()} />}

        {project.download && (
          <ProjectDownload
            download={project.download}
            number={nextNumber()}
            phone={project.gallery.find((item) => item.frame === "phone" && !item.redact)}
          />
        )}

        <ProjectNext next={next} previous={previous} />
      </main>

      <BackToProjects />
    </ProjectMotion>
  );
}
