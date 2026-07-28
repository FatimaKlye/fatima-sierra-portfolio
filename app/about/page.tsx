import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import KnowledgeSection from "@/components/about/KnowledgeSection";
import CredentialsSection from "@/components/about/CredentialsSection";
import AchievementsSection from "@/components/about/AchievementsSection";
import LeadershipSection from "@/components/about/LeadershipSection";
import EducationSection from "@/components/about/EducationSection";
import ReferencesSection from "@/components/about/ReferencesSection";

export const metadata: Metadata = {
  title: "About | Fatima Sierra",
  description:
    "Learn about Fatima Klye M. Sierra, a web and mobile developer building practical, accessible, and dependable digital solutions.",
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <KnowledgeSection />
      <CredentialsSection />
      <AchievementsSection />
      <LeadershipSection />
      <EducationSection />
      <ReferencesSection />
    </main>
  );
}
