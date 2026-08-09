import nodemailer from "nodemailer";

export const runtime = "nodejs";

const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const GENERIC_ERROR_MESSAGE =
  "Something went wrong while sending your message. Please try again in a moment.";

type ContactPayload = {
  name: string;
  email: string;
  message: string;
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
    rateLimitStore.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  return false;
}

function validatePayload(value: unknown): ContactPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { name, email, message } = value as Record<string, unknown>;

  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return null;
  }

  const trimmedName = name.trim().slice(0, MAX_NAME_LENGTH);
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim().slice(0, MAX_MESSAGE_LENGTH);

  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    return null;
  }

  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return null;
  }

  return { name: trimmedName, email: trimmedEmail, message: trimmedMessage };
}

export async function POST(request: Request) {
  if (isRateLimited(getClientKey(request))) {
    return Response.json(
      { error: "Too many requests. Please wait a moment before trying again." },
      { status: 429 },
    );
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const recipient = process.env.CONTACT_TO_EMAIL || gmailUser;

  if (!gmailUser || !gmailAppPassword || !recipient) {
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payload = validatePayload(body);
  if (!payload) {
    return Response.json(
      { error: "Please provide a valid name, email address, and message." },
      { status: 400 },
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${gmailUser}>`,
      to: recipient,
      replyTo: `"${payload.name}" <${payload.email}>`,
      subject: `New portfolio message from ${payload.name}`,
      text: `Name: ${payload.name}\nEmail: ${payload.email}\n\nMessage:\n${payload.message}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(payload.message).replace(/\n/g, "<br />")}</p>
      `,
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 500 });
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
