"use client";

import React from "react";
import { motion } from "framer-motion";

interface WizardStepContainerProps {
  children: React.ReactNode;
  direction: number;
}

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    };
  },
};

export const WizardStepContainer: React.FC<WizardStepContainerProps> = ({
  children,
  direction,
}) => {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="w-full flex flex-col gap-6"
    >
      {children}
    </motion.div>
  );
};
