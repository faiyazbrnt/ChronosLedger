"use client";

import { useEffect, useState } from "react";
import { motion, shouldSkipMotion } from "@/lib/motion";

export function usePresence(open: boolean) {
  const [present, setPresent] = useState(open);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setPresent(true);
      setExiting(false);
      return;
    }
    if (!present) return;
    if (shouldSkipMotion()) {
      setPresent(false);
      return;
    }
    setExiting(true);
    const timeout = window.setTimeout(() => setPresent(false), motion.duration.quick);
    return () => window.clearTimeout(timeout);
  }, [open, present]);

  return { present, exiting };
}
