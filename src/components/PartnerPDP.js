import { asset, el } from "../lib/dom.js";
import { enableDragX } from "../lib/dragX.js";
import { renderedScale } from "../lib/gesture.js";
import { icons } from "../lib/icons.js";
import { animate, reducedMotion, transition } from "../lib/motion.js";
import { STATUS, claimPartner, getPartner, isClaimed, nextOf, onPartnerChange, planOf, prevOf } from "../lib/partners.js";
import { openManage } from "./ManageSheet.js";
import { confetti, overlayHost, toast } from "./overlays.js";

const SWIPE_THRESHOLD = 84; // px a sideways drag must travel to change partner
const logo = (partner, size = "") => `<span class="pp-logo ${size} ${partner.inset ? "pp-logo--inset" : ""}"><img src="${asset(partner.logo)}" alt="" /></span>`;

// The one action a partner offers in its current state: [label, kind]
function action(partner) {
  if (partner.status === "eligible") return ["Claim Now", "claim"];
  if (partner.status === "activating") return ["Activating…", "busy"];
  if (partner.status === "failed") return ["Retry activation", "claim"];
  if (partner.status === "expired") return ["Renew benefit", "claim"];
  return ["Manage", "manage"];
}

function run(partner, from) {
  const [, kind] = action(partner);
  if (kind === "manage") return openManage(partner.id);
  if (kind !== "claim") return;
  claimPartner(partner.id).then(() => {
    const now = getPartner(partner.id);
    if (now.status === "active") {
      if (from?.isConnected) confetti(from);
      toast(`${now.name} is active on your number`);
    } else toast("Activation failed. Nothing was charged.");
  });
}

