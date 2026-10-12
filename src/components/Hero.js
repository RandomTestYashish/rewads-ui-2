import { asset, el, themed } from "../lib/dom.js";
import { animate, reducedMotion, transition } from "../lib/motion.js";

/** The Advantage Club lockup: wordmark, airtel mark and the "Delhi Edition" tag. */
export function lockup({ width, height, left, top, tag, mark, name, variant = "" }) {
  return `
    <div class="lockup ${variant}" style="--lockup-w:${width}px;left:${left}px;top:${top}px;width:${width}px;height:${height}px">
      <div class="lockup__tag"><img src="${asset(tag)}" alt="" /></div>
      <p class="lockup__edition">Delhi Edition</p>
      <div class="lockup__mark"><img src="${asset(mark)}" alt="" /></div>
      <div class="lockup__name"><img src="${asset(name)}" alt="" /></div>
    </div>`;
}

const SHORTCUTS = [
  {
    id: "ott",
    label: "OTT",
    x: 52,
    // Netflix is the logo drawn in Figma; the disc then rolls through the other OTT apps.
    art: `
      <img class="shortcut__netflix" data-ott src="${asset("netflix-logo-icon-1709191.png")}" alt="" />
      <img class="shortcut__prime" data-ott src="${asset("ott-prime.svg")}" alt="" />
      <img class="shortcut__xstream" data-ott src="${asset("logo.png")}" alt="" />`,
  },
  {
    id: "insider",
    label: "Insider",
    x: 140,
    art: `<div class="shortcut__insider"><img src="${asset("insider-final-021.png")}" alt="" /></div>`,
  },
  {
    id: "club",
    label: "Advantage Club",
    x: 233,
    art: lockup({
      width: 54.5,
      height: 27.183,
      left: 6.89,
      top: 20.83,
      tag: "vector.svg",
      mark: "layer-1.svg",
      name: "group.svg",
      variant: "lockup--shortcut",
    }),
  },
  {
    id: "spin",
    label: "Spin the wheel",
    x: 327.5,
    art: `<img class="shortcut__wheel" src="${asset("group-1597881919.svg")}" alt="" />`,
  },
];

/** Top of the page: the soft glow behind the header and the four round shortcuts. */
export function Hero({ onShortcut }) {
  const hero = el(`
    <section class="hero">
      <div class="hero__glow">${themed("ellipse-1.svg")}</div>
      <nav class="shortcuts" aria-label="Rewards shortcuts">
        ${SHORTCUTS.map(
          (item) => `
            <button class="shortcut" type="button" style="left:${item.x}px" data-shortcut="${item.id}" data-press="0.92">
              <span class="shortcut__disc" data-press-target>${item.art}</span>
              <span class="shortcut__label">${item.label}</span>
            </button>`,
        ).join("")}
      </nav>
    </section>
  `);

  hero.querySelectorAll(".shortcut").forEach((button, index) => {
    button.addEventListener("click", () => onShortcut(button.dataset.shortcut));
    if (reducedMotion.matches) return;
    // The discs land one after another on load.
    const disc = button.querySelector(".shortcut__disc");
    animate(disc, { scale: [0.6, 1], opacity: [0, 1] }, { ...transition("pop"), delay: 0.12 + index * 0.07 });
    animate(button.querySelector(".shortcut__label"), { opacity: [0, 1], y: [6, 0] }, { duration: 0.4, delay: 0.24 + index * 0.07 });
  });

  cycleLogos([...hero.querySelectorAll("[data-ott]")]);

  return hero;
}

const OTT_HOLD = 2200; // how long each logo rests in the disc

/** Rolls the OTT disc through its logos: the current one leaves upwards as the next rises in. */
function cycleLogos(logos) {
  logos.slice(1).forEach((logo) => (logo.style.opacity = 0));
  if (reducedMotion.matches) return;
  let current = 0;
  setInterval(() => {
    if (document.hidden) return;
    const next = (current + 1) % logos.length;
    animate(logos[current], { y: [0, -26], scale: [1, 0.7], opacity: [1, 0] }, { duration: 0.32, ease: [0.4, 0, 1, 1] });
    animate(logos[next], { y: [26, 0], scale: [0.7, 1], opacity: [0, 1] }, { ...transition("pop"), delay: 0.12 });
    current = next;
  }, OTT_HOLD);
}
