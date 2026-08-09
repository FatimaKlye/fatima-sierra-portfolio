import nodemailer from "nodemailer";
import { resolveMx, resolve4, resolve6 } from "node:dns/promises";
import { createHash } from "node:crypto";

export const runtime = "nodejs";

const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 1000;
const NAME_PATTERN = /^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u;
const EMAIL_PATTERN =
  /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_SUCCESS = 2;
const RATE_LIMIT_MESSAGE = "You've reached the message limit. Please try again in 1 hour.";
const GENERIC_ERROR_MESSAGE =
  "Something went wrong while sending your message. Please try again in a moment.";

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

// Keyed by a hash of the client IP so the store never retains raw addresses.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "anonymous";
  return createHash("sha256").update(ip).digest("hex");
}

function isRateLimited(clientKey: string): boolean {
  const entry = rateLimitStore.get(clientKey);
  if (!entry) {
    return false;
  }

  if (entry.resetAt <= Date.now()) {
    rateLimitStore.delete(clientKey);
    return false;
  }

  return entry.count >= RATE_LIMIT_MAX_SUCCESS;
}

function recordSuccessfulSend(clientKey: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(clientKey);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }

  entry.count += 1;
}

function extractHoneypot(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  const { website } = value as Record<string, unknown>;
  return typeof website === "string" ? website.trim() : "";
}

function validatePayload(value: unknown): ContactPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { name, email, message } = value as Record<string, unknown>;

  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return null;
  }

  const trimmedName = name.trim().replace(/\s+/g, " ").slice(0, MAX_NAME_LENGTH);
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    return null;
  }

  if (!NAME_PATTERN.test(trimmedName)) {
    return null;
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return null;
  }

  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return null;
  }

  return { name: trimmedName, email: trimmedEmail, message: trimmedMessage };
}

async function hasDeliverableDomain(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) {
    return false;
  }

  try {
    const mxRecords = await resolveMx(domain);
    if (mxRecords.length > 0) {
      return true;
    }
  } catch {
    // No MX records or DNS lookup failed; fall back to A/AAAA records
    // since mail can still be routed to a host with no explicit MX entry.
  }

  try {
    const aRecords = await resolve4(domain);
    if (aRecords.length > 0) {
      return true;
    }
  } catch {
    // ignore, try AAAA next
  }

  try {
    const aaaaRecords = await resolve6(domain);
    return aaaaRecords.length > 0;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return Response.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  const recipient = process.env.CONTACT_TO_EMAIL?.trim() || gmailUser;

  if (!gmailUser || !gmailAppPassword || !recipient) {
    console.error(
      "[contact] Missing email configuration. Ensure GMAIL_USER and GMAIL_APP_PASSWORD are set to real values in the environment.",
    );
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (extractHoneypot(body)) {
    // Bots that fill the hidden field get a fake success and no email is sent.
    return Response.json({ success: true });
  }

  const payload = validatePayload(body);
  if (!payload) {
    return Response.json(
      { error: "Please provide a valid name, email address, and message." },
      { status: 400 },
    );
  }

  if (!(await hasDeliverableDomain(payload.email))) {
    return Response.json(
      { error: "Please enter an email address with a valid, deliverable domain." },
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

    recordSuccessfulSend(clientKey);
    return Response.json({ success: true });
  } catch (error) {
    console.error(
      "[contact] Failed to send message via Gmail:",
      error instanceof Error ? error.message : error,
    );
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
