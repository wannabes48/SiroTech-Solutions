"use client";

import React from "react";
import { motion } from "framer-motion";

export interface ConcentricRingProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "theme" | "emerald" | "zinc" | "white";
  className?: string;
}

const sizeMap = {
  sm: {
    container: "w-5 h-5",
    outer: "w-5 h-5 border-[1.5px]",
    middle: "w-3.5 h-3.5 border-[1.5px]",
    inner: "w-2 h-2 border-[1px]",
  },
  md: {
    container: "w-8 h-8",
    outer: "w-8 h-8 border-2",
    middle: "w-5.5 h-5.5 border-2",
    inner: "w-3 h-3 border-[1.5px]",
  },
  lg: {
    container: "w-12 h-12",
    outer: "w-12 h-12 border-2",
    middle: "w-8 h-8 border-2",
    inner: "w-4 h-4 border-2",
  },
  xl: {
    container: "w-16 h-16",
    outer: "w-16 h-16 border-[3px]",
    middle: "w-11 h-11 border-[2.5px]",
    inner: "w-6 h-6 border-2",
  },
};

const variantMap = {
  theme: {
    outer: "border-sage-700 dark:border-sage-300 border-t-transparent",
    middle: "border-sage-500 border-b-transparent",
    inner: "border-sage-300 border-l-transparent",
  },
  emerald: {
    outer: "border-emerald-800 dark:border-emerald-400 border-t-transparent",
    middle: "border-emerald-600 border-b-transparent",
    inner: "border-emerald-400 dark:border-emerald-300 border-l-transparent",
  },
  zinc: {
    outer: "border-zinc-800 dark:border-zinc-700 border-t-transparent",
    middle: "border-zinc-500 border-b-transparent",
    inner: "border-zinc-300 border-l-transparent",
  },
  white: {
    outer: "border-white border-t-transparent",
    middle: "border-sage-300 border-b-transparent",
    inner: "border-white/60 border-l-transparent",
  },
};

export const ConcentricRing: React.FC<ConcentricRingProps> = ({
  size = "lg",
  variant = "theme",
  className = "",
}) => {
  const s = sizeMap[size] || sizeMap.lg;
  const v = variantMap[variant] || variantMap.theme;

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`relative ${s.container} flex items-center justify-center shrink-0 ${className}`}
    >
      <motion.div
        className={`absolute ${s.outer} ${v.outer} rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={`absolute ${s.middle} ${v.middle} rounded-full`}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className={`absolute ${s.inner} ${v.inner} rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export default ConcentricRing;
