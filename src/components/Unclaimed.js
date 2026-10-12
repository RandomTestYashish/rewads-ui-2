import { asset, el } from "../lib/dom.js";
import { enableDragX } from "../lib/dragX.js";
import { animate, transition } from "../lib/motion.js";
import { claim, earn, state, subscribe, unclaimed } from "../lib/store.js";
import { flyCoin, openSheet, toast } from "./overlays.js";

const ART = {
  netflix: { wash: "ellipse-5.svg", html: `<div class="claim-card__art claim-card__art--netflix"><img src="${asset("screenshot-20261008-at-110412-am-1.png")}" alt="" /></div>` },
  appletv: { wash: "ellipse-6.svg", html: `<div class="claim-card__art claim-card__art--appletv"><img src="${asset("screenshot-20261008-at-111419-am-1.png")}" alt="" /></div>` },
};

function card(reward) {
  const art = ART[reward.art] ?? {
    wash: "ellipse-6.svg",
    html: `<div class="claim-card__art claim-card__art--tile"><img src="${asset(reward.logo)}" alt="" ${reward.inset ? 'style="left:-19.44%;top:-19.44%;width:138.89%;height:138.89%"' : ""} /></div>`,
  };
  return `
    <article class="claim-card" data-reward="${reward.id}">
      <img class="claim-card__wash" src="${asset(art.wash)}" alt="" />
      <div class="claim-card__veil"></div>
      ${art.html}
      <p class="claim-card__name">${reward.name}</p>
      <p class="claim-card__text">Included in your airtel<br />xstream play subscription</p>
      <button class="claim-button pressable" type="button" data-claim="${reward.id}" data-press="0.94">Claim Now</button>
    </article>`;
}

/**
 * Claims a reward from any "Claim" button: a short wait, a tick, then a coin flies to the
 * balance. Used by the rail and by the "View all" sheet.
 */
export function runClaim(button, id) {
  if (button.dataset.state) return;
  button.dataset.state = "claiming";
  setTimeout(() => {
    const reward = claim(id);
    if (!reward) return;
    button.dataset.state = "claimed";
    button.textContent = "Claimed ✓";
    flyCoin(button, () => earn(reward.coins, `${reward.name} claimed`));
    toast(`${reward.name} claimed · +${reward.coins} coins`);
  }, 650);
}

/** The black band of rewards waiting to be claimed. */
export function Unclaimed() {
  const section = el(`
    <section class="unclaimed" id="unclaimed">
      <div class="unclaimed__streak unclaimed__streak--right"><img src="${asset("rectangle-161124100.svg")}" alt="" /></div>
      <div class="unclaimed__streak unclaimed__streak--left"><img src="${asset("rectangle-161124101.svg")}" alt="" /></div>
      <img class="unclaimed__badge" style="left:46.16px" src="${asset("vector-1.svg")}" alt="" />
      <img class="unclaimed__badge" style="left:304.37px" src="${asset("vector-1.svg")}" alt="" />
      <p class="unclaimed__eyebrow">unclaimed</p>
      <h2 class="unclaimed__title"><span>REWARDS</span></h2>
      <p class="unclaimed__text"></p>
      <div class="unclaimed__rail scroll-x">${state.rewards.map(card).join("")}</div>
      <button class="unclaimed__all pressable" type="button">View all</button>
    </section>
  `);
  const text = section.querySelector(".unclaimed__text");
  const rail = section.querySelector(".unclaimed__rail");
  const all = section.querySelector(".unclaimed__all");
  enableDragX(rail);

  function renderCount() {
    const count = unclaimed().length;
    text.innerHTML =
      count === 0
        ? "You have claimed every reward.<br />New ones arrive each month."
        : `You have ${count} reward${count === 1 ? "" : "s"} unclaimed. Claim ${count === 1 ? "it" : "them"}<br />before ${count === 1 ? "it expires" : "they expire"}.`;
  }
  renderCount();

  // A claimed card holds its tick for a beat, then closes up so the next one slides in.
  function retire(cardNode) {
    if (!cardNode || cardNode.dataset.leaving) return;
    cardNode.dataset.leaving = "true";
    setTimeout(async () => {
      cardNode.style.scrollSnapAlign = "none";
      animate(cardNode, { opacity: 0, scale: 0.9 }, { duration: 0.24 });
      await animate(cardNode, { width: 0, marginRight: -16, borderLeftWidth: 0, borderRightWidth: 0 }, transition("collapse"));
      cardNode.remove();
      if (!rail.querySelector(".claim-card")) showDone();
    }, 900);
  }

  function showDone() {
    rail.remove();
    all.remove();
    const done = el(`<div class="unclaimed__done"><strong>All caught up</strong><span>Every reward here has been claimed.</span></div>`);
    section.append(done);
    animate(done, { opacity: [0, 1], y: [12, 0] }, transition("reveal"));
  }

  subscribe((change) => {
    if (change.type !== "claim") return;
    renderCount();
    retire(rail.querySelector(`[data-reward="${change.reward.id}"]`));
  });

  rail.addEventListener("click", (event) => {
    const button = event.target.closest("[data-claim]");
    if (button) runClaim(button, button.dataset.claim);
  });

  all.addEventListener("click", () => {
    const list = el(`
      <div class="sheet-list">
        ${unclaimed()
          .map(
            (reward) => `
              <div class="sheet-row">
                <div class="sheet-row__logo ${reward.inset || reward.art !== "tile" ? "sheet-row__logo--inset" : ""}">
                  <img src="${asset(reward.logo ?? (reward.art === "netflix" ? "frame.png" : "logo-1.png"))}" alt="" />
                </div>
                <div class="sheet-row__text">
                  <p class="sheet-row__name">${reward.name}</p>
                  <p class="sheet-row__sub">+${reward.coins} coins on claiming</p>
                </div>
                <button class="sheet-row__action pressable" type="button" data-claim="${reward.id}">Claim</button>
              </div>`,
          )
          .join("")}
      </div>`);
    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-claim]");
      if (!button || button.disabled) return;
      button.textContent = "…";
      setTimeout(() => {
        const reward = claim(button.dataset.claim);
        if (!reward) return;
        button.disabled = true;
        button.textContent = "Claimed ✓";
        flyCoin(button, () => earn(reward.coins, `${reward.name} claimed`));
      }, 450);
    });
    openSheet({ eyebrow: "Unclaimed rewards", title: `${unclaimed().length} rewards waiting`, text: "Included with your plan. Claim them before they expire.", content: list });
  });

  return section;
}
