import { asset, el, selectOne } from "../lib/dom.js";
import { enableDragX } from "../lib/dragX.js";
import { animate, transition } from "../lib/motion.js";
import { sectionHead } from "./PlayAndWin.js";
import { openSheet, toast } from "./overlays.js";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "insider", label: "Insider" },
  { id: "plan", label: "Plan benefits" },
  { id: "other", label: "Other Subscriptions" },
];

// The first two rows are the ones drawn in Figma; the rest appear under "View all" and the filters.
const SUBSCRIPTIONS = [
  { name: "Netflix Mobile", plan: "With your ₹399 plan", till: "Till 3 Jan", group: "plan", logo: "frame.png", logoClass: "sub-row__logo--inset" },
  { name: "JioHotstar Mobile", plan: "With your ₹399 plan", till: "Till 12 Mar", group: "plan", logo: "frame-1.png" },
  { name: "Xstream Play", plan: "With your ₹399 plan", till: "Till 3 Jan", group: "plan", logo: "logo.png" },
  { name: "LinkedIn Premium", plan: "With Airtel Insider", till: "Till 9 Feb", group: "insider", logo: "screenshot-20261009-at-13628-pm-4.png", logoClass: "sub-row__logo--sprite sub-row__logo--round" },
  { name: "Google One", plan: "₹130 a month", till: "Till 20 Jun", group: "other", logo: "logo-2.png" },
];

const COLLAPSED = 2;

const row = (item) => `
  <button class="sub-row" type="button" data-sub="${item.name}">
    <span class="sub-row__logo ${item.logoClass ?? ""}"><img src="${asset(item.logo)}" alt="" /></span>
    <span class="sub-row__text">
      <p class="sub-row__name">${item.name}</p>
      <p class="sub-row__plan">${item.plan}</p>
    </span>
    <span class="sub-row__status"><strong>Active</strong><span>${item.till}</span></span>
  </button>`;

/** Active subscriptions: filter pills over a list that expands with "View all". */
export function Subscriptions() {
  const section = el(`
    <section class="subs reveal" id="subscriptions">
      ${sectionHead({ title: "Active Subscriptions", sub: "View and manage your subscriptions in one place.", grey: true })}
      <div class="subs__panel">
        <div class="pills scroll-x" role="tablist" aria-label="Subscription type">
          ${FILTERS.map((filter, index) => `<button class="pill pressable" type="button" role="tab" aria-selected="${index === 0}" data-filter="${filter.id}">${filter.label}</button>`).join("")}
        </div>
        <div class="subs__card"><div class="subs__rows"></div></div>
      </div>
    </section>
  `);
  const pills = [...section.querySelectorAll(".pill")];
  const card = section.querySelector(".subs__card");
  const rows = section.querySelector(".subs__rows");
  enableDragX(section.querySelector(".pills"));

  let filter = "all";
  let expanded = false;

  function render(animated) {
    const from = card.offsetHeight;
    const matches = SUBSCRIPTIONS.filter((item) => filter === "all" || item.group === filter);
    const shown = expanded ? matches : matches.slice(0, COLLAPSED);
    rows.innerHTML =
      (shown.length ? shown.map(row).join("") : `<p class="subs__empty">Nothing here yet.<br />Subscriptions you add will show up in this list.</p>`) +
      (matches.length > COLLAPSED ? `<button class="subs__all" type="button">${expanded ? "Show less" : "View all"}</button>` : `<div style="height:14px"></div>`);
    if (!animated) return;

    // Resize the card with a spring and bring the rows in one after another.
    const to = card.offsetHeight;
    card.style.height = `${from}px`;
    animate(card, { height: [from, to] }, transition("collapse")).then(() => (card.style.height = ""));
    [...rows.children].forEach((child, index) => animate(child, { opacity: [0, 1], y: [8, 0] }, { duration: 0.32, delay: index * 0.04 }));
  }
  render(false);

  pills.forEach((pill) =>
    pill.addEventListener("click", () => {
      if (pill.dataset.filter === filter) return;
      filter = pill.dataset.filter;
      expanded = false;
      selectOne(pills, pill, "aria-selected");
      pill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      render(true);
    }),
  );

  rows.addEventListener("click", (event) => {
    if (event.target.closest(".subs__all")) {
      expanded = !expanded;
      render(true);
      return;
    }
    const button = event.target.closest("[data-sub]");
    if (!button) return;
    const item = SUBSCRIPTIONS.find((entry) => entry.name === button.dataset.sub);
    openSheet({
      eyebrow: "Active subscription",
      title: item.name,
      content: `
        <ul class="sheet__facts">
          <li><span>Status</span><strong style="color:var(--color-success)">Active</strong></li>
          <li><span>Billing</span><strong>${item.plan}</strong></li>
          <li><span>Valid</span><strong>${item.till}</strong></li>
          <li><span>Linked number</span><strong>9716317865</strong></li>
        </ul>`,
      cta: {
        label: "Manage subscription",
        onClick(close) {
          close();
          toast(`Opening ${item.name}`);
        },
      },
    });
  });

  return section;
}
