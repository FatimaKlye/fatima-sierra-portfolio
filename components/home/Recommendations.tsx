import { RECOMMENDATIONS, type Recommendation } from "./recommendationsData";
import RecommendationsShowcase, { type Testimonial } from "./RecommendationsShowcase";

const initialsOf = (name: string) => {
  const parts = name.split(/\s+/).filter((part) => /^\p{L}{2,}/u.test(part));
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
};

type Approved = Recommendation & { quote: string };

const isApproved = (entry: Recommendation): entry is Approved => entry.status === "approved" && Boolean(entry.quote);

/** Only approved entries reach this point, so the quote is safe to publish. */
function toTestimonial(entry: Approved): Testimonial {
  return {
    id: entry.id,
    name: entry.name,
    initials: initialsOf(entry.name),
    role: entry.role,
    affiliation: [entry.organization, entry.team].filter((part): part is string => Boolean(part)),
    quote: entry.quote,
    highlights: (entry.highlights ?? []).filter((phrase) => phrase && entry.quote.includes(phrase)),
    photo: entry.photo,
    linkedin: entry.linkedin,
  };
}

/**
 * Homepage testimonials ("Kind words"). Only recommendations whose wording the
 * writer has approved cross to the browser; pending ones never leave the server.
 */
export default function Recommendations({ number }: { number: string }) {
  const testimonials = RECOMMENDATIONS.filter(isApproved).map(toTestimonial);
  return <RecommendationsShowcase number={number} testimonials={testimonials} />;
}
