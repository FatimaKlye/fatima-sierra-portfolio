import HeroSection from "@/components/home/HeroSection";
import SelectedProjects from "@/components/projects/SelectedProjects";
import CertificationsSection from "@/components/certificates/CertificationsSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <SelectedProjects />
      <CertificationsSection />
    </main>
  );
}
