// Recommendations shown on the homepage ("The people I've worked with").
//
// Only add genuine recommendations, quoted exactly as written by the person,
// and only after they have agreed to have it published — set `permission: true`
// once they have. Entries without permission stay hidden. Order here is the
// order on the page; delete an entry to remove it.
//
// Template (copy into the array and fill in):
// {
//   id: "firstname-lastname",                 // unique, lowercase
//   name: "Their full name",
//   role: "Their title @ organisation",       // e.g. "Instructor @ National University"
//   relationship: "How they know me",         // e.g. "Capstone adviser", "Project teammate"
//   quote: "Their words, unedited.",
//   photo: "/assets/recommendations/firstname-lastname.jpg", // optional, square, with their consent
//   permission: true,
// },

export type Recommendation = {
  id: string;
  name: string;
  role: string;
  relationship: string;
  quote: string;
  /** Optional square headshot in /public/assets/recommendations/. */
  photo?: string;
  /** Set to true only once the person has agreed to be published. */
  permission: boolean;
};

export const RECOMMENDATIONS: Recommendation[] = [];

export const PUBLISHED_RECOMMENDATIONS = RECOMMENDATIONS.filter((entry) => entry.permission);
