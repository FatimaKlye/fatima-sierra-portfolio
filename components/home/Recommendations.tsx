import { RECOMMENDATIONS, type Recommendation } from "./recommendationsData";
import RecommendationsShowcase, { type ShowcaseEntry } from "./RecommendationsShowcase";

const dateLabel = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month) return date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    ...(day ? { day: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day || 1)));
};

const initialsOf = (name: string) => {
  const parts = name.split(/\s+/).filter((part) => /^\p{L}{2,}/u.test(part));
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
};

/**
 * Only what may be public crosses to the browser: the quote, highlight and
 * date are dropped unless the writer has approved the wording.
 */
function toEntry(entry: Recommendation): ShowcaseEntry {
  const quote = entry.status === "approved" && entry.quote ? entry.quote : null;
  return {
    id: entry.id,
    name: entry.name,
    initials: initialsOf(entry.name),
    role: entry.role,
    organization: entry.organization,
    team: entry.team,
    relationship: entry.relationship,
    context: entry.context,
    quote,
    highlight: quote && entry.highlight && quote.includes(entry.highlight) ? entry.highlight : undefined,
    date: quote && entry.date ? { label: dateLabel(entry.date), iso: entry.date } : undefined,
    photo: entry.photo,
    linkedin: entry.linkedin,
  };
}

/**
 * Homepage social proof ("The people I've worked with"). Shows approved
 * recommendations; until there are any, the first collaborator is featured
 * with their verified details only.
 */
export default function Recommendations({ number }: { number: string }) {
  const approved = RECOMMENDATIONS.filter((entry) => entry.status === "approved" && entry.quote);
  const entries = (approved.length ? approved : RECOMMENDATIONS.slice(0, 1)).map(toEntry);

  return <RecommendationsShowcase number={number} entries={entries} />;
}
