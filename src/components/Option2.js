import { asset, el, selectOne } from "../lib/dom.js";
import { enableDragX } from "../lib/dragX.js";
import { icons } from "../lib/icons.js";
import { animate, reducedMotion, transition } from "../lib/motion.js";
import { claim, earn, state, subscribe, unclaimed } from "../lib/store.js";
import { wheelIcon } from "../lib/wheel.js";
import { BANNERS, Banner } from "./Banner.js";
import { CARDS } from "./ComingSoon.js";
import { lockup } from "./Hero.js";
import { openInsiderOffers } from "./Insider.js";
import { PARTNER_BY_NAME, openPartner } from "./PartnerPDP.js";
import { BENEFITS, openBenefit } from "./PlanBenefits.js";
import { Questions } from "./Questions.js";
import { SUBSCRIPTIONS } from "./Subscriptions.js";
import { openScratch, openSpin } from "./games.js";
import { confetti, flyCoin, openSheet, toast } from "./overlays.js";

/*
 * Option 2: the same rewards, laid out after the reference screens on the Figma page
 * (District's Events, Activities and Dining): a carnival hero with promo tiles, an
 * "Explore by" grid with a two-way toggle, a wide banner, poster rails, centred display
 * headings over round brand marks, a ticket banner, and a floating notice and tab bar.
 */

const logoOf = (reward) => reward.logo ?? (reward.art === "netflix" ? "frame.png" : "logo-1.png");
const insetOf = (reward) => reward.inset || reward.art !== "tile";
const star = `<i class="o2-star">${icons.sparkle}</i>`;
const display = (text) => `<h2 class="o2-display">${star}<span>${text}</span>${star}</h2>`;
const heading = (text) => `<h2 class="o2-heading">${text}${icons.caret}</h2>`;

/* ---------- Hero: unclaimed rewards as a carnival, each reward a promo tile ---------- */
function Hero() {
  const section = el(`
    <section class="o2-hero" id="unclaimed">
      <div class="o2-hero__glow"></div>
      <i class="o2-hero__art o2-hero__art--a" aria-hidden="true">🎁</i>
      <i class="o2-hero__art o2-hero__art--b" aria-hidden="true">🎉</i>
      <i class="o2-hero__art o2-hero__art--c" aria-hidden="true">🍿</i>
      <h1 class="o2-hero__title" aria-label="Unclaimed rewards"><span>Unclaimed</span><span>Rewards</span></h1>
      <p class="o2-hero__sub"></p>
      <div class="o2-hero__rail scroll-x"></div>
    </section>
  `);
  const sub = section.querySelector(".o2-hero__sub");
  const rail = section.querySelector(".o2-hero__rail");
  enableDragX(rail);

  rail.innerHTML = state.rewards
    .map(
      (reward) => `
        <button class="o2-promo" type="button" data-reward="${reward.id}" data-press="0.96" style="--wash:${reward.wash ?? (reward.art === "netflix" ? "#e10203" : "#8b8b98")}" ${reward.claimed ? "hidden" : ""}>
          <span class="o2-promo__label">${reward.name}</span>
          <span class="o2-promo__go">${icons.arrow}</span>
          <span class="o2-promo__logo ${insetOf(reward) ? "o2-promo__logo--inset" : ""}"><img src="${asset(logoOf(reward))}" alt="" /></span>
        </button>`,
    )
    .join("");

  function render() {
    const count = unclaimed().length;
    sub.innerHTML = count ? `${icons.sparkle}<b>${count} reward${count === 1 ? "" : "s"}</b> to claim before ${count === 1 ? "it expires" : "they expire"}${icons.sparkle}` : `${icons.sparkle}Every reward has been claimed${icons.sparkle}`;
  }
  render();

  rail.addEventListener("click", (event) => {
    const tile = event.target.closest(".o2-promo");
    if (!tile || tile.dataset.busy) return;
    tile.dataset.busy = "true";
    const reward = claim(tile.dataset.reward);
    if (!reward) return;
    tile.querySelector(".o2-promo__label").textContent = "Claimed ✓";
    tile.classList.add("is-claimed");
    confetti(tile);
    flyCoin(tile, () => earn(reward.coins, `${reward.name} claimed`));
    toast(`${reward.name} claimed · +${reward.coins} coins`);
    setTimeout(async () => {
      animate(tile, { opacity: 0, scale: 0.9 }, { duration: 0.2 });
      await animate(tile, { width: 0, marginRight: -8, paddingLeft: 0, paddingRight: 0 }, transition("collapse"));
      tile.remove();
    }, 900);
  });
  subscribe((change) => change.type === "claim" && render());

  if (!reducedMotion.matches) {
    section.querySelectorAll(".o2-hero__title span").forEach((word, index) =>
      animate(word, { opacity: [0, 1], y: [26, 0], scale: [1.2, 1], filter: ["blur(8px)", "blur(0px)"] }, { duration: 0.6, delay: 0.15 + index * 0.12, ease: [0.22, 1, 0.36, 1] }),
    );
    animate(sub, { opacity: [0, 1], y: [8, 0] }, { duration: 0.5, delay: 0.5 });
    section.querySelectorAll(".o2-promo").forEach((tile, index) => animate(tile, { opacity: [0, 1], x: [40, 0] }, { type: "spring", visualDuration: 0.5, bounce: 0.2, delay: 0.55 + index * 0.07 }));
  }
  return section;
}

