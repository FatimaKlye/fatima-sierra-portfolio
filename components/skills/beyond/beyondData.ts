// "Beyond the code" on /skills: certificates, the topics they introduced, and professional skills.
// Every note below restates a certificate's own title/issuer or a documented role — nothing is
// inferred. Topic and skill names come straight from aboutData so the lists can't drift apart.

import {
  CERTIFICATES,
  LEARNING_EXPOSURE,
  PROFESSIONAL_SKILLS,
  type CertificateRecord,
} from "@/components/about/aboutData";

/** Pixel size of each certificate image, measured from the files, so frames keep the real proportions. */
const CERTIFICATE_SIZES: Record<string, { width: number; height: number }> = {
  "html-and-css": { width: 1584, height: 1224 },
  databases: { width: 1584, height: 1224 },
  "modern-web-ai-uiux": { width: 1684, height: 1191 },
  "beyond-spreadsheets": { width: 1684, height: 1191 },
  "tech4all-uiux": { width: 1685, height: 1191 },
  "armada-logics-javascript": { width: 2000, height: 1414 },
  "cybersecurity-orientation": { width: 1440, height: 810 },
  "digital-startup-dsdap": { width: 1440, height: 810 },
  "egovph-orientation": { width: 1440, height: 810 },
  "women-leading-innovation": { width: 1440, height: 810 },
  "building-apis-nodejs": { width: 1684, height: 1190 },
  "software-development-101": { width: 2000, height: 1414 },
  iotverse: { width: 1684, height: 1191 },
  "coding-to-csuite": { width: 2000, height: 1414 },
  "intro-tech-world-cloud": { width: 1684, height: 1192 },
  "exploring-cloud-computing-construction": { width: 1684, height: 1192 },
};

export type ExhibitCertificate = CertificateRecord & {
  image: string;
  width: number;
  height: number;
};

const toExhibit = (record: CertificateRecord): ExhibitCertificate => ({
  ...record,
  image: (record.fileType === "image" ? record.fileUrl : record.previewImage) ?? record.fileUrl,
  ...(CERTIFICATE_SIZES[record.id] ?? { width: 1684, height: 1191 }),
});

/** Featured certifications open the exhibition; the rest follow in their existing order. */
export const EXHIBIT_CERTIFICATES: ExhibitCertificate[] = [
  ...CERTIFICATES.filter((certificate) => certificate.featured),
  ...CERTIFICATES.filter((certificate) => !certificate.featured),
].map(toExhibit);

export const certificateById = (id: string) => EXHIBIT_CERTIFICATES.find((certificate) => certificate.id === id);

/* Technical exposure ------------------------------------------------------------------- */

export type ExposureLevel = "introductory" | "applied";

export type ExposureTopic = {
  title: string;
  level: ExposureLevel;
  format: string;
  note: string;
  certificateIds: string[];
  link?: { href: string; label: string };
};

