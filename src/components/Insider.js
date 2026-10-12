import { asset, el, themed } from "../lib/dom.js";
import { icons } from "../lib/icons.js";
import { sectionHead } from "./PlayAndWin.js";
import { openSheet, toast } from "./overlays.js";

const SPRITE = "screenshot-20261009-at-13628-pm-4.png";

const OFFERS = [
  { name: "Pocket FM", sub: "3 months of unlimited audio series", bubble: "pocket" },
  { name: "LinkedIn Premium", sub: "2 months of Premium Career", bubble: "linkedin" },
  { name: "Croma", sub: "₹1,000 off on orders above ₹10,000", bubble: "croma" },
];

/** Airtel Insider: partner bubbles circling the Insider mark, under a turning stamp. */
export function Insider() {
  const section = el(`
    <section class="insider reveal" id="insider">
      ${sectionHead({ title: "Airtel Insider", sub: "Unlock special deals and experiences", icon: "crown", tone: "rose" })}
      <div class="stamp" aria-hidden="true">
        <svg class="stamp__ring" viewBox="0 0 92 92">
          <defs><path id="stamp-path" d="M46,46 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" /></defs>
          <text><textPath href="#stamp-path" textLength="228">• Exclusive for Airtel users • Exclusive for Airtel users </textPath></text>
        </svg>
        ${themed("vector-4.svg", "stamp__logo")}
      </div>
      <div class="insider__card">
        <div class="insider__skin">
          <img src="${asset("insider-reskin.png")}" alt="" />
          <img class="insider__rays" src="${asset("union.svg")}" alt="" />
        </div>
        <div class="insider__frame">
          <img class="insider__ring insider__ring--inner" src="${asset("ellipse-19137.svg")}" alt="" />
          <img class="insider__ring insider__ring--outer" src="${asset("ellipse-19138.svg")}" alt="" />
          <div class="insider__orbit">
            <div class="insider__bubble insider__bubble--croma"><img src="${asset(SPRITE)}" alt="Croma" /></div>
            <div class="insider__bubble insider__bubble--linkedin"><img src="${asset(SPRITE)}" alt="LinkedIn" /></div>
            <div class="insider__bubble insider__bubble--pocket"><img src="${asset("screenshot-20261009-at-14232-pm-1.png")}" alt="Pocket FM" /></div>
          </div>
          <div class="insider__orbit insider__orbit--outer">
            <div class="insider__bubble insider__bubble--small" style="left:-147.5px;top:-77.9px"><img src="${asset("ott-prime.svg")}" alt="Prime Video" /></div>
            <div class="insider__bubble insider__bubble--small" style="left:75.6px;top:93.3px"><img src="${asset("logo-2.png")}" alt="Google One" /></div>
            <div class="insider__bubble insider__bubble--small" style="left:71.7px;top:-130.5px"><img src="${asset("logo-adobe.png")}" alt="Adobe Express" /></div>
          </div>
          <div class="insider__pulse"></div>
          <div class="insider__pill">
            <div class="insider__pill-logo"><img src="${asset("insider-final-021.png")}" alt="airtel insider" /></div>
          </div>
          <button class="insider__button pressable" type="button" data-press="0.98">View all offers${icons.arrow}</button>
        </div>
      </div>
    </section>
  `);

  section.querySelector(".insider__button").addEventListener("click", () => {
    const list = el(`
      <div class="sheet-list">
        ${OFFERS.map(
          (offer) => `
            <div class="sheet-row">
              <div class="sheet-row__text"><p class="sheet-row__name">${offer.name}</p><p class="sheet-row__sub">${offer.sub}</p></div>
              <button class="sheet-row__action pressable" type="button" data-offer="${offer.name}">Unlock</button>
            </div>`,
        ).join("")}
      </div>`);
    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-offer]");
      if (!button || button.disabled) return;
      button.disabled = true;
      button.textContent = "Unlocked ✓";
      toast(`${button.dataset.offer} offer unlocked`);
    });
    openSheet({ eyebrow: "Airtel Insider", title: "Offers for you", text: "Exclusive for Airtel users. Unlock an offer to get its code by SMS.", content: list });
  });

  return section;
}
