// Recommendations shown on the homepage ("The people I've worked with").
//
// Server-only data: it is read by Recommendations.tsx (a server component),
// which hands the browser only what may be shown. A quote whose `status` is
// still "pending" never leaves the server, so draft wording is never published.
//
// Rules:
// - Only add real collaborators, with details you have verified.
// - `quote` is their own words, unedited. Set `status: "approved"` only after
//   they have reviewed the exact wording and agreed to have it published.
// - `photo` and `linkedin` only with their consent / a verified profile.
// - Order here is the order on the page; the first entry is featured.
//
// While no quote is approved, the first entry is shown as a "featured
// collaborator" spotlight: name, role and project only, no quote.
//
// Template (copy into the array and fill in):
// {
//   id: "firstname-lastname",                       // unique, lowercase
//   name: "Their full name",
//   role: "Their title",                            // e.g. "Capstone Adviser"
//   organization: "Project or organisation",        // e.g. "National University"
//   team: "Team name",                              // optional
//   relationship: "How they know me",               // e.g. "Project teammate"
//   context: "One sentence on what we worked on.",  // optional, factual
//   quote: "Their words, unedited.",                // optional until received
//   highlight: "a phrase from the quote",           // optional, copied verbatim from quote
//   date: "2026-10",                                // optional, YYYY-MM or YYYY-MM-DD
//   photo: { src: "/assets/recommendations/firstname-lastname.jpg", alt: "Portrait of …" },
//   linkedin: "https://www.linkedin.com/in/…",      // optional, verified
//   status: "pending",                              // "approved" once they sign off
// },

export type RecommendationStatus = "pending" | "approved";

export type Recommendation = {
  id: string;
  name: string;
  role: string;
  organization: string;
  team?: string;
  relationship: string;
  context?: string;
  quote?: string;
  /** A phrase copied verbatim from `quote`, set in the accent colour. */
  highlight?: string;
  /** YYYY-MM or YYYY-MM-DD. */
  date?: string;
  /** Headshot in /public/assets/recommendations/, shared with their consent. */
  photo?: { src: string; alt: string };
  linkedin?: string;
  status: RecommendationStatus;
};

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "andrei-quias",
    name: "Andrei C. Quias",
    role: "Project Manager & Capstone Team Leader",
    organization: "IGNIS SAFE",
    team: "SIQUILE DYNAMICS",
    relationship: "Capstone teammate & project leader",
    context:
      "We built IGNIS SAFE together: a mobile fire-safety learning app and web management system for BFP Dasmariñas City Fire Station.",
    // Proposed wording, awaiting Andrei's review. Hidden until status is "approved".
    quote:
      "Fatima is one of the best teammates I've had the opportunity to work with. She's dependable, highly organized, and consistently delivers her responsibilities on time. She's also driven, competitive in a positive way, and always strives to produce quality work. Throughout our capstone project, I could count on her dedication, initiative, and commitment to the team's success. She's someone you can genuinely rely on.",
    highlight: "someone you can genuinely rely on",
    status: "pending",
  },
];
