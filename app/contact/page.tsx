import type { Metadata } from "next";
import ContactPanel from "@/components/contact/ContactPanel";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: "Contact | Fatima Sierra",
  description:
    "Say hello to Fatima Klye M. Sierra, a web and mobile developer open to software development internships. Have an idea, an opportunity, a recommendation, or just want to say hi? Send a message or reach out directly.",
});

export default function ContactPage() {
  return (
    <main>
      <ContactPanel headingId="contact-heading" headingLevel={1} />
    </main>
  );
}
