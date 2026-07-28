export type Certificate = {
  id: string;
  title: string;
  credentialName: string;
  issuer: string;
  dateAwarded: string;
  credentialId: string;
  certificateUrl: string;
  previewImage: string;
  previewAlt: string;
};

export const CERTIFICATES: Certificate[] = [
  {
    id: "html-and-css",
    title: "HTML and CSS",
    credentialName: "Information Technology Specialist",
    issuer: "Certiport / Pearson",
    dateAwarded: "June 8, 2026",
    credentialId: "w63hn-48eh",
    certificateUrl: "/assets/certificates/html-and-css.pdf",
    previewImage: "/assets/certificates/html-and-css-preview.png",
    previewAlt: "HTML and CSS Information Technology Specialist certificate preview",
  },
  {
    id: "databases",
    title: "Databases",
    credentialName: "Information Technology Specialist",
    issuer: "Certiport / Pearson",
    dateAwarded: "June 3, 2025",
    credentialId: "oeeq-uSrC",
    certificateUrl: "/assets/certificates/databases.pdf",
    previewImage: "/assets/certificates/databases-preview.png",
    previewAlt: "Databases Information Technology Specialist certificate preview",
  },
];
