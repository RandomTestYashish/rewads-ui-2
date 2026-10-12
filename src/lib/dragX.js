import { gesture, renderedScale } from "./gesture.js";

/**
 * Lets a mouse drag a horizontal rail the way a finger would. Touch and trackpad input
 * keep native scrolling. On release the rail settles on the nearest snap point.
 */
const DRAG_START = 6;

export function enableDragX(rail) {
  let tracking = false;
  let dragged = false;
  let scale = 1;
  let startX = 0;
  let startY = 0;
  let startScroll = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0; // px per ms, in layout pixels

  rail.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    tracking = true;
    dragged = false;
    scale = renderedScale(rail);
    startX = lastX = event.clientX;
    startY = event.clientY;
    startScroll = rail.scrollLeft;
    lastTime = event.timeStamp;
    velocity = 0;
  });

  window.addEventListener("pointermove", (event) => {
    if (!tracking || (gesture.owner && gesture.owner !== rail)) return;
    const delta = event.clientX - startX;

    if (!dragged) {
      if (Math.abs(delta) < DRAG_START || Math.abs(delta) < Math.abs(event.clientY - startY)) return;
      dragged = true;
      gesture.owner = rail;
      rail.classList.add("is-dragging");
      rail.dispatchEvent(new CustomEvent("rail:dragstart", { bubbles: true }));
    }

    rail.scrollLeft = startScroll - delta / scale;
    const elapsed = event.timeStamp - lastTime;
    if (elapsed > 0) velocity = 0.8 * ((lastX - event.clientX) / scale / elapsed) + 0.2 * velocity;
    lastX = event.clientX;
    lastTime = event.timeStamp;
  });

  function onUp() {
    if (!tracking) return;
    tracking = false;
    if (gesture.owner === rail) gesture.owner = null;
    if (!dragged) return;
    // Carry the throw a little, then let scroll snapping pick the resting card.
    const target = rail.scrollLeft + velocity * 180;
    rail.classList.remove("is-dragging");
    rail.scrollTo({ left: target, behavior: "smooth" });
  }

  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);

  // A drag should not also fire a tap on whatever was under the cursor.
  rail.addEventListener(
    "click",
    (event) => {
      if (!dragged) return;
      dragged = false;
      event.preventDefault();
      event.stopPropagation();
    },
    true,
  );
}
