import type { Metadata } from "next";
import AboutStory from "@/components/home/about/AboutStory";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: "About | Fatima Sierra",
  description:
    "From cooking to coding — the story of Fatima Klye M. Sierra, a web and mobile developer who learned patience and precision in the kitchen before building practical, accessible digital solutions.",
});

export default function AboutPage() {
  return (
    <main>
      <AboutStory />
    </main>
  );
}
