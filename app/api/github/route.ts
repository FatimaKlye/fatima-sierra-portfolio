import { getGithubContributions } from "@/components/home/githubContributions";
import { SOCIAL_LINKS } from "@/components/contact/contactData";

// The username is fixed server-side so this route can't be used to proxy arbitrary lookups.
const GITHUB_USERNAME = SOCIAL_LINKS.find((link) => link.id === "github")?.handle.replace(/^@/, "") ?? "";

/** Backs the homepage GitHub section's 5-minute poll and its manual Refresh (`?fresh=1`). */
export async function GET(request: Request) {
  const fresh = new URL(request.url).searchParams.has("fresh");
  const data = GITHUB_USERNAME ? await getGithubContributions(GITHUB_USERNAME, { fresh }) : null;

  if (!data) {
    return Response.json({ error: "GitHub activity is unavailable right now." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
