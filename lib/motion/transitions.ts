export const transitions = {
  fast: { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const },
  normal: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as const },
  smooth: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  spring: { type: "spring" as const, stiffness: 380, damping: 30 },
};