/* ---------- Explore by: a two-row grid of tiles, switched between rewards and apps ---------- */
function Explore({ scrollToSection }) {
  const GROUPS = {
    rewards: [
      { label: "OTT", art: `<img class="o2-tile__img" src="${asset("netflix-logo-icon-1709191.png")}" alt="" />`, go: () => scrollToSection("#o2-active") },
      { label: "Insider", art: `<i>👑</i>`, tone: "#a92c46", go: () => scrollToSection("#o2-insider") },
      { label: "Advantage Club", art: `<i>🎟️</i>`, tone: "#e10203", go: () => scrollToSection("#o2-club") },
      { label: "What’s New", art: `<i>🔥</i>`, tone: "#ff5b02", go: () => scrollToSection("#o2-new") },
      { label: "Spin the wheel", art: wheelIcon("o2-tile__wheel"), tone: "#515dcb", go: openSpin },
      { label: "Scratch and win", art: `<i>✨</i>`, tone: "#d81b60", go: openScratch },
      { label: "Plan benefits", art: `<i>🛡️</i>`, tone: "#075ee8", go: () => scrollToSection("#o2-spotlight") },
      { label: "Coming soon", art: `<i>⏳</i>`, tone: "#1e7b3c", go: () => scrollToSection("#o2-soon") },
    ],
    apps: [
      { label: "Netflix", logo: "frame.png", inset: true, benefit: "Netflix Mobile" },
      { label: "Prime Video", logo: "ott-prime.svg" },
      { label: "Xstream Play", logo: "logo.png", benefit: "Xstream Play" },
      { label: "Apple TV+", logo: "logo-1.png", inset: true, benefit: "Apple TV+" },
      { label: "Google One", logo: "logo-2.png", benefit: "Google One" },
      { label: "JioHotstar", logo: "frame-1.png", benefit: "JioHotstar Mobile" },
      { label: "Adobe Express", logo: "logo-adobe.png" },
      { label: "ZEE5", logo: "logo-zee5.png", light: true },
    ],
  };

  const section = el(`
    <section class="o2-explore reveal" id="o2-explore">
      <header class="o2-explore__head">
        <h2 class="o2-heading">Explore by</h2>
        <div class="o2-toggle" role="tablist">
          <span class="o2-toggle__thumb"></span>
          <button type="button" role="tab" aria-selected="true" data-group="rewards">Rewards</button>
          <button type="button" role="tab" aria-selected="false" data-group="apps">Apps</button>
        </div>
      </header>
      <div class="o2-grid scroll-x"></div>
    </section>
  `);
  const grid = section.querySelector(".o2-grid");
  const tabs = [...section.querySelectorAll("[data-group]")];
  const thumb = section.querySelector(".o2-toggle__thumb");
  enableDragX(grid);

  const tile = (item, index) => `
    <button class="o2-tile" type="button" data-index="${index}" data-press="0.95" style="--tone:${item.tone ?? "#3a3a46"}">
      <span class="o2-tile__label">${item.label}</span>
      <span class="o2-tile__art">${item.logo ? `<span class="o2-tile__logo ${item.inset ? "o2-tile__logo--inset" : ""} ${item.light ? "o2-tile__logo--light" : ""}"><img src="${asset(item.logo)}" alt="" /></span>` : item.art}</span>
    </button>`;

  let group = "rewards";
  function render(animated) {
    grid.innerHTML = GROUPS[group].map(tile).join("");
    grid.scrollLeft = 0;
    if (animated && !reducedMotion.matches) {
      [...grid.children].forEach((node, index) => animate(node, { opacity: [0, 1], y: [16, 0], scale: [0.92, 1] }, { type: "spring", visualDuration: 0.4, bounce: 0.25, delay: index * 0.035 }));
    }
  }
  render(false);

  function moveThumb(tab) {
    thumb.style.width = `${tab.offsetWidth}px`;
    animate(thumb, { x: tab.offsetLeft - 4 }, reducedMotion.matches ? { duration: 0.01 } : { type: "spring", visualDuration: 0.3, bounce: 0.2 });
  }
  requestAnimationFrame(() => document.fonts.ready.then(() => moveThumb(tabs[0])));

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      if (tab.dataset.group === group) return;
      group = tab.dataset.group;
      selectOne(tabs, tab, "aria-selected");
      moveThumb(tab);
      render(true);
    }),
  );

  grid.addEventListener("click", (event) => {
    const node = event.target.closest(".o2-tile");
    if (!node) return;
    const item = GROUPS[group][node.dataset.index];
    if (item.go) return item.go();
    if (PARTNER_BY_NAME[item.label]) return openPartner(PARTNER_BY_NAME[item.label]);
    const benefit = BENEFITS.find((entry) => entry.name === item.benefit);
    if (benefit) openBenefit(benefit);
    else toast(`${item.label} is part of Airtel Insider`);
  });
  return section;
}

