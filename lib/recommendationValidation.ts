// Shared by the recommendation form (client) and /api/recommendations (server),
// so both sides apply exactly the same rules and messages.

export const RECOMMENDATION_LIMITS = {
  name: 100,
  email: 254,
  role: 120,
  relationship: 160,
  messageMin: 40,
  messageMax: 1200,
  linkedin: 200,
} as const;

export type RecommendationFields = {
  name: string;
  email: string;
  role: string;
  relationship: string;
  message: string;
  linkedin: string;
  consent: boolean;
};

export type RecommendationField = keyof RecommendationFields;
export type RecommendationErrors = Partial<Record<RecommendationField, string>>;

export type RecommendationResult =
  | { data: RecommendationFields; errors: null }
  | { data: null; errors: RecommendationErrors };

// Letters, spaces, apostrophes, hyphens and initials ("Andrei C. Quias").
const NAME_PATTERN = /^\p{L}[\p{L}\p{M}' .-]*$/u;
const EMAIL_PATTERN =
  /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const LINKEDIN_PATTERN = /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[\w%-]+\/?$/i;

const clean = (value: unknown) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "");

/** Accepts "linkedin.com/in/name" and "www.linkedin.com/in/name" as well as full URLs. */
export function normalizeLinkedin(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed.replace(/^http:/i, "https:") : `https://${trimmed}`;
}

export function validateRecommendation(input: unknown): RecommendationResult {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  const data: RecommendationFields = {
    name: clean(raw.name),
    email: clean(raw.email),
    role: clean(raw.role),
    relationship: clean(raw.relationship),
    // Line breaks in the recommendation itself are kept.
    message: typeof raw.message === "string" ? raw.message.trim() : "",
    linkedin: normalizeLinkedin(clean(raw.linkedin)),
    consent: raw.consent === true,
  };

  const errors: RecommendationErrors = {};
  const L = RECOMMENDATION_LIMITS;

  if (!data.name) errors.name = "Please add your full name.";
  else if (data.name.length > L.name || !NAME_PATTERN.test(data.name)) errors.name = "Please use letters only for your name.";

  if (!data.email) errors.email = "Please add your email so I can confirm with you.";
  else if (data.email.length > L.email || !EMAIL_PATTERN.test(data.email)) errors.email = "Please enter a valid email address.";

  if (!data.role) errors.role = "Please add your role or title.";
  else if (data.role.length > L.role) errors.role = `Please keep this under ${L.role} characters.`;

  if (!data.relationship) errors.relationship = "Please say how we worked together.";
  else if (data.relationship.length > L.relationship) errors.relationship = `Please keep this under ${L.relationship} characters.`;

  if (!data.message) errors.message = "Please write your recommendation.";
  else if (data.message.length < L.messageMin) errors.message = `A few more words, please (at least ${L.messageMin} characters).`;
  else if (data.message.length > L.messageMax) errors.message = `Please keep it under ${L.messageMax} characters.`;

  if (data.linkedin && (data.linkedin.length > L.linkedin || !LINKEDIN_PATTERN.test(data.linkedin))) {
    errors.linkedin = "Please use your profile link, e.g. linkedin.com/in/your-name.";
  }

  if (!data.consent) errors.consent = "Please confirm I may publish this once we've reviewed it together.";

  return Object.keys(errors).length ? { data: null, errors } : { data, errors: null };
}
