import type { MetadataRoute } from "next";
import { PROJECT_DETAILS } from "@/data/projectDetailsData";
import { SITE_URL } from "@/lib/site";

const PAGES = ["", "/about", "/experience", "/skills", "/projects", "/certifications", "/resume", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...PROJECT_DETAILS.map((project) => ({ url: `${SITE_URL}/projects/${project.slug}` })),
  ];
}
