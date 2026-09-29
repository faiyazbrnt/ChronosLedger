function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export const motion = {
  duration: {
    get quick() { return parseFloat(token("--motion-quick")); },
    get standard() { return parseFloat(token("--motion-standard")); },
    get count() { return parseFloat(token("--motion-count")); },
  },
  get stagger() { return parseFloat(token("--motion-stagger")); },
  distance: {
    get list() { return token("--motion-list-distance"); },
    get exit() { return token("--motion-exit-distance"); },
  },
  easing: {
    get out() { return token("--motion-ease-out"); },
  },
  spring: {
    get duration() { return parseFloat(token("--motion-spring-duration")); },
    get bounce() { return parseFloat(token("--motion-spring-bounce")); },
  },
};

export function shouldSkipMotion() {
  return typeof window !== "undefined" &&
    (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.inputMethod === "keyboard");
}
