import { RECOMMENDATIONS, type Recommendation } from "./recommendationsData";
import RecommendationsShowcase, { type Testimonial } from "./RecommendationsShowcase";

const initialsOf = (name: string) => {
  const parts = name.split(/\s+/).filter((part) => /^\p{L}{2,}/u.test(part));
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
};

type WithQuote = Recommendation & { quote: string };

/** `next dev` previews pending quotes so the layout can be reviewed; builds never do. */
const PREVIEW_PENDING = process.env.NODE_ENV === "development";

const isPublishable = (entry: Recommendation): entry is WithQuote =>
  Boolean(entry.quote) && (entry.status === "approved" || PREVIEW_PENDING);

/** Only publishable entries reach this point. The untranslated original is never sent. */
function toTestimonial(entry: WithQuote): Testimonial {
  return {
    id: entry.id,
    name: entry.name,
    initials: initialsOf(entry.name),
    role: entry.role,
    affiliation: [entry.organization, entry.team].filter((part): part is string => Boolean(part)),
    paragraphs: entry.quote
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
    highlights: (entry.highlights ?? []).filter((phrase) => phrase && entry.quote.includes(phrase)),
    translatedFrom: entry.translation?.from,
    photo: entry.photo,
    linkedin: entry.linkedin,
    pending: entry.status !== "approved",
  };
}

/**
 * Homepage testimonials ("Kind words"). Only recommendations whose wording the
 * writer has approved cross to the browser; pending ones never leave the server
 * outside local development.
 */
export default function Recommendations({ number }: { number: string }) {
  const testimonials = RECOMMENDATIONS.filter(isPublishable).map(toTestimonial);
  return <RecommendationsShowcase number={number} testimonials={testimonials} />;
}
