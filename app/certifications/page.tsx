import type { Metadata } from "next";
import { CERTIFICATES, CERTIFICATE_FILTERS } from "@/components/about/aboutData";
import CredentialsSection from "@/components/about/CredentialsSection";
import PageHero from "@/components/editorial/PageHero";
import EditorialMotion from "@/components/motion/EditorialMotion";

export const metadata: Metadata = {
  title: "Certifications | Fatima Sierra",
  description:
    "Certificates, certifications, workshops, training, and webinar credentials earned by Fatima Klye M. Sierra.",
};

const pad = (value: number) => String(value).padStart(2, "0");

const countFor = (category: string) => CERTIFICATES.filter((certificate) => certificate.category === category).length;

export default function CertificationsPage() {
  return (
    <EditorialMotion>
      <main>
        <PageHero
          label="Certifications"
          eyebrow="Credentials & professional development"
          index={pad(CERTIFICATES.length)}
          title={<>Proof of the <em>practice.</em></>}
          intro="Verified certifications, completed training, workshops and webinars that support my continued technical development. Select any certificate to preview it, or open the original file."
          meta={CERTIFICATE_FILTERS.filter((filter) => filter.id !== "all").map((filter) => ({
            label: filter.label.replace(/^Professional /, "").replace(/ & .*$/, ""),
            value: pad(countFor(filter.id)),
          }))}
        />
        <CredentialsSection showHeader={false} collapsible={false} />
      </main>
    </EditorialMotion>
  );
}
