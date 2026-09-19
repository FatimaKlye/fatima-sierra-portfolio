"use client";

import { CSSProperties, FocusEvent, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import styles from "./SocialFlipButton.module.css";

export type SocialFlipItem = {
  id: string;
  label: string;
  letter: string;
  iconSrc: string;
  href: string;
  external?: boolean;
};

interface SocialFlipButtonProps {
  items: SocialFlipItem[];
  className?: string;
}

function SocialFlipItemNode({
  item,
  index,
  isFlipped,
  isTooltipVisible,
  onTooltip,
  reduceMotion,
}: {
  item: SocialFlipItem;
  index: number;
  isFlipped: boolean;
  isTooltipVisible: boolean;
  onTooltip: (index: number | null) => void;
  reduceMotion: boolean;
}) {
  return (
    <a
      className={styles.item}
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
      aria-label={item.label}
      onMouseEnter={() => onTooltip(index)}
      onMouseLeave={() => onTooltip(null)}
    >
      <AnimatePresence>
        {isTooltipVisible && (
          <motion.span
            className={styles.tooltip}
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.85 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {item.label}
            <span className={styles.tooltipArrow} aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>

      <motion.span
        className={styles.flipInner}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: 0.7,
                type: "spring",
                stiffness: 140,
                damping: 16,
                delay: index * 0.07,
              }
        }
      >
        <span className={styles.face} data-face="front">
          {item.letter}
        </span>
        <span className={styles.face} data-face="back">
          <span
            className={styles.icon}
            style={{ "--icon": `url(${item.iconSrc})` } as CSSProperties}
            aria-hidden="true"
          />
        </span>
      </motion.span>
    </a>
  );
}

export default function SocialFlipButton({ items, className }: SocialFlipButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const reduceMotion = Boolean(useReducedMotion());

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsHovered(false);
    }
  }

  return (
    <div
      className={cn(styles.group, className)}
      role="group"
      aria-label="Social and contact links"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setTooltipIndex(null);
      }}
      onFocus={() => setIsHovered(true)}
      onBlur={handleBlur}
    >
      {items.map((item, index) => (
        <SocialFlipItemNode
          key={item.id}
          item={item}
          index={index}
          isFlipped={isHovered && !reduceMotion}
          isTooltipVisible={tooltipIndex === index}
          onTooltip={setTooltipIndex}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}
