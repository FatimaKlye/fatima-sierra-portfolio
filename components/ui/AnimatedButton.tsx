"use client";

import React from "react";
import { motion, MotionProps, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import styles from "./AnimatedButton.module.css";

type AnimatedButtonProps = MotionProps & {
  children?: React.ReactNode;
  className?: string;
  as?: any;
} & Record<string, any>;

/**
 * AnimatedButton
 * - shine text mask + animated border shine, spring hover/tap scale
 * - styled with the portfolio's own CSS variables so it matches the pink theme
 */
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children = "Browse Components",
  className = "",
  as = "button",
  ...rest
}) => {
  const Component = typeof as === "string" ? (motion as any)[as] || motion.button : as;
  const shouldReduceMotion = useReducedMotion();

  return (
    <Component
      {...rest}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5,
      }}
      className={cn(styles.button, className)}
    >
      <motion.span
        className={styles.label}
        style={
          shouldReduceMotion
            ? undefined
            : {
                WebkitMaskImage:
                  "linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))",
                maskImage:
                  "linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))",
              }
        }
        initial={shouldReduceMotion ? undefined : ({ ["--mask-x" as any]: "100%" } as any)}
        animate={shouldReduceMotion ? undefined : ({ ["--mask-x" as any]: "-100%" } as any)}
        transition={
          shouldReduceMotion
            ? undefined
            : {
                repeat: Infinity,
                duration: 1,
                ease: "linear",
                repeatDelay: 1,
              }
        }
      >
        {children}
      </motion.span>

      {!shouldReduceMotion && (
        <motion.span
          className={styles.shineBorder}
          style={{
            background:
              "linear-gradient(-75deg, transparent 30%, var(--shine) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
          }}
          initial={{ backgroundPosition: "100% 0", opacity: 0 }}
          animate={{ backgroundPosition: ["100% 0", "0% 0"], opacity: [0, 1, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 1,
          }}
        />
      )}
    </Component>
  );
};

export default AnimatedButton;
