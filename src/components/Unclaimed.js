import { asset, el } from "../lib/dom.js";
import { enableDragX } from "../lib/dragX.js";
import { animate, reducedMotion, transition } from "../lib/motion.js";
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

// Small glints around the heading: [left, top, size, delay in seconds]
const SPARKLES = [
  [84, 30, 7, 0.2],
  [118, 66, 5, 1.7],
  [262, 28, 6, 1.1],
  [286, 68, 8, 2.6],
  [20, 58, 5, 3.3],
  [346, 40, 6, 0.8],
];

/**
 * The heading's entrance: light runs out along the two streaks, "UNCLAIMED" tracks in,
 * "REWARDS" rises letter by letter out of a blur, the badges spin into place, the count
 * runs up and the cards arrive from the right. Plays each time the band comes into view.
 */
function playIntro(section, count) {
  const q = (selector) => section.querySelector(selector);
  const all = (selector) => [...section.querySelectorAll(selector)];
  const ease = [0.22, 1, 0.36, 1];

  all(".unclaimed__streak").forEach((streak) => {
    animate(streak, { opacity: [0, 1] }, { duration: 0.8, ease });
    animate(streak.firstElementChild, { scaleX: [0.15, 1] }, { duration: 1.2, ease });
  });
  animate(q(".unclaimed__eyebrow"), { opacity: [0, 1], letterSpacing: ["9px", "0.56px"], filter: ["blur(4px)", "blur(0px)"] }, { duration: 0.9, delay: 0.1, ease });
  all(".unclaimed__word i").forEach((letter, index) =>
    animate(
      letter,
      { opacity: [0, 1], y: [22, 0], scale: [1.25, 1], filter: ["blur(10px)", "blur(0px)"] },
      { duration: 0.85, delay: 0.3 + index * 0.075, ease },
    ),
  );
  all(".unclaimed__badge").forEach((badge, index) =>
    animate(badge, { opacity: [0, 1], scale: [0, 1], rotate: [index ? 200 : -200, 0] }, { type: "spring", visualDuration: 0.7, bounce: 0.35, delay: 0.62 + index * 0.08 }),
  );
  animate(q(".unclaimed__text"), { opacity: [0, 1], y: [10, 0] }, { duration: 0.6, delay: 0.75, ease });
  all(".claim-card").forEach((card, index) => animate(card, { opacity: [0, 1], x: [56, 0] }, { type: "spring", visualDuration: 0.6, bounce: 0.18, delay: 0.8 + index * 0.09 }));
  const link = q(".unclaimed__all");
  if (link) animate(link, { opacity: [0, 1] }, { duration: 0.5, delay: 1.2 });

  // The sheen crosses the word once the last letter has landed.
  const word = q(".unclaimed__word");
  word.classList.remove("is-shining");
  setTimeout(() => word.classList.add("is-shining"), 1400);

  // "6" runs up from zero.
  const number = q("[data-count]");
  if (number && count > 0) {
    const started = performance.now() + 750;
    (function tick(now) {
      const progress = Math.min(1, Math.max(0, (now - started) / 700));
      number.textContent = Math.round(count * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1 && number.isConnected) requestAnimationFrame(tick);
    })(performance.now());
  }
}

/** The black band of rewards waiting to be claimed. */
export function Unclaimed() {
  const section = el(`
    <section class="unclaimed" id="unclaimed">
      <div class="unclaimed__streak unclaimed__streak--right"><img src="${asset("rectangle-161124100.svg")}" alt="" /></div>
      <div class="unclaimed__streak unclaimed__streak--left"><img src="${asset("rectangle-161124101.svg")}" alt="" /></div>
      ${SPARKLES.map(([x, y, size, delay]) => `<i class="unclaimed__sparkle" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px;animation-delay:${delay}s"></i>`).join("")}
      <span class="unclaimed__badge" style="left:46.16px"><img src="${asset("vector-1.svg")}" alt="" /></span>
      <span class="unclaimed__badge" style="left:304.37px"><img src="${asset("vector-1.svg")}" alt="" /></span>
      <p class="unclaimed__eyebrow">unclaimed</p>
      <h2 class="unclaimed__title" aria-label="Rewards"><span class="unclaimed__word" aria-hidden="true">${[..."REWARDS"].map((letter) => `<i>${letter}</i>`).join("")}</span></h2>
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
        : `You have <span data-count>${count}</span> reward${count === 1 ? "" : "s"} unclaimed. Claim ${count === 1 ? "it" : "them"}<br />before ${count === 1 ? "it expires" : "they expire"}.`;
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

  // Play the entrance whenever the band scrolls into view, having been out of it. The first
  // run waits for the fonts and images, so it is not spent while the page is still loading.
  if (!reducedMotion.matches) {
    const settled = Promise.race([
      Promise.all([document.fonts.ready, new Promise((resolve) => (document.readyState === "complete" ? resolve() : window.addEventListener("load", resolve, { once: true })))]),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]).then(() => new Promise((resolve) => setTimeout(resolve, 350)));

    let visible = false;
    const play = () => {
      section.classList.remove("is-waiting");
      playIntro(section, unclaimed().length);
    };
    section.classList.add("is-waiting");
    new IntersectionObserver(
      async ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && section.classList.contains("is-waiting")) {
          await settled;
          if (visible && section.classList.contains("is-waiting")) play();
        } else if (!visible) {
          section.classList.add("is-waiting");
        }
      },
      { threshold: [0, 0.35] },
    ).observe(section);

    // Tapping the heading plays it again.
    section.querySelector(".unclaimed__title").addEventListener("click", play);
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
