// The swap between steps of one auth form (email, then password). Short and quiet.
export const step = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
};
