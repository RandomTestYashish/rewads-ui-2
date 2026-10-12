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

/**
 * Story ring: a gold-to-red stroke just outside the disc. `-draw` is the full ring, drawn
 * on load and on tap; `-comet` is the bright arc that keeps circling it.
 */
function ring(id) {
  return `
    <svg class="shortcut__ring" viewBox="0 0 80 80" aria-hidden="true">
      <defs>
        <linearGradient id="ring-${id}" gradientUnits="userSpaceOnUse" x1="6" y1="6" x2="74" y2="74">
          <stop offset="0" stop-color="#ffe550" />
          <stop offset="0.5" stop-color="#ffaa50" />
          <stop offset="1" stop-color="#e10203" />
        </linearGradient>
      </defs>
      <circle class="shortcut__ring-draw" cx="40" cy="40" r="38.5" pathLength="100" stroke="url(#ring-${id})" />
      <circle class="shortcut__ring-comet" cx="40" cy="40" r="38.5" pathLength="100" stroke="url(#ring-${id})" />
    </svg>`;
}

/** Top of the page: the soft glow behind the header and the four round shortcuts. */
export function Hero({ onShortcut }) {
  const hero = el(`
    <section class="hero">
      <div class="hero__glow">${themed("ellipse-1.svg")}</div>
      <nav class="shortcuts" aria-label="Rewards shortcuts">
        ${SHORTCUTS.map(
          (item) => `
            <button class="shortcut" type="button" style="left:${item.x}px" data-shortcut="${item.id}" data-press="0.92">
              <span class="shortcut__orb" data-press-target>
                <span class="shortcut__disc">${item.art}</span>
                ${ring(item.id)}
              </span>
              <span class="shortcut__label">${item.label}</span>
            </button>`,
        ).join("")}
      </nav>
    </section>
  `);

  hero.querySelectorAll(".shortcut").forEach((button, index) => {
    const stroke = button.querySelector(".shortcut__ring-draw");
    const draw = (delay = 0) => animate(stroke, { strokeDashoffset: [100, 0] }, { duration: 0.9, delay, ease: [0.65, 0, 0.35, 1] });

    button.addEventListener("click", () => {
      if (!reducedMotion.matches) draw(); // the ring redraws on a tap, as a story ring does
      onShortcut(button.dataset.shortcut);
    });
    if (reducedMotion.matches) return;

    // The discs land one after another on load, each ring drawing itself around its disc.
    const delay = 0.12 + index * 0.09;
    animate(button.querySelector(".shortcut__disc"), { scale: [0.6, 1], opacity: [0, 1] }, { ...transition("pop"), delay });
    animate(button.querySelector(".shortcut__label"), { opacity: [0, 1], y: [6, 0] }, { duration: 0.4, delay: delay + 0.12 });
    draw(delay + 0.1);
    button.querySelector(".shortcut__ring-comet").style.animationDelay = `${1.2 + index * 0.35}s`;
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
