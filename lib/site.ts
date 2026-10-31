import type { Metadata } from "next";

// The primary domain. The old sierraportfolio.vercel.app domain redirects here (set in Vercel's domain settings).
export const SITE_URL = "https://fatimasierra.vercel.app";
export const SITE_NAME = "Fatima Sierra — Portfolio";
export const SITE_DESCRIPTION =
  "Portfolio of Fatima Sierra, a BSIT student and web and mobile developer open to software development internships, creating purposeful, reliable, and user-centered digital solutions for public safety, education, sustainability, and connected communities.";

type PageMetadataInput = {
  path: string;
  title: string;
  description: string;
};

// Page title and description plus the canonical and Open Graph URL for that path (resolved against metadataBase).
export function pageMetadata({ path, title, description }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, url: path, title, description },
  };
}
