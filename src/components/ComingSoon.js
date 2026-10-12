import { asset, el } from "../lib/dom.js";
import { gesture, renderedScale } from "../lib/gesture.js";
import { reducedMotion } from "../lib/motion.js";
import { toast } from "./overlays.js";

// Figma draws the cult.fit card in front of two tinted cards; the copy on those two is ours.
export const CARDS = [
  { id: "cult", brand: "cult.fit", photo: true, date: "DEC 2026", title: ["Train.", "On us."], text: "Cult membership, free with your plan" },
  { id: "listen", brand: "Music", tint: "purple", date: "JAN 2027", title: ["Listen.", "On us."], text: "Ad-free music, free with your plan" },
  { id: "read", brand: "Reading", tint: "green", date: "FEB 2027", title: ["Read.", "On us."], text: "Books and magazines, free with your plan" },
];

const SLOTS = ["center", "right", "left"];

const card = (item) => `
  <article class="soon-card ${item.tint ? `soon-card--${item.tint}` : ""}" data-card="${item.id}">
    ${item.photo ? `<img class="soon-card__photo" src="${asset("card-cult-fit.jpg")}" alt="" /><img class="soon-card__logo" src="${asset("cult-fit-logo.png")}" alt="cult.fit" />` : ""}
    <span class="soon-card__date">${item.date}</span>
    <p class="soon-card__eyebrow">COMING SOON</p>
    <p class="soon-card__title">${item.title.join("<br />")}</p>
    <p class="soon-card__text">${item.text}</p>
    <button class="soon-card__notify" type="button" aria-pressed="false">Notify me</button>
  </article>`;

/** Coming soon: a fanned stack of three cards. Swipe, or tap a side card, to bring it forward. */
export function ComingSoon() {
  const section = el(`
    <section class="soon reveal" id="soon">
      <div class="soon__glow soon__glow--left"><img src="${asset("ellipse-19139.svg")}" alt="" /></div>
      <div class="soon__glow soon__glow--right"><img src="${asset("ellipse-19140.svg")}" alt="" /></div>
      <p class="soon__title soon__title--ghost soon__title--ghost-a" aria-hidden="true">Coming Soon</p>
      <p class="soon__title soon__title--ghost soon__title--ghost-b" aria-hidden="true">Coming Soon</p>
      <p class="soon__title soon__title--glow" aria-hidden="true">Coming Soon</p>
      <h2 class="soon__title">Coming Soon</h2>
      <div class="soon__stack">${CARDS.map(card).join("")}</div>
    </section>
  `);
  const stack = section.querySelector(".soon__stack");
  const cards = [...stack.children];
  let front = 0;

  function layout() {
    cards.forEach((node, index) => (node.dataset.slot = SLOTS[(index - front + cards.length) % cards.length]));
  }
  layout();

  function step(direction) {
    front = (front + direction + cards.length) % cards.length;
    layout();
  }

  // The stack deals itself while it is on screen, until someone touches it.
  let visible = false;
  let touched = false;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.6 }).observe(stack);
  setInterval(() => {
    if (visible && !touched && !reducedMotion.matches && !document.hidden && !document.querySelector(".sheet")) step(1);
  }, 3200);

  // Horizontal swipe on the stack; vertical movement is left to the page.
  let drag = null;
  let swiped = false;
  stack.addEventListener("pointerdown", (event) => {
    touched = true;
    drag = { x: event.clientX, y: event.clientY, scale: renderedScale(stack) };
    swiped = false;
  });
  window.addEventListener("pointermove", (event) => {
    if (!drag || swiped) return;
    const dx = (event.clientX - drag.x) / drag.scale;
    const dy = (event.clientY - drag.y) / drag.scale;
    if (Math.abs(dx) < 28 || Math.abs(dx) < Math.abs(dy)) return;
    swiped = true;
    gesture.owner = stack;
    step(dx < 0 ? 1 : -1);
  });
  ["pointerup", "pointercancel"].forEach((type) =>
    window.addEventListener(type, () => {
      drag = null;
      if (gesture.owner === stack) gesture.owner = null;
    }),
  );

  stack.addEventListener("click", (event) => {
    if (swiped) {
      swiped = false;
      return;
    }
    const node = event.target.closest(".soon-card");
    if (!node) return;
    if (node.dataset.slot !== "center") {
      step(node.dataset.slot === "right" ? 1 : -1);
      return;
    }
    const button = event.target.closest(".soon-card__notify");
    if (!button) return;
    const on = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(on));
    button.textContent = on ? "We’ll notify you ✓" : "Notify me";
    const item = CARDS.find((entry) => entry.id === node.dataset.card);
    toast(on ? `We’ll tell you when ${item.brand} goes live` : "Reminder removed");
  });

  return section;
}
