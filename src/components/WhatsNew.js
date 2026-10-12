import { asset, el } from "../lib/dom.js";
import { enableDragX } from "../lib/dragX.js";
import { BANNERS, Banner } from "./Banner.js";

/** The framed "What's New" carousel of partner and Advantage Club banners. */
export function WhatsNew() {
  const section = el(`
    <section class="whats-new reveal" id="whats-new">
      <div class="whats-new__blur whats-new__blur--a only-light"></div>
      <div class="whats-new__blur whats-new__blur--b only-light"></div>
      <div class="whats-new__blur whats-new__blur--c only-light"></div>
      <p class="whats-new__title whats-new__title--glow" aria-hidden="true">What’s New</p>
      <div class="whats-new__rail scroll-x"></div>
      <h2 class="whats-new__title">What’s New</h2>
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

  // The dots follow whichever banner is resting at the left edge.
  function mark() {
    const index = Math.min(BANNERS.length - 1, Math.round(rail.scrollLeft / 292));
    dots.forEach((dot, i) => dot.setAttribute("aria-current", String(i === index)));
  }
  rail.addEventListener("scroll", mark, { passive: true });
  mark();

  return section;
}
