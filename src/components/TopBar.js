import { asset, el, themed } from "../lib/dom.js";
import { animate, reducedMotion, transition } from "../lib/motion.js";
import { START_BALANCE, state, subscribe } from "../lib/store.js";
import { openSheet, toast } from "./overlays.js";

const format = (value) => Math.round(value).toLocaleString("en-IN");

/** Status bar, back button, title and the coin balance, fixed over the scrolling page. */
export function TopBar(screen) {
  const bar = el(`
    <header class="topbar">
      <div class="topbar__glass"></div>
      <div class="status-bar" aria-hidden="true">
        <div class="status-bar__battery">${themed("battery.svg")}</div>
        <div class="status-bar__wifi">${themed("wifi.svg")}</div>
        <div class="status-bar__cell">${themed("cellular-connection.svg")}</div>
        <div class="status-bar__time">${themed("941.svg")}</div>
      </div>
      <button class="topbar__back pressable" type="button" aria-label="Back" data-press="0.9">
        <img class="topbar__back-ring only-dark" src="${asset("header-icon-dark-icon.svg")}" alt="" />
        <img class="topbar__back-arrow only-dark" src="${asset("live-container.svg")}" alt="" />
        <img class="topbar__back-caret only-light" src="${asset("light/ph-regular-caret-left.svg")}" alt="" />
      </button>
      <div class="topbar__title">
        <strong>My Rewards</strong>
        <span>9716317865</span>
      </div>
      <button class="points pressable" type="button" aria-label="Coins balance" data-press="0.94">
        <img src="${asset("light/point-shiny-front.png")}" alt="" />
        <span class="only-dark" data-balance="dark"></span>
        <span class="only-light" data-balance="light"></span>
      </button>
    </header>
  `);

  const outputs = [...bar.querySelectorAll("[data-balance]")];
  let shown = state.earned;

  function render(earned) {
    outputs.forEach((output) => (output.textContent = format(START_BALANCE[output.dataset.balance] + earned)));
  }
  render(shown);

  // Count up to the new balance, and give the badge a small pulse as the coin lands.
  subscribe((change) => {
    if (change.type !== "earn") return;
    const from = shown;
    const to = state.earned;
    shown = to;
    const started = performance.now();
    const duration = reducedMotion.matches ? 1 : 700;
    (function tick(now) {
      const progress = Math.min(1, (now - started) / duration);
      render(from + (to - from) * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(tick);
    })(started);
    animate(bar.querySelector(".points"), { scale: [1, 1.14, 1] }, transition("pop"));
  });

  function openBalance() {
    const light = screen.dataset.theme === "light";
    const rows = state.history.length
      ? state.history
          .map(
            (entry) => `
              <div class="sheet-row">
                <div class="sheet-row__text">
                  <p class="sheet-row__name">${entry.label}</p>
                  <p class="sheet-row__sub">Just now</p>
                </div>
                <span class="sheet-row__value">+${entry.coins}</span>
              </div>`,
          )
          .join("")
      : `<p class="sheet__text">Claim a reward, scratch a card or spin the wheel to earn coins.</p>`;
    openSheet({
      eyebrow: "Airtel coins",
      title: "Your balance",
      content: `
        <div class="balance">
          <img src="${asset("light/point-shiny-front.png")}" alt="" />
          <strong>${format(START_BALANCE[light ? "light" : "dark"] + state.earned)}</strong>
        </div>
        <div class="sheet-list">${rows}</div>`,
    });
  }

  bar.querySelector(".points").addEventListener("click", openBalance);
  bar.querySelector(".topbar__back").addEventListener("click", () => toast("This prototype starts at My Rewards"));

  return bar;
}