/* ---------- The Advantage Club as a wide banner ---------- */
function WideBanner() {
  const banner = BANNERS[0];
  const section = el(`
    <section class="reveal" id="o2-club">
      <button class="o2-wide" type="button" data-press="0.98">
        <span class="o2-wide__art"><img src="${asset("image.png")}" alt="" /></span>
        ${lockup({ width: 84, height: 41.8, left: 16, top: 12, tag: "vector-2.svg", mark: "layer-2.svg", name: "group-1.svg" })}
        <span class="o2-wide__title">Zakir Khan, Live, Delhi</span>
        <span class="o2-wide__sub">Free for members · ${banner.caption}</span>
        <span class="o2-wide__cta">Register${icons.caret}</span>
      </button>
    </section>
  `);
  // The full banner, off screen, lends this one its details sheet and Register state.
  const full = Banner(banner);
  section.querySelector(".o2-wide").addEventListener("click", () => full.click());
  return section;
}

/* ---------- What's New: posters with a bookmark ---------- */
function Posters() {
  const section = el(`
    <section class="reveal" id="o2-new">
      ${heading("What’s New")}
      <div class="o2-posters scroll-x"></div>
    </section>
  `);
  const rail = section.querySelector(".o2-posters");
  BANNERS.forEach((banner, index) => {
    const poster = el(`
      <div class="o2-poster">
        <span class="o2-poster__tag">${banner.kind === "club" ? "Club" : "Insider"}</span>
        <button class="o2-poster__save" type="button" aria-label="Save" aria-pressed="false">${icons.bookmark}</button>
      </div>
    `);
    poster.prepend(Banner(banner));
    poster.style.setProperty("--i", index);
    rail.append(poster);
  });
  rail.addEventListener("click", (event) => {
    const save = event.target.closest(".o2-poster__save");
    if (!save) return;
    event.stopPropagation();
    const on = save.getAttribute("aria-pressed") !== "true";
    save.setAttribute("aria-pressed", String(on));
    if (!reducedMotion.matches) animate(save, { scale: [1, 1.35, 1] }, transition("pop"));
    toast(on ? "Saved for later" : "Removed from saved");
  });
  enableDragX(rail);
  return section;
}

/* ---------- In the spotlight: plan benefits as round marks ---------- */
function Spotlight() {
  const section = el(`
    <section class="reveal" id="o2-spotlight">
      ${display("Included in your plan")}
      <div class="o2-spots scroll-x">
        ${BENEFITS.map(
          (item) => `
            <button class="o2-spot" type="button" data-benefit="${item.name}" data-press="0.94">
              <span class="o2-spot__mark ${item.inset ? "o2-spot__mark--inset" : ""}" data-press-target><img src="${asset(item.logo)}" alt="" /></span>
              <span class="o2-spot__name">${item.name}</span>
              <span class="o2-spot__offer">Free with ₹399</span>
            </button>`,
        ).join("")}
      </div>
    </section>
  `);
  section.querySelectorAll("[data-benefit]").forEach((button) => button.addEventListener("click", () => openBenefit(BENEFITS.find((item) => item.name === button.dataset.benefit))));
  enableDragX(section.querySelector(".o2-spots"));
  return section;
}

