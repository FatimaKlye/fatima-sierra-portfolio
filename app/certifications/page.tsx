import type { Metadata } from "next";
import CredentialsSection from "@/components/about/CredentialsSection";

export const metadata: Metadata = {
  title: "Credentials | Fatima Sierra",
  description:
    "Certificates, certifications, workshops, training, and webinar credentials earned by Fatima Klye M. Sierra.",
};

export default function CredentialsPage() {
  return (
    <main>
      <CredentialsSection />
    </main>
  );
}
