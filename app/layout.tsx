import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import IntroGate from "@/components/intro/IntroGate";
import { INTRO_SCRIPT } from "@/components/intro/introScript";
import FairyDust from "@/components/motion/FairyDust";
import ScrollManager from "@/components/navigation/ScrollManager";
import { THEME_SCRIPT } from "@/lib/themeScript";
import SectionNav from "@/components/navigation/SectionNav";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fatima Sierra — Portfolio",
  description:
    "Portfolio of Fatima Sierra, a web and mobile developer creating purposeful, reliable, and user-centered digital solutions for public safety, education, sustainability, and connected communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The inline scripts set the theme and may flag <html> for the entrance intro before React hydrates.
    // data-scroll-behavior: Next turns the global smooth scrolling off during route changes, so
    // a new page opens at the top instantly instead of gliding there (and being interrupted).
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      </head>
      <body className={poppins.variable}>
        <ScrollManager />
        <SiteHeader />
        <SectionNav />
        {children}
        <SiteFooter />
        <FairyDust />
        <IntroGate />
        <Analytics />
      </body>
    </html>
  );
}