/** One partner's Discovery page: hero, content rails, benefits, how it works. */
function page(partner) {
  const node = el(`
    <article class="pdp" data-partner="${partner.id}" style="--pp-a:${partner.colors[0]};--pp-b:${partner.colors[1]};--pp-c:${partner.colors[2]}">
      <div class="pdp__scroll scroll-y">
        <header class="pdp__hero">
          ${logo(partner, "pp-logo--xl")}
          <h1>${partner.name}</h1>
          <p class="pdp__tagline">${partner.tagline}</p>
          <div class="pdp__state"></div>
        </header>
        ${partner.rails
          .map(
            (rail) => `
              <section class="pdp__rail">
                <h2>${rail.title}</h2>
                <div class="pdp__tiles scroll-x">
                  ${rail.items.map((item) => `<button class="pdp__tile" type="button" style="--hue:${item.hue}" data-press="0.96"><i>${icons.sparkle}</i><span>${item.title}</span></button>`).join("")}
                </div>
              </section>`,
          )
          .join("")}
        <section class="pdp__block" data-benefits>
          <h2>What you get</h2>
          <ul class="pdp__perks"></ul>
        </section>
        <section class="pdp__block">
          <h2>How it works</h2>
          <ol class="pdp__steps">
            <li><b>1</b><span><strong>Claim on Airtel</strong>One tap, no card needed.</span></li>
            <li><b>2</b><span><strong>Link your ${partner.name} account</strong>Sign in or create one.</span></li>
            <li><b>3</b><span><strong>Start using it</strong>On every device your plan allows.</span></li>
          </ol>
        </section>
        <footer class="pdp__end"></footer>
      </div>
      <div class="pdp__bar">
        <button class="pdp__back" type="button" aria-label="Back to My Rewards">${icons.chevron}</button>
        <strong>${partner.name}</strong>
        <span>Airtel benefit</span>
      </div>
    </article>
  `);
  const state = node.querySelector(".pdp__state");
  const perks = node.querySelector(".pdp__perks");
  const end = node.querySelector(".pdp__end");

  function render() {
    const now = getPartner(partner.id);
    const [label, kind] = action(now);
    const [status, tone] = STATUS[now.status];
    state.innerHTML = `
      <span class="pp-chip" data-tone="${tone}">${status}</span>
      <p class="pdp__plan">${planOf(now).name}${isClaimed(now) ? ` · ${now.status === "cancelling" ? "ends" : "valid till"} ${now.validTill}` : ` · ${now.validTill}`}</p>
      ${now.status === "failed" ? `<p class="pdp__error">We could not activate this just now. Nothing was charged.</p>` : ""}
      <button class="pdp__cta" type="button" data-kind="${kind}" ${kind === "busy" ? "disabled" : ""} data-press="0.97">${label}</button>
      <button class="pdp__link" type="button" data-scroll>See what’s included</button>`;
    perks.innerHTML = planOf(now).perks.map((perk) => `<li>${perk}</li>`).join("");
    const next = nextOf(partner.id);
    end.innerHTML = next ? `<p>That’s everything from ${partner.name}</p><span>Swipe left for your next benefit ${icons.arrow}</span>` : `<p>That’s every benefit on your plan</p><span>You’ve seen them all</span>`;
  }
  render();
  const stop = onPartnerChange((changed) => changed.id === partner.id && node.isConnected && render());

  state.addEventListener("click", (event) => {
    if (event.target.closest(".pdp__cta")) run(getPartner(partner.id), event.target.closest(".pdp__cta"));
    if (event.target.closest("[data-scroll]")) node.querySelector("[data-benefits]").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  node.querySelectorAll(".pdp__tiles").forEach((rail) => {
    enableDragX(rail);
    rail.addEventListener("click", (event) => {
      if (!event.target.closest(".pdp__tile")) return;
      toast(isClaimed(getPartner(partner.id)) ? `Opens in the ${partner.name} app` : "Claim the benefit to start watching");
    });
  });
  return { node, scroller: node.querySelector(".pdp__scroll"), stop };
}

/**
 * Opens a partner's Discovery PDP over the rewards page. At the natural end of a page the
 * next partner peeks in from the right; a right-to-left swipe (or a tap on the peek) moves
 * on, left-to-right goes back, and a short drag snaps back.
 */
export function openPartner(id) {
  const host = overlayHost();
  const layer = el(`
    <div class="pdp-layer">
      <button class="pdp-peek" type="button" hidden></button>
    </div>
  `);
  const peek = layer.querySelector(".pdp-peek");
  let current = null;
  let moving = false;

  function renderPeek() {
    const next = nextOf(current.partner.id);
    peek.hidden = !next;
    if (!next) return;
    peek.innerHTML = `<small>Next Benefit</small>${logo(next)}<strong>${next.name}</strong><em>${action(next)[0]} ${icons.arrow}</em>`;
    peek.style.setProperty("--pp-a", next.colors[0]);
    peek.style.setProperty("--pp-b", next.colors[1]);
  }

  function mount(partner) {
    const built = page(partner);
    built.partner = partner;
    built.scroller.addEventListener(
      "scroll",
      () => {
        const s = built.scroller;
        built.node.classList.toggle("is-scrolled", s.scrollTop > 180);
        if (built === current) layer.classList.toggle("is-end", s.scrollTop + s.clientHeight >= s.scrollHeight - 2);
      },
      { passive: true },
    );
    built.node.querySelector(".pdp__back").addEventListener("click", close);
    return built;
  }

  async function go(partner, direction) {
    if (moving || !partner) return;
    moving = true;
    const leaving = current;
    const entering = mount(partner);
    layer.prepend(entering.node);
    layer.classList.remove("is-end");
    const t = reducedMotion.matches ? { duration: 0.01 } : { type: "spring", visualDuration: 0.42, bounce: 0.08 };
    animate(entering.node, { x: [`${direction * 100}%`, "0%"] }, t);
    await animate(leaving.node, { x: `${-direction * 100}%`, scale: 0.92, opacity: 0.4 }, t);
    leaving.stop();
    leaving.node.remove();
    current = entering;
    renderPeek();
    moving = false;
  }

  function close() {
    stopPeek();
    animate(layer, { x: "100%" }, transition("sheetOut")).then(() => {
      current.stop();
      layer.remove();
    });
  }

  peek.addEventListener("click", () => go(nextOf(current.partner.id), 1));
  const stopPeek = onPartnerChange(() => current && renderPeek());

  // Sideways drags at the end of a page; vertical ones stay with the page's own scroll.
  let drag = null;
  layer.addEventListener("pointerdown", (event) => {
    if (!layer.classList.contains("is-end") || moving || event.target.closest("button")) return;
    drag = { x: event.clientX, y: event.clientY, scale: renderedScale(layer), dx: 0, locked: false };
  });
  window.addEventListener("pointermove", (event) => {
    if (!drag || !layer.isConnected) return;
    const dx = (event.clientX - drag.x) / drag.scale;
    const dy = (event.clientY - drag.y) / drag.scale;
    if (!drag.locked) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.5) return (drag = null); // mostly vertical or diagonal: leave it to the scroll
      drag.locked = true;
      layer.classList.add("is-dragging-x");
    }
    const allowed = dx < 0 ? nextOf(current.partner.id) : prevOf(current.partner.id);
    drag.dx = allowed ? dx : dx * 0.2; // nothing that way: resist
    layer.style.setProperty("--drag", `${drag.dx}px`);
  });
  window.addEventListener("pointerup", () => {
    if (!drag || !layer.isConnected) return;
    const { dx, locked } = drag;
    drag = null;
    if (!locked) return;
    layer.classList.remove("is-dragging-x");
    layer.style.removeProperty("--drag");
    if (dx <= -SWIPE_THRESHOLD) go(nextOf(current.partner.id), 1);
    else if (dx >= SWIPE_THRESHOLD) go(prevOf(current.partner.id), -1);
  });

  current = mount(getPartner(id));
  layer.prepend(current.node);
  renderPeek();
  host.append(layer);
  animate(layer, { x: ["100%", "0%"] }, reducedMotion.matches ? { duration: 0.01 } : { type: "spring", visualDuration: 0.4, bounce: 0.06 });
}

// Rows on the rewards page that belong to a partner with a PDP
export const PARTNER_BY_NAME = { "Netflix Mobile": "netflix", "Apple TV+": "appletv", "Google One": "googleone" };