/* ---------- Play and win: two promo tiles ---------- */
function Play() {
  const section = el(`
    <section class="reveal" id="o2-play">
      ${display("Play and win")}
      <div class="o2-play">
        <button class="o2-game o2-game--scratch" type="button" data-game="scratch" data-press="0.96">
          <span class="o2-game__label">Scratch<br />&amp; win</span>
          <span class="o2-promo__go">${icons.arrow}</span>
          <i class="o2-game__art" aria-hidden="true">🎫</i>
          <span class="play-card__shine"></span>
        </button>
        <button class="o2-game o2-game--spin" type="button" data-game="spin" data-press="0.96">
          <span class="o2-game__label">Spin<br />&amp; win</span>
          <span class="o2-promo__go">${icons.arrow}</span>
          ${wheelIcon("o2-game__wheel")}
          <span class="play-card__shine" style="animation-delay:-1.6s"></span>
        </button>
      </div>
    </section>
  `);
  const games = { scratch: openScratch, spin: openSpin };
  section.querySelectorAll("[data-game]").forEach((card) => card.addEventListener("click", () => games[card.dataset.game]()));
  return section;
}

/* ---------- Airtel Insider as a ticket ---------- */
function Ticket() {
  const section = el(`
    <section class="o2-steals reveal" id="o2-insider">
      <div class="o2-ticket">
        <div class="o2-ticket__main">
          <span class="o2-ticket__logo"><img src="${asset("insider-final-021.png")}" alt="airtel insider" /></span>
          <p class="o2-ticket__title">Offers<br />of the week</p>
          <p class="o2-ticket__stars">★ ★ ★ ★ ★ ★ ★</p>
          <p class="o2-ticket__deal">Pocket FM · LinkedIn · Croma</p>
        </div>
        <div class="o2-ticket__stub"><span>Exclusive</span><b>★</b><span>for Airtel</span><span>users</span></div>
      </div>
      <button class="o2-steals__cta pressable" type="button" data-press="0.96">Explore now${icons.caret}</button>
    </section>
  `);
  section.querySelector(".o2-steals__cta").addEventListener("click", openInsiderOffers);
  section.querySelector(".o2-ticket").addEventListener("click", openInsiderOffers);
  return section;
}

/* ---------- Active subscriptions: picture-topped cards ---------- */
function Picks() {
  const section = el(`
    <section class="reveal" id="o2-active">
      ${display("Active subscriptions")}
      <div class="o2-picks scroll-x">
        ${SUBSCRIPTIONS.map(
          (item) => `
            <button class="o2-pick" type="button" data-sub="${item.name}" data-press="0.97">
              <span class="o2-pick__top"><span class="o2-pick__logo ${item.logoClass ?? ""}"><img src="${asset(item.logo)}" alt="" /></span><em><i class="sub-row__dot"></i>Active</em></span>
              <span class="o2-pick__name">${item.name}</span>
              <span class="o2-pick__meta">${item.plan}</span>
              <span class="o2-pick__till">${item.till}</span>
            </button>`,
        ).join("")}
      </div>
    </section>
  `);
  section.querySelectorAll("[data-sub]").forEach((card) =>
    card.addEventListener("click", () => {
      const item = SUBSCRIPTIONS.find((entry) => entry.name === card.dataset.sub);
      if (PARTNER_BY_NAME[item.name]) return openPartner(PARTNER_BY_NAME[item.name]);
      openSheet({
        eyebrow: "Active subscription",
        title: item.name,
        content: `<ul class="sheet__facts"><li><span>Status</span><strong style="color:var(--color-success)">Active</strong></li><li><span>Billing</span><strong>${item.plan}</strong></li><li><span>Valid</span><strong>${item.till}</strong></li></ul>`,
        cta: { label: "Manage subscription", onClick: (close) => (close(), toast(`Opening ${item.name}`)) },
      });
    }),
  );
  enableDragX(section.querySelector(".o2-picks"));
  return section;
}

