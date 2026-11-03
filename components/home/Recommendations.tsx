import { RECOMMENDATIONS, type Recommendation } from "./recommendationsData";
import RecommendationsShowcase, { type Testimonial } from "./RecommendationsShowcase";

const initialsOf = (name: string) => {
  const parts = name.split(/\s+/).filter((part) => /^\p{L}{2,}/u.test(part));
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
};

type WithQuote = Recommendation & { quote: string };

const isPublished = (entry: Recommendation): entry is WithQuote => entry.published && Boolean(entry.quote);

/** Quotes up to this length (characters) show in full on their card. */
const LONG_QUOTE = 600;
/** A longer quote's excerpt stays within this, so its card (plus the "Read full" button) matches a short one. */
const EXCERPT_CHARS = 330;

/**
 * The opening whole sentences of a long quote, keeping its paragraph breaks, so
 * every card has a similar footprint and nothing is cut mid-sentence. Returns
 * undefined when the quote is short enough to show in full.
 */
function excerptOf(paragraphs: string[]): string[] | undefined {
  if (paragraphs.join(" ").length <= LONG_QUOTE) return undefined;
  const excerpt: string[] = [];
  let length = 0;
  for (const paragraph of paragraphs) {
    const sentences = paragraph.split(/(?<=[.!?])\s+(?=[A-Z"“‘'])/);
    const kept: string[] = [];
    for (const sentence of sentences) {
      if (length + sentence.length > EXCERPT_CHARS && length > 0) {
        if (kept.length) excerpt.push(kept.join(" "));
        return excerpt;
      }
      kept.push(sentence);
      length += sentence.length + 1;
    }
    excerpt.push(kept.join(" "));
  }
  return undefined;
}

/** Only published entries reach this point. The untranslated original is never sent. */
function toTestimonial(entry: WithQuote): Testimonial {
  const paragraphs = entry.quote
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return {
    id: entry.id,
    name: entry.name,
    initials: initialsOf(entry.name),
    role: entry.role,
    affiliation: [entry.organization, entry.team].filter((part): part is string => Boolean(part)),
    paragraphs,
    excerpt: excerptOf(paragraphs),
    highlights: (entry.highlights ?? []).filter((phrase) => phrase && entry.quote.includes(phrase)),
    translatedFrom: entry.translation?.from,
    photo: entry.photo,
    linkedin: entry.linkedin,
  };
}

/**
 * Homepage testimonials ("Kind words"). Only recommendations marked `published`
 * cross to the browser, identically in development, production and on Vercel.
 */
export default function Recommendations({ number }: { number: string }) {
  const testimonials = RECOMMENDATIONS.filter(isPublished).map(toTestimonial);
  return <RecommendationsShowcase number={number} testimonials={testimonials} />;
}
