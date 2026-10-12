import { asset, el } from "../lib/dom.js";
import { icons } from "../lib/icons.js";
import { wheelIcon } from "../lib/wheel.js";
import { openScratch, openSpin } from "./games.js";
import { openSheet } from "./overlays.js";

/** Section heading: the title, its line of support, and "View all". */
export function sectionHead({ title, sub, all = false }) {
  return `
    <header class="sec-head">
      <div class="sec-head__text">
        <h2 class="sec-head__title">${title}</h2>
        <p class="sec-head__sub">${sub}</p>
      </div>
      ${all ? `<button class="sec-head__all pressable" type="button">View all</button>` : ""}
    </header>`;
}

/** Two games: the scratch card and the spin wheel. */
export function PlayAndWin() {
  const section = el(`
    <section class="play reveal" id="play">
      ${sectionHead({ title: "Play And win", sub: "Unlock exclusive offers and rewards.", all: true })}
      <div class="play__cards">
        <button class="play-card play-card--scratch" type="button" data-game="scratch" data-press="0.96">
          <span class="play-card__beam"></span>
          <span class="play-card__rays"></span>
          <span class="play-card__word play-card__word--glow" aria-hidden="true">Scratch<br />and win</span>
          <span class="play-card__word play-card__word--top">Scratch<br />and win</span>
          <span class="play-card__label">Scratch and Claim${icons.caret}</span>
          <span class="play-card__shine"></span>
          <i class="play-card__star" style="left:20px;top:44px">${icons.sparkle}</i>
          <i class="play-card__star" style="left:132px;top:118px;width:10px;animation-delay:-1.1s">${icons.sparkle}</i>
        </button>
        <button class="play-card play-card--spin" type="button" data-game="spin" data-press="0.96">
          <span class="play-card__beam"></span>
          <span class="play-card__rays"></span>
          <span class="play-card__halo"></span>
          ${wheelIcon("play-card__wheel")}
          <span class="play-card__label">Spin and win${icons.caret}</span>
          <span class="play-card__shine" style="animation-delay:-1.6s"></span>
          <i class="play-card__star" style="left:128px;top:40px;width:10px;animation-delay:-0.6s">${icons.sparkle}</i>
          <i class="play-card__star" style="left:22px;top:122px;animation-delay:-1.7s">${icons.sparkle}</i>
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
          <div class="sheet-row__text"><p class="sheet-row__name">Scratch and Claim</p><p class="sheet-row__sub">Scratch the foil to reveal a voucher</p></div>
          <span class="sheet-row__action">Play</span>
        </button>
        <button class="sheet-row pressable" type="button" data-game="spin">
          <div class="sheet-row__text"><p class="sheet-row__name">Spin and win</p><p class="sheet-row__sub">Spin for a voucher: data, cashback and more</p></div>
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
