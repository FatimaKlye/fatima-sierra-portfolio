import type { Metadata } from "next";
import ContactSection from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Contact | Fatima Sierra",
  description:
    "Get in touch with Fatima Klye M. Sierra, a web and mobile developer open to internships and new roles. Available immediately.",
};

export default function ContactPage() {
  return (
    <main>
      <ContactSection />
    </main>
  );
}
