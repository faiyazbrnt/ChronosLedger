"use client";

import { useEffect, useRef } from "react";
import { motion, shouldSkipMotion } from "@/lib/motion";

export function useListMotion() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    let positions = new Map<string, DOMRect>();
    const children = () => Array.from(list.querySelectorAll<HTMLElement>(":scope > [data-motion-id]"));
    const capture = () => {
      positions = new Map(children().map((child) => [child.dataset.motionId ?? "", child.getBoundingClientRect()]));
    };
    capture();

    const observer = new MutationObserver((records) => {
      if (shouldSkipMotion()) {
        capture();
        return;
      }
      for (const record of records) {
        for (const removed of Array.from(record.removedNodes)) {
          if (!(removed instanceof HTMLElement)) continue;
          if (list.contains(removed)) continue;
          const rect = positions.get(removed.dataset.motionId ?? "");
          if (!rect) continue;
          const ghost = removed.cloneNode(true) as HTMLElement;
          Object.assign(ghost.style, {
            position: "fixed",
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            margin: "0",
            pointerEvents: "none",
            zIndex: "80",
            backgroundColor: getComputedStyle(removed).backgroundColor,
            animation: "none",
            transition: "none",
          });
          ghost.setAttribute("aria-hidden", "true");
          document.body.appendChild(ghost);
          ghost.animate(
            [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: `translateY(-${motion.distance.exit})` }],
            { duration: motion.duration.quick, easing: motion.easing.out }
          ).finished.then(() => ghost.remove(), () => ghost.remove());
        }
      }

      children().forEach((child, index) => {
        const previous = positions.get(child.dataset.motionId ?? "");
        const next = child.getBoundingClientRect();
        if (!previous) {
          child.animate(
            [{ opacity: 0, transform: `translateY(${motion.distance.list})` }, { opacity: 1, transform: "translateY(0)" }],
            { duration: motion.duration.standard, delay: Math.min(index, 4) * motion.stagger, easing: motion.easing.out }
          );
        } else if (Math.abs(previous.top - next.top) > 1) {
          child.animate(
            [{ transform: `translateY(${previous.top - next.top}px)` }, { transform: "translateY(0)" }],
            { duration: motion.duration.standard, easing: motion.easing.out }
          );
        }
      });
      capture();
    });
    observer.observe(list, { childList: true });
    return () => observer.disconnect();
  }, []);

  return ref;
}
