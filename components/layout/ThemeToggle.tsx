"use client";

import { useEffect } from "react";
import type { MouseEvent } from "react";
import { Moon, Sun } from "lucide-react";
import { getTheme, setTheme, useTheme, watchThemeSources } from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

/**
 * Navbar Sun/Moon switch. Both icons are always rendered and CSS shows the right one from
 * <html data-theme>, so the server-rendered markup is correct for either theme with no flash.
 */
export default function ThemeToggle() {
  const isDark = useTheme() === "dark";

  // Mounted once in the persistent header: follow the system and other tabs until a choice is made.
  useEffect(() => watchThemeSources(), []);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTheme(getTheme() === "dark" ? "light" : "dark", {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={handleClick}
      aria-label="Dark mode"
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className={styles.face} aria-hidden="true">
        <Moon className={styles.moon} size={15} strokeWidth={1.9} />
        <Sun className={styles.sun} size={16} strokeWidth={1.9} />
      </span>
    </button>
  );
}
