"use client";

import { AnimatePresence } from "motion/react";
import type { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}
