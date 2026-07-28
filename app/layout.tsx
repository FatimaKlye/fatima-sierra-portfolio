import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import SiteHeader from "@/components/layout/SiteHeader";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fatima Sierra | Web & Mobile Developer",
  description:
    "Portfolio of Fatima Sierra, a web and mobile developer creating purposeful, reliable, and user-centered digital solutions for public safety, education, sustainability, and connected communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.variable}>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
