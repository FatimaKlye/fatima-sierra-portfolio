import type { Metadata } from "next";
import ContactPanel from "@/components/contact/ContactPanel";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: "Contact | Fatima Sierra",
  description:
    "Get in touch with Fatima Klye M. Sierra, a web and mobile developer open to internships and new roles. Available immediately.",
});

export default function ContactPage() {
  return (
    <main>
      <ContactPanel headingId="contact-heading" headingLevel={1} />
    </main>
  );
}