const EXPOSURE_NOTES: Record<string, Omit<ExposureTopic, "title">> = {
  "Cybersecurity awareness": {
    level: "introductory",
    format: "Orientation · Webinar",
    note: "DICT Region IV-A's Cybersecurity Orientation at NU Dasmariñas, followed by a CSP webinar on cybersecurity and systems biology.",
    certificateIds: ["cybersecurity-orientation", "women-leading-innovation"],
  },
  "Cloud computing concepts": {
    level: "introductory",
    format: "Webinars",
    note: "Two INF234 sessions: an introduction to the tech world and cloud computing, and cloud computing's role in construction management.",
    certificateIds: ["intro-tech-world-cloud", "exploring-cloud-computing-construction"],
  },
  "Internet of Things concepts": {
    level: "introductory",
    format: "Webinar",
    note: "IOTVERSE, a Mindoro State University webinar on the future of connectivity and innovation in the Internet of Things.",
    certificateIds: ["iotverse"],
  },
  "API development concepts": {
    level: "introductory",
    format: "Webinar",
    note: "Dev Squads' webinar on building APIs with Node.js, Prisma and MySQL, held over Google Meet.",
    certificateIds: ["building-apis-nodejs"],
  },
  "Node.js, Prisma, and MySQL concepts": {
    level: "introductory",
    format: "Webinar",
    note: "The stack behind that same Dev Squads session. My own projects use Supabase and PostgreSQL instead.",
    certificateIds: ["building-apis-nodejs"],
  },
  "Data analytics and visualization": {
    level: "introductory",
    format: "Course completion",
    note: "Beyond Spreadsheets: Visualizing Data's Story Through Analytics, completed with the NU Dasmariñas Computer Society.",
    certificateIds: ["beyond-spreadsheets"],
  },
  "Basic JavaScript training": {
    level: "applied",
    format: "Coding training",
    note: "Armada Logics' online coding training for basic JavaScript. JavaScript has since become part of my everyday web stack.",
    certificateIds: ["armada-logics-javascript"],
    link: { href: "#stack", label: "See it in my core stack" },
  },
  "Startup and digital-product development": {
    level: "introductory",
    format: "Program caravan",
    note: "DICT Region IV-A's Digital Startup Development and Acceleration Program Caravan, held at National University – Dasmariñas.",
    certificateIds: ["digital-startup-dsdap"],
  },
};

export const EXPOSURE_TOPICS: ExposureTopic[] = LEARNING_EXPOSURE.map((title) => ({
  title,
  ...(EXPOSURE_NOTES[title] ?? { level: "introductory", format: "", note: "", certificateIds: [] }),
}));

/** Topics each certificate introduced, for linking the exhibition back to the index. */
export const topicsForCertificate = (id: string) =>
  EXPOSURE_TOPICS.filter((topic) => topic.certificateIds.includes(id)).map((topic) => topic.title);

/** Latest year among a topic's certificates, e.g. "2025". */
export const topicYear = (topic: ExposureTopic) => {
  const years = topic.certificateIds
    .map((id) => certificateById(id)?.date?.match(/\d{4}/)?.[0])
    .filter(Boolean) as string[];
  return years.sort().at(-1) ?? "";
};

/* Professional skills ------------------------------------------------------------------- */

export type SkillNote = {
  title: string;
  /** Where the skill is documented. Without a documented example, only the source is shown. */
  evidence?: string;
  source: string;
};

const SKILL_NOTES: Record<string, Omit<SkillNote, "title">> = {
  "Organizational skills": {
    evidence:
      "Assistant Secretary of the IGNIS SAFE capstone team, and a former member of the NU Dasmariñas Computer Society's Registration Committee.",
    source: "IGNIS SAFE · Leadership & involvement",
  },
  "Strategic planning and scheduling": {
    evidence:
      "As a systems analyst on IGNIS SAFE, I helped translate BFP Dasmariñas requirements into system workflows, database structures and features before they were built.",
    source: "IGNIS SAFE case study",
  },
  "Time management": {
    source: "Résumé",
  },
  "Verbal and written communication": {
    evidence:
      "Technical and test documentation, requirements organization and workflow explanations are part of how I hand work over.",
    source: "System documentation",
  },
  Collaboration: {
    evidence:
      "Assistant website team leader on Maddy & Cassy Rentals, helping coordinate development work and resolve implementation issues. IGNIS SAFE was a team capstone built with BFP Dasmariñas.",
    source: "Maddy & Cassy Rentals · IGNIS SAFE",
  },
  Adaptability: {
    evidence:
      "I moved from a Home Economics track — Cookery and Bread & Pastry NC II — into Information Technology, and kept the same step-by-step patience.",
    source: "My story",
  },
};

export const SKILL_NOTES_LIST: SkillNote[] = PROFESSIONAL_SKILLS.map((title) => ({
  title,
  ...(SKILL_NOTES[title] ?? { source: "Résumé" }),
}));
