// Motion (https://motion.dev) is vendored as a classic script and exposes `window.Motion`.
const { animate } = window.Motion;

export { animate };

export const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const spring = (visualDuration, bounce = 0) => ({ type: "spring", visualDuration, bounce });

// One motion system for the whole prototype: quick response, low bounce, smooth settle.
const TRANSITIONS = {
  press: spring(0.14),
  release: spring(0.26, 0.28),
  pop: spring(0.45, 0.4), // shortcuts landing on load, the balance pulsing when coins arrive
  sheetIn: spring(0.42, 0.12),
  sheetOut: { duration: 0.26, ease: [0.4, 0, 1, 1] },
  scrim: { duration: 0.3, ease: "easeOut" },
  toastIn: spring(0.36, 0.25),
  toastOut: { duration: 0.2, ease: "easeIn" },
  fly: { duration: 0.7, ease: [0.5, 0, 0.2, 1] }, // a coin travelling to the balance
  collapse: spring(0.4), // a claimed card closing up, the subscriptions list resizing
  reveal: spring(0.5),
};

/** Named transition, collapsed to an effectively instant one under reduced motion. */
export function transition(name) {
  return reducedMotion.matches ? { duration: 0.01 } : TRANSITIONS[name];
}
