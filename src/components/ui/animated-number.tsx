"use client";

import { useEffect, useRef, useState } from "react";
import { motion, shouldSkipMotion } from "@/lib/motion";

interface AnimatedNumberProps {
  value: number;
  format: (value: number) => string;
  className?: string;
}

export function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    if (shouldSkipMotion()) {
      previous.current = value;
      setDisplay(value);
      return;
    }

    const from = previous.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / motion.duration.count);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (value - from) * eased;
      previous.current = current;
      setDisplay(current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      // Keep the last rendered value so an interrupted count retargets smoothly.
    };
  }, [value]);

  const finalText = format(value);
  return (
    <span className={`motion-number ${className ?? ""}`} aria-label={finalText}>
      <span className="motion-number-placeholder" aria-hidden="true">{finalText}</span>
      <span className="motion-number-value" aria-hidden="true">{format(display)}</span>
    </span>
  );
}
