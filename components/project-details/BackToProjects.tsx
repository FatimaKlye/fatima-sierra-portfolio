"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./ProjectDetails.module.css";

/** Floating shortcut back to the carousel; appears once the hero has scrolled away. */
export default function BackToProjects() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setVisible(window.scrollY > 560));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <Link
      href="/#projects"
      className={`${styles.floatingBack} ${visible ? styles.floatingBackShown : ""}`}
      aria-label="Back to Projects"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      <span>Projects</span>
    </Link>
  );
}
