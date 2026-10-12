import { asset, el } from "../lib/dom.js";
import { icons } from "../lib/icons.js";
import { openScratch, openSpin } from "./games.js";
import { openSheet } from "./overlays.js";

/** Section heading: a tinted icon chip, the title and its line of support, and "View all". */
export function sectionHead({ title, sub, icon, tone, all = false }) {
  return `
    <header class="sec-head" data-tone="${tone}">
      <span class="sec-head__icon">${icons[icon]}</span>
      <div class="sec-head__text">
        <h2 class="sec-head__title">${title}</h2>
        <p class="sec-head__sub">${sub}</p>
      </div>
      ${all ? `<button class="sec-head__all pressable" type="button" aria-label="View all">${icons.arrow}</button>` : ""}
    </header>`;
}

/** Two games: the scratch card and the spin wheel. */
export function PlayAndWin() {
  const section = el(`
    <section class="play reveal" id="play">
      ${sectionHead({ title: "Play And win", sub: "Unlock exclusive offers and rewards.", icon: "game", tone: "violet", all: true })}
      <div class="play__cards">
        <button class="play-card play-card--scratch" type="button" data-game="scratch" data-press="0.96">
          <span class="play-card__beam"></span>
          <span class="play-card__word play-card__word--glow" aria-hidden="true">First <br />time travel</span>
          <span class="play-card__word play-card__word--top">First <br />time travel</span>
          <span class="play-card__label">Scratch and Claim</span>
          <span class="play-card__shine"></span>
          <i class="play-card__star" style="left:22px;top:26px">${icons.sparkle}</i>
          <i class="play-card__star" style="left:124px;top:44px;width:9px;animation-delay:-1.1s">${icons.sparkle}</i>
          <i class="play-card__star" style="left:112px;top:132px;width:11px;animation-delay:-2s">${icons.sparkle}</i>
        </button>
        <button class="play-card play-card--spin" type="button" data-game="spin" data-press="0.96">
          <span class="play-card__beam"></span>
          <span class="play-card__label">Spin and win</span>
          <img class="play-card__wheel" src="${asset("group-1597881920.svg")}" alt="" />
          <span class="play-card__shadow"><img src="${asset("ellipse-19136.svg")}" alt="" /></span>
          <span class="play-card__shine" style="animation-delay:-1.6s"></span>
          <i class="play-card__star" style="left:20px;top:22px;width:10px;animation-delay:-0.6s">${icons.sparkle}</i>
          <i class="play-card__star" style="left:128px;top:112px;animation-delay:-1.7s">${icons.sparkle}</i>
        </button>
      </div>
    </section>
  `);

  const games = { scratch: openScratch, spin: openSpin };
  section.querySelectorAll("[data-game]").forEach((card) => card.addEventListener("click", () => games[card.dataset.game]()));

  section.querySelector(".sec-head__all").addEventListener("click", () => {
    const list = el(`
      <div class="sheet-list">
        <button class="sheet-row pressable" type="button" data-game="scratch">
          <div class="sheet-row__text"><p class="sheet-row__name">Scratch and Claim</p><p class="sheet-row__sub">First time travel · up to 100 coins</p></div>
          <span class="sheet-row__action">Play</span>
        </button>
        <button class="sheet-row pressable" type="button" data-game="spin">
          <div class="sheet-row__text"><p class="sheet-row__name">Spin and win</p><p class="sheet-row__sub">Up to 500 coins on every spin</p></div>
          <span class="sheet-row__action">Play</span>
        </button>
      </div>`);
    const { close } = openSheet({ eyebrow: "Play and win", title: "All games", content: list });
    list.querySelectorAll("[data-game]").forEach((row) =>
      row.addEventListener("click", () => {
        close();
        setTimeout(games[row.dataset.game], 220);
      }),
    );
  });

  return section;
}
