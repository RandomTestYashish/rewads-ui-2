import { asset, el, themed } from "../lib/dom.js";
import { PARTNER_BY_NAME, openPartner } from "./PartnerPDP.js";
import { sectionHead } from "./PlayAndWin.js";
import { openSheet, toast } from "./overlays.js";

// The first three are drawn in Figma; the rest appear under "View all".
export const BENEFITS = [
  { name: "Xstream Play", sub: "22 apps in one, free with your plan", logo: "logo.png", about: "SonyLIV, Lionsgate Play, Aha and 19 more apps under one login, on your phone and TV." },
  { name: "Apple TV+", sub: "3 months free with your Wi-Fi plan", logo: "logo-1.png", inset: true, about: "Apple Originals, ad-free, for three months. Renews at ₹99 a month unless cancelled." },
  { name: "Google One", sub: "100 GB of storage for 6 months", logo: "logo-2.png", about: "100 GB across Photos, Drive and Gmail, shared with up to five family members." },
  { name: "Netflix Mobile", sub: "Included while your plan is active", logo: "frame.png", inset: true, about: "Netflix on one phone or tablet at a time, in 480p, for as long as your ₹399 plan runs." },
  { name: "JioHotstar Mobile", sub: "Live sport and shows for 3 months", logo: "frame-1.png", about: "Live cricket, films and shows on one mobile device, for three months." },
];

const VISIBLE = 3;

// App tiles that drift past under the list; the list is doubled so the loop has no seam.
const STRIP = [
  { logo: "frame.png", inset: true },
  { logo: "ott-prime.svg" },
  { logo: "logo.png" },
  { logo: "logo-1.png", inset: true },
  { logo: "logo-2.png" },
  { logo: "frame-1.png" },
  { logo: "logo-adobe.png" },
  { logo: "logo-zee5.png", light: true },
];

const tile = (item) => `<span class="logo-strip__tile ${item.inset ? "logo-strip__tile--inset" : ""} ${item.light ? "logo-strip__tile--light" : ""}"><img src="${asset(item.logo)}" alt="" /></span>`;

const logo = (item, className) => `<span class="${className} ${item.inset ? `${className}--inset` : ""}"><img src="${asset(item.logo)}" alt="" /></span>`;

export function openBenefit(item) {
  // Partners with a Discovery page open it; the rest keep the summary sheet.
  if (PARTNER_BY_NAME[item.name]) return openPartner(PARTNER_BY_NAME[item.name]);
  openSheet({
    eyebrow: "Included in your ₹399 plan",
    content: `
      <div class="sheet__hero">${logo(item, "sheet__logo")}<div><h2 class="sheet__title" style="margin:0">${item.name}</h2><p class="sheet__text" style="margin-top:2px">${item.sub}</p></div></div>
      <p class="sheet__text">${item.about}</p>
      <ul class="sheet__facts">
        <li><span>Cost</span><strong>No extra cost</strong></li>
        <li><span>Plan</span><strong>Postpaid ₹399</strong></li>
      </ul>`,
    cta: {
      label: "Activate now",
      onClick(close) {
        close();
        toast(`${item.name} is being activated`);
      },
    },
  });
}

/** Benefits bundled with the plan, each opening its own sheet. */
export function PlanBenefits() {
  const section = el(`
    <section class="plan reveal" id="plan">
      ${sectionHead({ title: "Included in your ₹399 plan", sub: "Postpaid ₹399 · at no extra cost", all: true })}
      <div class="plan__list">
        ${BENEFITS.slice(0, VISIBLE)
          .map(
            (item) => `
              <button class="plan-row" type="button" data-benefit="${item.name}" data-press="0.98">
                ${logo(item, "plan-row__logo")}
                <span class="plan-row__text">
                  <p class="plan-row__name">${item.name}<i class="plan-row__tag">Free</i></p>
                  <p class="plan-row__sub">${item.sub}</p>
                </span>
                <span class="plan-row__go">${themed("ph-regular-caret-right.svg", "plan-row__caret")}</span>
              </button>`,
          )
          .join("")}
      </div>
      <div class="logo-strip" aria-label="Apps included with Xstream Play">
        <p class="logo-strip__label">22 apps in one with Xstream Play</p>
        <div class="logo-strip__window"><div class="logo-strip__track">${[...STRIP, ...STRIP].map(tile).join("")}</div></div>
      </div>
    </section>
  `);

  const find = (name) => BENEFITS.find((item) => item.name === name);
  section.querySelectorAll("[data-benefit]").forEach((button) => button.addEventListener("click", () => openBenefit(find(button.dataset.benefit))));

  section.querySelector(".sec-head__all").addEventListener("click", () => {
    const list = el(`
      <div class="sheet-list">
        ${BENEFITS.map(
          (item) => `
            <button class="sheet-row pressable" type="button" data-benefit="${item.name}">
              ${logo(item, "sheet-row__logo")}
              <div class="sheet-row__text"><p class="sheet-row__name">${item.name}</p><p class="sheet-row__sub">${item.sub}</p></div>
            </button>`,
        ).join("")}
      </div>`);
    const { close } = openSheet({ eyebrow: "Postpaid ₹399 · at no extra cost", title: "Everything in your plan", content: list });
    list.querySelectorAll("[data-benefit]").forEach((button) =>
      button.addEventListener("click", () => {
        close();
        setTimeout(() => openBenefit(find(button.dataset.benefit)), 220);
      }),
    );
  });

  return section;
}
