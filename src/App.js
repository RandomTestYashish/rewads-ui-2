import { PhoneFrame } from "./components/PhoneFrame.js";
import { TopBar } from "./components/TopBar.js";
import { Hero } from "./components/Hero.js";
import { Unclaimed } from "./components/Unclaimed.js";
import { WhatsNew } from "./components/WhatsNew.js";
import { PlayAndWin } from "./components/PlayAndWin.js";
import { Subscriptions } from "./components/Subscriptions.js";
import { PlanBenefits } from "./components/PlanBenefits.js";
import { Insider } from "./components/Insider.js";
import { Club } from "./components/Club.js";
import { ComingSoon } from "./components/ComingSoon.js";
import { Questions } from "./components/Questions.js";
import { openSpin } from "./components/games.js";
import { Option2, Option2Floating } from "./components/Option2.js";
import { setOverlayHost } from "./components/overlays.js";
import { applyTheme, el } from "./lib/dom.js";
import { enableDragScroll } from "./lib/dragScroll.js";
import { animate, reducedMotion } from "./lib/motion.js";
import { enablePressFeedback } from "./lib/press.js";

const THEMES = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
];

// Children that come in one after another when their section is revealed.
const STAGGERED = ".play-card, .pill, .plan-row, .logo-strip, .faq__item, .o2-tile, .o2-spot, .o2-poster, .o2-pick, .o2-promo";

// Where each shortcut at the top of the page leads.
const SHORTCUT_TARGETS = { ott: "#subscriptions", insider: "#insider", club: "#club" };

export function App() {
  const { stage, screen } = PhoneFrame();
  setOverlayHost(screen);

  const page = el(`<div class="page scroll-y"><div class="page__content"></div></div>`);
  const content = page.firstElementChild;

  function scrollToSection(selector) {
    const target = content.querySelector(selector);
    const top = target.offsetTop - (screen.querySelector(".topbar").offsetHeight + 12);
    page.scrollTo({ top, behavior: reducedMotion.matches ? "auto" : "smooth" });
  }

  const option = new URLSearchParams(location.search).get("option") === "2" ? "2" : "1";
  screen.dataset.option = option;

  if (option === "2") {
    content.append(...Option2({ scrollToSection }));
  } else {
    content.append(
      Hero({
        onShortcut(id) {
          if (id === "spin") openSpin();
          else scrollToSection(SHORTCUT_TARGETS[id]);
        },
      }),
      Unclaimed(),
      WhatsNew(),
      PlayAndWin(),
      Subscriptions(),
      PlanBenefits(),
      Insider(),
      Club(),
      ComingSoon(),
      Questions(),
    );
  }
  screen.prepend(page, TopBar(screen));

  // The header turns to glass once content is scrolling beneath it, and the large
  // Advantage Club portrait drifts a little against its card as the page moves.
  const portrait = content.querySelector(".club .banner__art");
  const club = content.querySelector(".club");
  const floating = option === "2" ? Option2Floating({ screen, page, scrollToSection }) : null;
  page.addEventListener(
    "scroll",
    () => {
      screen.dataset.scrolled = String(page.scrollTop > 8);
      if (reducedMotion.matches || !club) return;
      const offset = (club.offsetTop - page.scrollTop - 200) / 600; // about -1 to 1 across the screen
      portrait.style.transform = `translateY(${Math.max(-1, Math.min(1, offset)) * 12}px) scale(1.04)`;
    },
    { passive: true },
  );

  // Sections fade up the first time they come into view.
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
        // Rows and cards inside the section follow it in, one after another.
        if (!reducedMotion.matches) {
          entry.target.querySelectorAll(STAGGERED).forEach((item, index) =>
            animate(item, { opacity: [0, 1], y: [14, 0] }, { duration: 0.34, delay: 0.08 + index * 0.05, ease: [0.22, 1, 0.36, 1] }),
          );
        }
      }),
    { root: page, rootMargin: "0px 0px -6% 0px" },
  );
  content.querySelectorAll(".reveal").forEach((section) => observer.observe(section));

  // The two Figma frames, switchable from the stage (or `?theme=light`).
  const requested = new URLSearchParams(location.search).get("theme");
  const switcher = el(`
    <div class="theme-switch" role="group" aria-label="Theme">
      ${THEMES.map((theme) => `<button class="theme-switch__button" type="button" data-theme-id="${theme.id}">${theme.label}</button>`).join("")}
    </div>
  `);
  function setTheme(theme) {
    applyTheme(screen, theme);
    switcher.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.themeId === theme)));
    const url = new URL(location.href);
    url.searchParams.set("theme", theme);
    history.replaceState(null, "", url);
  }
  switcher.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-id]");
    if (button) setTheme(button.dataset.themeId);
  });
  // Two layouts of the same page; switching reloads with the choice in the address.
  const options = el(`
    <div class="theme-switch option-switch" role="group" aria-label="Layout">
      <button class="theme-switch__button" type="button" data-option-id="1" aria-pressed="${option === "1"}">Option 1</button>
      <button class="theme-switch__button" type="button" data-option-id="2" aria-pressed="${option === "2"}">Option 2</button>
    </div>
  `);
  options.addEventListener("click", (event) => {
    const button = event.target.closest("[data-option-id]");
    if (!button || button.dataset.optionId === option) return;
    const url = new URL(location.href);
    url.searchParams.set("option", button.dataset.optionId);
    location.href = url;
  });
  stage.append(options, switcher);
  if (floating) screen.append(...floating);
  setTheme(requested === "light" ? "light" : "dark");

  enablePressFeedback(screen);
  enableDragScroll(page);

  return stage;
}
