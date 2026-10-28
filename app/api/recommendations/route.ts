import nodemailer from "nodemailer";
import { createHash } from "node:crypto";
import { validateRecommendation, type RecommendationFields } from "@/lib/recommendationValidation";

export const runtime = "nodejs";

// Submissions are only emailed to me for review. Nothing here publishes
// anything: a recommendation reaches the site only once I add it to
// components/home/recommendationsData.ts and the writer approves the wording.

const MIN_FILL_TIME_MS = 4000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_SUCCESS = 2;
const RATE_LIMIT_MESSAGE = "You've already sent a recommendation recently. Please try again in an hour.";
const GENERIC_ERROR_MESSAGE = "Something went wrong while sending your recommendation. Please try again in a moment.";

// Keyed by a hash of the client IP so the store never retains raw addresses.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "anonymous";
  return createHash("sha256").update(ip).digest("hex");
}

function isRateLimited(clientKey: string) {
  const entry = rateLimitStore.get(clientKey);
  if (!entry) return false;
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

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) {
    return Response.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  const recipient = process.env.CONTACT_TO_EMAIL?.trim() || gmailUser;

  if (!gmailUser || !gmailAppPassword || !recipient) {
    console.error("[recommendations] Missing email configuration (GMAIL_USER / GMAIL_APP_PASSWORD).");
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    body = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Bots that fill the hidden field get a fake success and no email is sent.
  if (typeof body.website === "string" && body.website.trim()) {
    return Response.json({ success: true });
  }

  const elapsedMs = body.elapsedMs;
  if (typeof elapsedMs !== "number" || !Number.isFinite(elapsedMs) || elapsedMs < MIN_FILL_TIME_MS) {
    return Response.json(
      { error: "That was a little fast. Please review your recommendation and send it again." },
      { status: 400 },
    );
  }

  const result = validateRecommendation(body);
  if (result.errors) {
    return Response.json({ error: "Please check the highlighted fields.", fields: result.errors }, { status: 400 });
  }

  const submission = result.data;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailAppPassword },
    });

    const submittedAt = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });

    await transporter.sendMail({
      from: `"Portfolio Recommendations" <${gmailUser}>`,
      to: recipient,
      replyTo: `"${submission.name}" <${submission.email}>`,
      subject: `Recommendation for review — ${submission.name}`,
      text: buildText(submission, submittedAt),
      html: buildHtml(submission, submittedAt),
    });

    recordSuccessfulSend(clientKey);
    return Response.json({ success: true });
  } catch (error) {
    console.error(
      "[recommendations] Failed to send via Gmail:",
      error instanceof Error ? error.message : error,
    );
    return Response.json({ error: GENERIC_ERROR_MESSAGE }, { status: 500 });
  }
}

/** A ready-to-paste entry for recommendationsData.ts, left "pending" until the writer approves it. */
function buildDataSnippet(s: RecommendationFields) {
  const id = s.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return [
    "{",
    `  id: ${JSON.stringify(id)},`,
    `  name: ${JSON.stringify(s.name)},`,
    `  role: ${JSON.stringify(s.role)},`,
    `  organization: "",`,
    `  relationship: ${JSON.stringify(s.relationship)},`,
    `  quote: ${JSON.stringify(s.message)},`,
    ...(s.linkedin ? [`  linkedin: ${JSON.stringify(s.linkedin)},`] : []),
    `  status: "pending",`,
    "},",
  ].join("\n");
}

function buildText(s: RecommendationFields, submittedAt: string) {
  return [
    "New recommendation for review (not published)",
    "",
    `Name: ${s.name}`,
    `Email: ${s.email}`,
    `Role: ${s.role}`,
    `How we worked together: ${s.relationship}`,
    `LinkedIn: ${s.linkedin || "Not provided"}`,
    `Consent to publish after review: ${s.consent ? "Yes" : "No"}`,
    "",
    "Recommendation:",
    s.message,
    "",
    "To publish: confirm the final wording with them, add this to components/home/recommendationsData.ts,",
    'then set status to "approved":',
    "",
    buildDataSnippet(s),
    "",
    `Submitted: ${submittedAt}`,
  ].join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(s: RecommendationFields, submittedAt: string) {
  const row = (label: string, value: string) => `
                  <tr>
                    <td style="padding:14px 20px; border-bottom:1px solid #e8d4de;">
                      <p style="margin:0 0 4px; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#6e5964; font-weight:600;">${label}</p>
                      <p style="margin:0; font-size:15px; color:#3b2a34;">${escapeHtml(value)}</p>
                    </td>
                  </tr>`;

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Recommendation for review</title>
  </head>
  <body style="margin:0; padding:0; background-color:#fff9fb; font-family:Segoe UI, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff9fb; padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e8d4de;">
            <tr>
              <td style="background-color:#a63d68; padding:28px 32px;">
                <p style="margin:0; color:#f6dde7; font-size:12px; letter-spacing:1px; text-transform:uppercase; font-weight:600;">Sierra Portfolio · Not published</p>
                <h1 style="margin:6px 0 0; color:#ffffff; font-size:20px; font-weight:700;">Recommendation for review</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff0f5; border:1px solid #e8d4de; border-radius:12px;">
                  ${row("Name", s.name)}
                  ${row("Email", s.email)}
                  ${row("Role", s.role)}
                  ${row("How we worked together", s.relationship)}
                  ${row("LinkedIn", s.linkedin || "Not provided")}
                  ${row("Consent to publish after review", s.consent ? "Yes" : "No")}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 8px;">
                <p style="margin:0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#6e5964; font-weight:600;">Recommendation</p>
                <p style="margin:0; font-size:16px; line-height:1.65; color:#3b2a34;">${escapeHtml(s.message).replace(/\n/g, "<br />")}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 8px;">
                <p style="margin:0 0 8px; font-size:12px; color:#6e5964;">To publish: confirm the final wording with them, add this to <code>components/home/recommendationsData.ts</code>, then set <code>status: "approved"</code>.</p>
                <pre style="margin:0; padding:14px; background:#2a1c24; color:#f6dde7; border-radius:10px; font-size:12px; line-height:1.5; white-space:pre-wrap;">${escapeHtml(buildDataSnippet(s))}</pre>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;">
                <p style="margin:0; text-align:center; font-size:12px; color:#6e5964;">Submitted ${escapeHtml(submittedAt)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
