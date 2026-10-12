import { asset, el } from "../lib/dom.js";
import { enableDragX } from "../lib/dragX.js";
import { animate, reducedMotion, transition } from "../lib/motion.js";
import { claim, earn, state, subscribe, unclaimed } from "../lib/store.js";
import { confetti, flyCoin, openSheet, toast } from "./overlays.js";

const ART = {
  netflix: { wash: "#fa0000", html: `<div class="claim-card__art claim-card__art--netflix"><img src="${asset("screenshot-20261008-at-110412-am-1.png")}" alt="" /></div>` },
  appletv: { wash: "#9a9aa6", html: `<div class="claim-card__art claim-card__art--appletv"><img src="${asset("screenshot-20261008-at-111419-am-1.png")}" alt="" /></div>` },
};

function card(reward) {
  const art = ART[reward.art] ?? {
    wash: reward.wash,
    html: `<div class="claim-card__art claim-card__art--tile"><img src="${asset(reward.logo)}" alt="" ${reward.inset ? 'style="left:-19.44%;top:-19.44%;width:138.89%;height:138.89%"' : ""} /></div>`,
  };
  return `
    <article class="claim-card" data-reward="${reward.id}">
      <span class="claim-card__wash" style="background:${art.wash}"></span>
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
    confetti(button);
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

const EASE = [0.22, 1, 0.36, 1];
const LOOP_HOLD = 3000; // how long the heading rests before it leaves and comes in again

/**
 * The heading coming in: light runs out along the two streaks, "UNCLAIMED" tracks in,
 * "REWARDS" rises letter by letter out of a blur, the badges spin into place and a sheen
 * crosses the word. Returns how long it takes, in milliseconds.
 */
function headingIn(section) {
  const all = (selector) => [...section.querySelectorAll(selector)];

  all(".unclaimed__streak").forEach((streak) => {
    animate(streak, { opacity: [0, 1] }, { duration: 0.9, ease: EASE });
    animate(streak.firstElementChild, { scaleX: [0.15, 1] }, { duration: 1.3, ease: EASE });
  });
  animate(
    section.querySelector(".unclaimed__eyebrow"),
    { opacity: [0, 1], letterSpacing: ["9px", "0.56px"], filter: ["blur(4px)", "blur(0px)"] },
    { duration: 1, delay: 0.1, ease: EASE },
  );
  all(".unclaimed__word i").forEach((letter, index) =>
    animate(letter, { opacity: [0, 1], y: [22, 0], scale: [1.25, 1], filter: ["blur(10px)", "blur(0px)"] }, { duration: 0.6, delay: 0.2 + index * 0.05, ease: EASE }),
  );
  all(".unclaimed__badge").forEach((badge, index) =>
    animate(badge, { opacity: [0, 1], scale: [0, 1], rotate: [index ? 200 : -200, 0] }, { type: "spring", visualDuration: 0.6, bounce: 0.35, delay: 0.5 + index * 0.06 }),
  );

  const word = section.querySelector(".unclaimed__word");
  word.classList.remove("is-shining");
  setTimeout(() => word.classList.add("is-shining"), 950);
  return 2300;
}

/** The heading leaving, softly, before the next pass of the loop. */
function headingOut(section) {
  const all = (selector) => [...section.querySelectorAll(selector)];
  const out = { duration: 0.6, ease: [0.4, 0, 0.6, 1] };

  all(".unclaimed__streak").forEach((streak) => animate(streak, { opacity: 0 }, { ...out, duration: 0.8 }));
  animate(section.querySelector(".unclaimed__eyebrow"), { opacity: 0, letterSpacing: "5px", filter: "blur(3px)" }, out);
  all(".unclaimed__word i").forEach((letter, index) => animate(letter, { opacity: 0, y: -14, filter: "blur(8px)" }, { ...out, delay: index * 0.045 }));
  all(".unclaimed__badge").forEach((badge, index) => animate(badge, { opacity: 0, scale: 0, rotate: index ? -160 : 160 }, out));
  return 950;
}

/** Once, the first time the band is seen: the count runs up and the cards arrive from the right. */
function contentIn(section, count) {
  const all = (selector) => [...section.querySelectorAll(selector)];
  animate(section.querySelector(".unclaimed__text"), { opacity: [0, 1], y: [10, 0] }, { duration: 0.6, delay: 0.8, ease: EASE });
  all(".claim-card").forEach((card, index) => animate(card, { opacity: [0, 1], x: [56, 0] }, { type: "spring", visualDuration: 0.6, bounce: 0.18, delay: 0.85 + index * 0.09 }));
  const link = section.querySelector(".unclaimed__all");
  if (link) animate(link, { opacity: [0, 1] }, { duration: 0.5, delay: 1.25 });

  const number = section.querySelector("[data-count]");
  if (!number || count === 0) return;
  const started = performance.now() + 800;
  (function tick(now) {
    const progress = Math.min(1, Math.max(0, (now - started) / 700));
    number.textContent = Math.round(count * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1 && number.isConnected) requestAnimationFrame(tick);
  })(performance.now());
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

  // The heading's entrance loops for as long as the band is on screen: in, rest, out, in
  // again. The cards and the count come in with the first pass only. The first run waits for
  // the fonts and images, so it is not spent while the page is still loading.
  if (!reducedMotion.matches) {
    const settled = Promise.race([
      Promise.all([document.fonts.ready, new Promise((resolve) => (document.readyState === "complete" ? resolve() : window.addEventListener("load", resolve, { once: true })))]),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]).then(() => new Promise((resolve) => setTimeout(resolve, 350)));

    let visible = false;
    let timer = 0;
    let started = false;

    function loop() {
      clearTimeout(timer);
      section.classList.remove("is-waiting");
      const taken = headingIn(section);
      timer = setTimeout(() => {
        timer = setTimeout(loop, headingOut(section));
      }, taken + LOOP_HOLD);
    }

    section.classList.add("is-waiting");
    new IntersectionObserver(
      async ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          clearTimeout(timer);
          timer = 0;
          return;
        }
        await settled;
        if (!visible || timer) return;
        if (!started) contentIn(section, unclaimed().length);
        started = true;
        loop();
      },
      { threshold: [0, 0.35] },
    ).observe(section);
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
