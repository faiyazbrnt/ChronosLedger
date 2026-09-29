"use client";

import { useEffect, useState } from "react";
import { shouldSkipMotion } from "@/lib/motion";

interface AnimatedProgressProps {
  value: number;
  className?: string;
}

export function AnimatedProgress({ value, className }: AnimatedProgressProps) {
  const [display, setDisplay] = useState(0);
  const clamped = Math.min(100, Math.max(0, value));

  useEffect(() => {
    if (shouldSkipMotion()) {
      setDisplay(clamped);
      return;
    }
    const frame = requestAnimationFrame(() => setDisplay(clamped));
    return () => cancelAnimationFrame(frame);
  }, [clamped]);

  return (
    <div
      className={`motion-progress-fill ${className ?? ""}`}
      style={{ transform: `scaleX(${display / 100})` }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
