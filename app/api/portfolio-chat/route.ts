import { anthropic } from "@ai-sdk/anthropic";
import { streamText, type ModelMessage } from "ai";
import {
  ACHIEVEMENTS,
  CORE_KNOWLEDGE,
  EDUCATION,
  HERO_CONTENT,
  LEARNING_EXPOSURE,
  PROFESSIONAL_SKILLS,
} from "@/components/about/aboutData";
import { CERTIFICATES as SUMMARY_CERTIFICATES } from "@/components/certificates/certificatesData";
import { PROJECTS } from "@/components/projects/projectsData";
import { PROJECT_DETAILS } from "@/data/projectDetailsData";
import {
  CHATBOT_KNOWLEDGE,
  UNAVAILABLE_RESPONSE,
} from "@/data/chatbotKnowledge";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 8;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const MODEL_ID = "claude-sonnet-5";
const GENERIC_ERROR_MESSAGE =
  "I'm sorry, the portfolio assistant is unavailable right now. Please try again later or send your question through the Contact page.";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0]?.trim() || realIp || "anonymous";
}

function isRateLimited(clientKey: string) {
  const now = Date.now();
  const current = rateLimitStore.get(clientKey);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(clientKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  return false;
}

function isIncomingMessage(value: unknown): value is IncomingMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<IncomingMessage>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  );
}

function validateMessages(value: unknown): IncomingMessage[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const messages = value.filter(isIncomingMessage).slice(-MAX_HISTORY_MESSAGES);
  const sanitized = messages
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((message) => message.content.length > 0);

  if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== "user") {
    return null;
  }

  return sanitized;
}

function formatList(items: readonly string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function buildVerifiedContext() {
  const projects = PROJECTS.map((project) => {
    const details = PROJECT_DETAILS.find((item) => item.slug === project.slug);

    return [
      `Project: ${project.title}`,
      `Category: ${project.category}`,
      `Summary: ${details?.summary || project.description}`,
      `Technologies: ${project.technologies.join(", ")}`,
      `Role: ${details?.role || "Role not currently specified"}`,
      details ? `Status: ${details.status}` : undefined,
      details ? `Created for: ${details.overview.createdFor}` : undefined,
      details ? `Problem: ${details.problemAndSolution.problem}` : undefined,
      details ? `Solution: ${details.problemAndSolution.solution}` : undefined,
      details ? `Personal contributions:\n${formatList(details.contributions)}` : undefined,
      details
        ? `Features:\n${details.features
            .map((feature) => `- ${feature.title}: ${feature.description}`)
            .join("\n")}`
        : undefined,
      details ? `Impact:\n${formatList(details.impact)}` : undefined,
      details ? `Skills demonstrated:\n${formatList(details.skills)}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");
  }).join("\n\n");

  const certificates = SUMMARY_CERTIFICATES.map(
    (certificate) =>
      `- ${certificate.title}: ${certificate.credentialName}, ${certificate.issuer}, awarded ${certificate.dateAwarded}. Credential ID: ${certificate.credentialId}.`,
  ).join("\n");

  return [
    `Assistant name: ${CHATBOT_KNOWLEDGE.assistantName}`,
    `Professional introduction: ${CHATBOT_KNOWLEDGE.professionalIntroduction}`,
    `Portfolio intro: ${HERO_CONTENT.tagline} ${HERO_CONTENT.introParagraphs.join(" ")}`,
    `Availability: ${CHATBOT_KNOWLEDGE.availability}`,
    `Development approach: ${CHATBOT_KNOWLEDGE.developmentApproach}`,
    `Safe contact guidance: ${CHATBOT_KNOWLEDGE.safeContactGuidance}`,
    `Unavailable response: ${UNAVAILABLE_RESPONSE}`,
    "",
    "Technical knowledge:",
    CORE_KNOWLEDGE.map((item) => `- ${item.title}: ${item.description}`).join("\n"),
    "",
    "Technologies, tools, and learning exposure:",
    formatList(LEARNING_EXPOSURE),
    "",
    "Professional skills:",
    formatList(PROFESSIONAL_SKILLS),
    "",
    "Projects:",
    projects,
    "",
    "FOCUSIT:",
    CHATBOT_KNOWLEDGE.focusit,
    "",
    "Certifications and training:",
    certificates,
    "",
    "Education:",
    EDUCATION.map(
      (item) =>
        `- ${item.institution}: ${item.detail || "Education record"} (${item.location}, ${item.years})`,
    ).join("\n"),
    "",
    "Academic recognition:",
    ACHIEVEMENTS.map((item) => `- ${item.institution}: ${item.title} (${item.years})`).join("\n"),
  ].join("\n");
}

const SYSTEM_PROMPT = `You are the portfolio assistant for Fatima Klye M. Sierra, a Web and Mobile Developer.

Answer employer questions using only the verified portfolio information provided to you.

You may answer questions about:
- Fatima's projects
- Technical skills and tools
- Project responsibilities and contributions
- Certificates and training
- Education
- Development approach
- Internship and employment interests

Rules:
1. Never invent experience, achievements, employers, skills, dates, project results, project impact, or responsibilities.
2. Clearly distinguish Fatima's individual contribution from team contributions.
3. Never claim that Fatima completed an entire group project alone.
4. When information is unavailable, respond:
   "${UNAVAILABLE_RESPONSE}"
5. Do not reveal private phone numbers, addresses, references, account information, or unpublished personal information.
6. Do not make promises, commitments, interview confirmations, or decisions on Fatima's behalf.
7. Do not negotiate salary, schedules, contracts, or employment terms.
8. Do not answer unrelated general-knowledge questions.
9. Keep every response concise, professional, clear, and employer-focused.
10. Do not output HTML or executable code.

Verified portfolio information:
${buildVerifiedContext()}`;

export async function POST(request: Request) {
  if (isRateLimited(getClientKey(request))) {
    return Response.json(
      { error: "Too many requests. Please wait a moment before trying again." },
      { status: 429 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { messages?: unknown };
    const messages = validateMessages(body.messages);

    if (!messages) {
      return Response.json(
        { error: "Please send a valid portfolio question." },
        { status: 400 },
      );
    }

    const result = streamText({
      model: anthropic(MODEL_ID),
      system: SYSTEM_PROMPT,
      messages: messages as ModelMessage[],
      maxOutputTokens: 450,
    });

    return result.toTextStreamResponse();
  } catch {
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 500 });
  }
}

