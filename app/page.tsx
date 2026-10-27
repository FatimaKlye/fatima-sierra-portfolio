import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import { SITE_DESCRIPTION, SITE_NAME, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({ path: "/", title: SITE_NAME, description: SITE_DESCRIPTION });

export default function HomePage() {
  return (
    <main>
      <HeroSection />
    </main>
  );
}