/* ---------- Coming soon: a numbered rail ---------- */
function Soon() {
  const section = el(`
    <section class="reveal" id="o2-soon">
      ${heading("Coming soon")}
      <div class="o2-top scroll-x">
        ${CARDS.map(
          (item, index) => `
            <div class="o2-top__item">
              <b class="o2-top__rank">${index + 1}</b>
              <article class="o2-top__card ${item.tint ? `soon-card--${item.tint}` : ""}">
                ${item.art ?? ""}
                ${item.photo ? `<img class="o2-top__photo" src="${asset("card-cult-fit.jpg")}" alt="" />` : ""}
                <span class="o2-top__date">${item.date}</span>
                <p class="o2-top__title">${item.title.join("<br />")}</p>
                <button class="o2-top__notify" type="button" aria-pressed="false" data-brand="${item.brand}">Notify me</button>
              </article>
            </div>`,
        ).join("")}
      </div>
    </section>
  `);
  section.addEventListener("click", (event) => {
    const button = event.target.closest(".o2-top__notify");
    if (!button) return;
    const on = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(on));
    button.textContent = on ? "Notifying ✓" : "Notify me";
    toast(on ? `We’ll tell you when ${button.dataset.brand} goes live` : "Reminder removed");
  });
  enableDragX(section.querySelector(".o2-top"));
  return section;
}

/** The sections of Option 2, in order. */
export function Option2({ scrollToSection }) {
  return [Hero(), Explore({ scrollToSection }), WideBanner(), Posters(), Spotlight(), Play(), Ticket(), Picks(), Soon(), Questions()];
}

/** What floats over the page: the expiry notice, the tab bar and the spin shortcut. */
export function Option2Floating({ page, scrollToSection }) {
  const notice = el(`
    <div class="o2-notice">
      <i aria-hidden="true">🎁</i>
      <div><strong></strong><span>Claim them before they expire</span></div>
      <button type="button" aria-label="Dismiss">${icons.close}</button>
    </div>
  `);
  const count = () => (notice.querySelector("strong").textContent = `${unclaimed().length} rewards waiting for you`);
  count();
  subscribe((change) => change.type === "claim" && count());
  const dismiss = () => animate(notice, { opacity: 0, y: 20 }, { duration: 0.25 }).then(() => notice.remove());
  notice.querySelector("button").addEventListener("click", (event) => (event.stopPropagation(), dismiss()));
  notice.addEventListener("click", () => (scrollToSection("#unclaimed"), dismiss()));

  const TABS = [
    { id: "rewards", label: "Rewards", icon: "gift", target: "#unclaimed" },
    { id: "play", label: "Play", icon: "game", target: "#o2-play" },
    { id: "help", label: "Help", icon: "help", target: "#questions" },
  ];
  const bar = el(`
    <nav class="o2-tabs" aria-label="Sections">
      ${TABS.map((tab, index) => `<button type="button" data-target="${tab.target}" aria-current="${index === 0}">${icons[tab.icon]}<span>${tab.label}</span></button>`).join("")}
    </nav>
  `);
  const buttons = [...bar.querySelectorAll("button")];
  buttons.forEach((button) => button.addEventListener("click", () => scrollToSection(button.dataset.target)));

  const fab = el(`<button class="o2-fab pressable" type="button" aria-label="Spin the wheel" data-press="0.9">${icons.sparkle}</button>`);
  fab.addEventListener("click", openSpin);

  // The tab bar follows the scroll, and ducks away while the page moves down.
  let last = 0;
  page.addEventListener(
    "scroll",
    () => {
      const top = page.scrollTop;
      const down = top > last + 4 && top > 200;
      if (down || top < last - 4) bar.classList.toggle("is-away", down);
      last = top;
      const middle = top + page.clientHeight / 2;
      const current = [...TABS].reverse().find((tab) => page.querySelector(tab.target).offsetTop <= middle) ?? TABS[0];
      buttons.forEach((button) => button.setAttribute("aria-current", String(button.dataset.target === current.target)));
    },
    { passive: true },
  );

  if (!reducedMotion.matches) {
    animate(bar, { y: [90, 0], opacity: [0, 1] }, { type: "spring", visualDuration: 0.5, bounce: 0.25, delay: 0.5 });
    animate(notice, { y: [60, 0], opacity: [0, 1] }, { type: "spring", visualDuration: 0.5, bounce: 0.2, delay: 1.1 });
    animate(fab, { scale: [0, 1] }, { type: "spring", visualDuration: 0.5, bounce: 0.45, delay: 0.9 });
  }
  return [notice, fab, bar];
}
