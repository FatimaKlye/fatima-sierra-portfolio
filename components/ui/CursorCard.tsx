"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import styles from "./CursorCard.module.css";

export interface CursorCardProps {
  children: React.ReactNode;
  image: string;
  description: string;
  className?: string;
}

/**
 * Inline hover trigger that shows a small image + description card
 * following the cursor. Falls back to a static, non-interactive style
 * on touch/coarse-pointer devices (no popup to follow).
 */
export function CursorCard({ children, image, description, className }: CursorCardProps) {
  const [isActive, setIsActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(media.matches);
    const handleChange = () => setCanHover(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    x.set(e.clientX - 120);
    y.set(e.clientY + 20);
  };

  const positionNearElement = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(rect.left);
    y.set(rect.bottom + 12);
  };

  return (
    <>
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        className={cn(styles.trigger, canHover && styles.triggerHoverable, className)}
        onMouseEnter={() => canHover && setIsActive(true)}
        onMouseLeave={() => canHover && setIsActive(false)}
        onMouseMove={canHover ? handleMouseMove : undefined}
        onFocus={() => {
          positionNearElement();
          setIsActive(true);
        }}
        onBlur={() => setIsActive(false)}
      >
        {children}
      </span>

      {mounted && canHover && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{ x: springX, y: springY }}
              className={styles.card}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className={styles.cardImage} />
              <p className={styles.cardDescription}>{description}</p>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default CursorCard;
