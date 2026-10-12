import { gesture, renderedScale } from "./gesture.js";

/**
 * Lets a mouse drag the vertical page the way a finger would, with a short
 * momentum glide on release. Touch and trackpad input keep native scrolling.
 */
const DRAG_START = 6;
const DECAY_MS = 325;

export function enableDragScroll(container) {
  let tracking = false;
  let dragged = false;
  let scale = 1;
  let startY = 0;
  let startX = 0;
  let startScroll = 0;
  let lastY = 0;
  let lastTime = 0;
  let velocity = 0; // px per ms, in layout pixels
  let frame = 0;

  function onDown(event) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    cancelAnimationFrame(frame);
    container.classList.remove("is-dragging");
    tracking = true;
    dragged = false;
    scale = renderedScale(container);
    startY = lastY = event.clientY;
    startX = event.clientX;
    startScroll = container.scrollTop;
    lastTime = event.timeStamp;
    velocity = 0;
  }

  function onMove(event) {
    if (!tracking || (gesture.owner && gesture.owner !== container)) return;
    const delta = event.clientY - startY;

    if (!dragged) {
      if (Math.abs(delta) < DRAG_START || Math.abs(delta) < Math.abs(event.clientX - startX)) return;
      dragged = true;
      gesture.owner = container;
      container.classList.add("is-dragging");
    }

    container.scrollTop = startScroll - delta / scale;
    const elapsed = event.timeStamp - lastTime;
    if (elapsed > 0) velocity = 0.8 * ((lastY - event.clientY) / scale / elapsed) + 0.2 * velocity;
    lastY = event.clientY;
    lastTime = event.timeStamp;
  }

  function glide(previous) {
    frame = requestAnimationFrame((now) => {
      const elapsed = Math.min(now - previous, 32);
      container.scrollTop += velocity * elapsed;
      velocity *= Math.exp(-elapsed / DECAY_MS);
      if (Math.abs(velocity) < 0.02) container.classList.remove("is-dragging");
      else glide(now);
    });
  }

  function onUp() {
    if (!tracking) return;
    tracking = false;
    if (gesture.owner === container) gesture.owner = null;
    if (dragged) glide(performance.now());
  }

  // A drag should not also fire a tap on whatever was under the cursor.
  function onClickCapture(event) {
    if (!dragged) return;
    dragged = false;
    event.preventDefault();
    event.stopPropagation();
  }

  container.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  container.addEventListener("click", onClickCapture, true);
}
