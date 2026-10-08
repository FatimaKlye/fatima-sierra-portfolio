"use client";

import * as React from "react";
import { motion, type Transition } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./PerspectiveCarousel.module.css";

export interface PerspectiveCarouselItem {
  src: string;
  title: string;
  alt?: string;
  /** Short call to action shown under the active slide's title (needs onActiveClick). */
  actionLabel?: string;
}

export interface PerspectiveCarouselProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: PerspectiveCarouselItem[];
  activeIndex?: number;
  defaultActiveIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  /** Called when the already-active slide is clicked. Inactive slides still just take focus. */
  onActiveClick?: (index: number) => void;
  loop?: boolean;
  slideWidth?: number;
  rotationStep?: number;
  inactiveScale?: number;
  transition?: Transition;
  showControls?: boolean;
  showDots?: boolean;
  viewportClassName?: string;
  slideClassName?: string;
  imageClassName?: string;
  labelClassName?: string;
  controlsClassName?: string;
}

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  bounce: 0.14,
  duration: 0.9,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function PerspectiveCarousel({
  items,
  activeIndex,
  defaultActiveIndex = 0,
  onActiveIndexChange,
  onActiveClick,
  loop = false,
  slideWidth = 200,
  rotationStep = 60,
  inactiveScale = 0.85,
  transition = DEFAULT_TRANSITION,
  showControls = true,
  showDots = true,
  viewportClassName,
  slideClassName,
  imageClassName,
  labelClassName,
  controlsClassName,
  className,
  onKeyDown,
  tabIndex,
  ...props
}: PerspectiveCarouselProps) {
  const maxIndex = Math.max(0, items.length - 1);
  const [uncontrolledIndex, setUncontrolledIndex] = React.useState(() =>
    clamp(defaultActiveIndex, 0, maxIndex)
  );
  const currentIndex = clamp(activeIndex ?? uncontrolledIndex, 0, maxIndex);
  const safeSlideWidth = Math.max(96, slideWidth);
  const safeInactiveScale = clamp(inactiveScale, 0.5, 1);

  const selectSlide = React.useCallback(
    (nextIndex: number) => {
      if (!items.length) {
        return;
      }

      const resolvedIndex = loop
        ? (nextIndex + items.length) % items.length
        : clamp(nextIndex, 0, maxIndex);

      if (activeIndex === undefined) {
        setUncontrolledIndex(resolvedIndex);
      }

      onActiveIndexChange?.(resolvedIndex);
    },
    [activeIndex, items.length, loop, maxIndex, onActiveIndexChange]
  );

  if (!items.length) {
    return null;
  }

  const isPreviousDisabled = !loop && currentIndex === 0;
  const isNextDisabled = !loop && currentIndex === maxIndex;
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectSlide(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectSlide(currentIndex + 1);
    }
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Perspective image carousel"
      tabIndex={tabIndex ?? 0}
      onKeyDown={handleKeyDown}
      className={cn(styles.root, className)}
      {...props}
    >
      <div
        className={cn(styles.viewport, viewportClassName)}
        style={{ perspective: "1200px" }}
      >
        <motion.div
          className={styles.track}
          animate={{ x: -(currentIndex * safeSlideWidth + safeSlideWidth / 2) }}
          transition={transition}
        >
          {items.map((item, index) => {
            const isActive = currentIndex === index;
            const opensOnClick = isActive && Boolean(onActiveClick);

            return (
              <div
                key={`${item.src}-${index}`}
                className={styles.item}
                style={{ width: safeSlideWidth, perspective: "1200px" }}
              >
                <motion.div
                  className={cn(styles.slideInner, slideClassName)}
                  animate={{
                    rotateY: (currentIndex - index) * rotationStep,
                    scale: isActive ? 1 : safeInactiveScale,
                  }}
                  transition={transition}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <button
                    type="button"
                    aria-label={
                      opensOnClick
                        ? `${item.actionLabel ?? "Open"}: ${item.title}`
                        : `Show ${item.title}`
                    }
                    aria-current={isActive ? "true" : undefined}
                    className={cn(styles.slideButton, opensOnClick && styles.slideButtonActionable)}
                    onClick={() => (opensOnClick ? onActiveClick?.(index) : selectSlide(index))}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.src}
                      alt={item.alt ?? item.title}
                      draggable={false}
                      className={cn(styles.image, imageClassName)}
                    />
                  </button>

                  <motion.p
                    className={cn(styles.label, labelClassName)}
                    animate={{
                      filter: isActive ? "blur(0px)" : "blur(2px)",
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={transition}
                  >
                    {item.title}
                    {onActiveClick && item.actionLabel && (
                      <span className={styles.actionHint} aria-hidden="true">
                        {item.actionLabel}
                      </span>
                    )}
                  </motion.p>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {showControls && (
        <div className={cn(styles.controls, controlsClassName)}>
          <button
            type="button"
            aria-label="Show previous slide"
            disabled={isPreviousDisabled}
            className={styles.navButton}
            onClick={() => selectSlide(currentIndex - 1)}
          >
            <ChevronLeft size={18} />
          </button>

          {showDots && (
            <div className={styles.dotsWrap}>
              {items.map((item, index) => (
                <button
                  key={`${item.title}-${index}`}
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${item.title}`}
                  aria-current={currentIndex === index ? "true" : undefined}
                  className={cn(styles.dot, currentIndex === index && styles.dotActive)}
                  onClick={() => selectSlide(index)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            aria-label="Show next slide"
            disabled={isNextDisabled}
            className={styles.navButton}
            onClick={() => selectSlide(currentIndex + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default PerspectiveCarousel;
