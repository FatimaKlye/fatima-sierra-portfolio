// Testimonials shown on the homepage ("Kind words").
//
// Server-only data: it is read by Recommendations.tsx (a server component),
// which hands the browser only what may be shown. A quote whose `status` is
// not `published` never leaves the server, so draft wording is never shown.
//
// Rules:
// - Only add real collaborators, with details you have verified.
// - `quote` is their own words, unedited. Set `published: true` only after
//   they have reviewed the exact wording and agreed to have it published.
// - `photo` and `linkedin` only with their consent / a verified profile.
// - Order here is the order on the page; the first entry is shown first.
//
// Only published quotes are shown, the same way in `next dev`, production
// builds and on Vercel. With none published, the section shows just its
// heading and the "Share a few words" invite; with several, it becomes a
// carousel. Quotes longer than about Andrei's open as a whole-sentence excerpt
// with a "Read full recommendation" dialog.
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
//   quote: "Their words, unedited.",                // optional until received; "\n\n" between paragraphs
//   translation: { from: "Filipino", original: "…" }, // only if `quote` is a translation
//   highlights: ["a phrase from the quote"],        // optional, each copied verbatim from quote
//   date: "2026-10",                                // optional, YYYY-MM or YYYY-MM-DD
//   photo: { src: "/assets/recommendations/firstname-lastname.jpg", alt: "Portrait of …" },
//   linkedin: "https://www.linkedin.com/in/…",      // optional, verified
//   published: false,                               // true once they sign off
// },

export type Recommendation = {
  id: string;
  name: string;
  role: string;
  organization: string;
  team?: string;
  relationship: string;
  context?: string;
  /** Paragraphs are separated by a blank line ("\n\n"). */
  quote?: string;
  /** Set when `quote` is a translation. `original` stays on the server. */
  translation?: { from: string; original?: string };
  /** Phrases copied verbatim from `quote`, subtly emphasised. */
  highlights?: string[];
  /** YYYY-MM or YYYY-MM-DD. */
  date?: string;
  /** Headshot in /public/assets/recommendations/, shared with their consent. */
  photo?: { src: string; alt: string };
  linkedin?: string;
  /** Shown on the site. Set to true only once the writer has approved the exact wording. */
  published: boolean;
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
    // Wording approved by Andrei for publication.
    quote:
      "Fatima is one of the best teammates I've had the opportunity to work with. She's dependable, highly organized, and consistently delivers her responsibilities on time. She's also driven, competitive in a positive way, and always strives to produce quality work. Throughout our capstone project, I could count on her dedication, initiative, and commitment to the team's success. She's someone you can genuinely rely on.",
    highlights: [
      "dependable, highly organized",
      "consistently delivers her responsibilities on time",
      "someone you can genuinely rely on",
    ],
    published: true,
  },
  {
    id: "sarah-macandile",
    name: "Sarah Macandile",
    role: "Capstone Team Member & Documenter",
    organization: "IGNIS SAFE",
    team: "SIQUILE DYNAMICS",
    relationship: "Capstone groupmate",
    // English translation of her original mixed English and Filipino message,
    // approved by Sarah for publication.
    quote:
      "Working with you was honestly a great experience! One thing I really appreciate about you is how you naturally take the lead and make sure everyone in the group feels included.\n\n" +
      "You're the kind of person who starts conversations and encourages everyone to share their ideas and suggestions. I really admire that because you don't just focus on your own ideas — you genuinely listen to and consider what others have to say.\n\n" +
      "You're also very understanding and caring toward the team, which makes working with you much easier and more comfortable. I also love how creative you are and how you see things from different perspectives, especially when we're making decisions together.\n\n" +
      "I'm really glad I got to be your groupmate. Thank you for all your effort and patience! I know you'll do great in whatever you choose to do next. Good luck always!",
    translation: {
      from: "Filipino and English",
      // original: "…",  // her message as submitted; kept on record, never rendered
    },
    highlights: [
      "naturally take the lead and make sure everyone in the group feels included",
      "you genuinely listen to and consider what others have to say",
      "how creative you are",
    ],
    published: true,
  },
];
