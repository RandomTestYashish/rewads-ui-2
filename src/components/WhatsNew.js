import { asset, el } from "../lib/dom.js";
import { enableDragX } from "../lib/dragX.js";
import { reducedMotion } from "../lib/motion.js";
import { BANNERS, Banner } from "./Banner.js";

const BANNER_STEP = 324; // a banner (308px, at its larger size) and the gap after it

// Emoji that pop up around the title and drift off: [emoji, left, top, delay in seconds]
const EMOJI = [
  ["✨", 54, 14, 0],
  ["🎉", 246, 6, 0.9],
  ["🎁", 34, 78, 1.8],
  ["⚡", 150, 0, 2.5],
  ["💥", 270, 76, 3.2],
];

/** The framed "What's New" carousel of partner and Advantage Club banners. */
export function WhatsNew() {
  const section = el(`
    <section class="whats-new reveal" id="whats-new">
      <div class="whats-new__blur whats-new__blur--a only-light"></div>
      <div class="whats-new__blur whats-new__blur--b only-light"></div>
      <div class="whats-new__blur whats-new__blur--c only-light"></div>
      <p class="whats-new__title whats-new__title--glow" aria-hidden="true">What’s New</p>
      <div class="whats-new__rail scroll-x"></div>
      <h2 class="whats-new__title whats-new__title--live" aria-label="What’s New">${[..."What’s New"].map((letter, index) => `<i style="--i:${index}" aria-hidden="true">${letter === " " ? "&nbsp;" : letter}</i>`).join("")}</h2>
      ${EMOJI.map(([emoji, x, y, delay]) => `<i class="whats-new__emoji" style="left:${x}px;top:${y}px;animation-delay:${delay}s" aria-hidden="true">${emoji}</i>`).join("")}
      <div class="flame flame--a"><img src="${asset("fire.png")}" alt="" /></div>
      <div class="flame flame--b"><img src="${asset("fire-1.png")}" alt="" /></div>
      <div class="flame flame--c"><img src="${asset("fire-2.png")}" alt="" /></div>
      <div class="whats-new__dots" aria-hidden="true">${BANNERS.map(() => "<i></i>").join("")}</div>
    </section>
  `);
  const rail = section.querySelector(".whats-new__rail");
  const dots = [...section.querySelectorAll(".whats-new__dots i")];
  rail.append(...BANNERS.map(Banner));
  enableDragX(rail);

  // Each letter is its own box so it can jump; give each its slice of the title's one gradient.
  const letters = [...section.querySelectorAll(".whats-new__title--live i")];
  document.fonts.ready.then(() => letters.forEach((letter) => letter.style.setProperty("--x", `${-letter.offsetLeft}px`)));

  // The dots follow whichever banner is resting at the left edge.
  function mark() {
    const index = Math.min(BANNERS.length - 1, Math.round(rail.scrollLeft / BANNER_STEP));
    dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === index)));
  }
  rail.addEventListener("scroll", mark, { passive: true });
  mark();

  // The carousel moves on by itself while it is on screen, until someone takes hold of it.
  let visible = false;
  let touched = false;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.5 }).observe(section);
  ["pointerdown", "wheel", "touchstart"].forEach((type) => rail.addEventListener(type, () => (touched = true), { passive: true }));
  setInterval(() => {
    if (!visible || touched || reducedMotion.matches || document.hidden || document.querySelector(".sheet")) return;
    const next = Math.round(rail.scrollLeft / BANNER_STEP) + 1;
    rail.scrollTo({ left: next >= BANNERS.length ? 0 : next * BANNER_STEP, behavior: "smooth" });
  }, 3800);

  return section;
}
