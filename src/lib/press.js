import { animate, reducedMotion, transition } from "./motion.js";

/**
 * Spring press feedback for every tappable element, delegated from one root.
 * `.pressable` scales itself; `[data-press]` can name a different scale and
 * a child (`[data-press-target]`) to move instead.
 */
export function enablePressFeedback(root) {
  let active = null;

  function end() {
    if (!active) return;
    animate(active, { scale: 1 }, transition("release"));
    active = null;
  }

  root.addEventListener("pointerdown", (event) => {
    if (reducedMotion.matches || (event.pointerType === "mouse" && event.button !== 0)) return;
    const control = event.target.closest(".pressable, [data-press]");
    if (!control) return;
    end();
    active = control.querySelector("[data-press-target]") ?? control;
    animate(active, { scale: parseFloat(control.dataset.press) || 0.97 }, transition("press"));
  });

  // Releasing, scrolling or starting a rail drag all cancel the pressed look.
  ["pointerup", "pointercancel", "blur"].forEach((type) => window.addEventListener(type, end));
  root.addEventListener("rail:dragstart", end);
  root.addEventListener("scroll", end, { capture: true, passive: true });
}
