import { asset, el } from "../lib/dom.js";
import { renderedScale } from "../lib/gesture.js";
import { animate, reducedMotion, transition } from "../lib/motion.js";

// The phone screen; sheets, toasts and flying coins are positioned inside it.
let host = null;
let toastNode = null;
let toastTimer = 0;

export function setOverlayHost(screen) {
  host = screen;
}

/**
 * Bottom sheet. `content` is an element or HTML string placed under the title; `cta` is
 * `{ label, onClick(close, button) }`. Closes on the scrim, the close button, Escape or
 * a downward drag of the panel.
 */
export function openSheet({ eyebrow = "", title = "", text = "", content = null, cta = null }) {
  const sheet = el(`
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="sheet__scrim"></div>
      <div class="sheet__panel">
        <div class="sheet__grabber" aria-hidden="true"></div>
        <button class="sheet__close pressable" type="button" aria-label="Close">×</button>
        <div class="sheet__body">
          ${eyebrow ? `<p class="sheet__eyebrow">${eyebrow}</p>` : ""}
          ${title ? `<h2 class="sheet__title">${title}</h2>` : ""}
          ${text ? `<p class="sheet__text">${text}</p>` : ""}
        </div>
        ${cta ? `<button class="sheet__cta pressable" type="button">${cta.label}</button>` : ""}
      </div>
    </div>
  `);
  const scrim = sheet.querySelector(".sheet__scrim");
  const panel = sheet.querySelector(".sheet__panel");
  const body = sheet.querySelector(".sheet__body");
  if (typeof content === "string") body.insertAdjacentHTML("beforeend", content);
  else if (content) body.append(content);

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", onDragEnd);
    animate(scrim, { opacity: 0 }, transition("sheetOut"));
    animate(panel, { y: "100%" }, transition("sheetOut")).then(() => sheet.remove());
  }
  function onKey(event) {
    if (event.key === "Escape") close();
  }

  scrim.addEventListener("click", close);
  sheet.querySelector(".sheet__close").addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  if (cta) {
    const button = sheet.querySelector(".sheet__cta");
    button.addEventListener("click", () => cta.onClick(close, button));
  }

  // Drag the panel down by its top area to dismiss.
  let drag = null;
  panel.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button, canvas, .wheel") || body.scrollTop > 0) return;
    drag = { y: event.clientY, scale: renderedScale(panel), offset: 0, time: event.timeStamp };
  });
  function onDragMove(event) {
    if (!drag) return;
    drag.offset = Math.max(0, (event.clientY - drag.y) / drag.scale);
    if (drag.offset > 4) panel.style.transform = `translateY(${drag.offset}px)`;
  }
  function onDragEnd(event) {
    if (!drag) return;
    const fast = drag.offset / Math.max(1, event.timeStamp - drag.time) > 0.6;
    if (drag.offset > 110 || (fast && drag.offset > 30)) close();
    else if (drag.offset > 4) animate(panel, { y: 0 }, transition("sheetIn"));
    drag = null;
  }
  window.addEventListener("pointermove", onDragMove);
  window.addEventListener("pointerup", onDragEnd);

  host.append(sheet);
  animate(scrim, { opacity: 1 }, transition("scrim"));
  animate(panel, { y: ["100%", "0%"] }, transition("sheetIn"));
  return { sheet, body, close };
}

/** A short confirmation at the foot of the screen. */
export function toast(message) {
  clearTimeout(toastTimer);
  toastNode?.remove();
  const node = el(`<div class="toast" role="status">${message}</div>`);
  toastNode = node;
  host.append(node);
  animate(node, { opacity: [0, 1], x: ["-50%", "-50%"], y: [16, 0], scale: [0.94, 1] }, transition("toastIn"));
  toastTimer = setTimeout(() => {
    animate(node, { opacity: 0, y: 8 }, transition("toastOut")).then(() => node.remove());
  }, 2200);
}

/** Flies a coin from `from` to the balance in the header, then calls `onLand`. */
export function flyCoin(from, onLand) {
  const target = host.querySelector(".points img");
  const scale = renderedScale(host);
  const frame = host.getBoundingClientRect();
  const center = (node) => {
    const box = node.getBoundingClientRect();
    return { x: (box.left + box.width / 2 - frame.left) / scale - 15, y: (box.top + box.height / 2 - frame.top) / scale - 15 };
  };
  const start = center(from);
  const end = center(target);
  const coin = el(`<img class="fly-coin" src="${asset("light/point-shiny-front.png")}" alt="" />`);
  host.append(coin);
  animate(
    coin,
    { x: [start.x, end.x], y: [start.y, end.y], scale: [0.6, 1.25, 0.8], opacity: [0, 1, 1], rotate: [0, 220] },
    transition("fly"),
  ).then(() => {
    coin.remove();
    onLand?.();
  });
}

const CONFETTI = ["#ffe550", "#ffaa50", "#e10203", "#50ffdc", "#ffffff", "#a23bff"];

/** A short burst of confetti from the middle of `from`, for claims and wins. */
export function confetti(from) {
  if (reducedMotion.matches) return;
  const scale = renderedScale(host);
  const frame = host.getBoundingClientRect();
  const box = from.getBoundingClientRect();
  const x = (box.left + box.width / 2 - frame.left) / scale;
  const y = (box.top + box.height / 2 - frame.top) / scale;
  for (let i = 0; i < 26; i += 1) {
    const piece = el(`<i class="confetti" style="left:${x}px;top:${y}px;background:${CONFETTI[i % CONFETTI.length]}"></i>`);
    if (i % 3 === 0) piece.style.borderRadius = "50%";
    host.append(piece);
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.6;
    const reach = 50 + Math.random() * 90;
    const dx = Math.cos(angle) * reach;
    const dy = Math.sin(angle) * reach;
    animate(
      piece,
      { x: [0, dx, dx * 1.25], y: [0, dy, dy + 70 + Math.random() * 60], rotate: [0, Math.random() * 540 - 270], opacity: [1, 1, 0], scale: [0.4, 1, 0.8] },
      { duration: 0.9 + Math.random() * 0.4, ease: [0.2, 0.8, 0.3, 1], times: [0, 0.4, 1] },
    ).then(() => piece.remove());
  }
}
