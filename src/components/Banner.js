import { asset, el } from "../lib/dom.js";
import { lockup } from "./Hero.js";
import { openSheet, toast } from "./overlays.js";

const clubLockup = lockup({ width: 110, height: 54.755, left: 18, top: 18, tag: "vector-2.svg", mark: "layer-2.svg", name: "group-1.svg" });

// The airtel insider logo from the top row of shortcuts, on its own, without the disc.
const insiderLogo = `<div class="banner__insider"><img src="${asset("insider-final-021.png")}" alt="airtel insider" /></div>`;

const art = (name, file) => `<div class="banner__art banner__art--${name}"><img src="${asset(file)}" alt="" /></div>`;

// The six "Proto banner" frames, in the order Figma lays them out in the carousel.
export const BANNERS = [
  {
    id: "zakir",
    kind: "club",
    brand: clubLockup,
    title: "Zakir Khan,<br />Live, Delhi",
    titleStyle: "top:85px;width:124px",
    art: art("zakir", "image.png"),
    artOverTitle: true,
    sub: "Free for members",
    subTop: 142.76,
    caption: "Register by 23 October",
    captionWidth: 86,
    action: "Register",
    buttonStyle: "left:173px",
    about: "An evening of stand-up with Zakir Khan, reserved for Advantage Club members. Two passes per postpaid number.",
    facts: [["Where", "Siri Fort Auditorium, Delhi"], ["When", "1 November, 7:30 pm"], ["Price", "Free for members"]],
  },
  {
    id: "adobe",
    kind: "dark",
    art: art("adobe", "image-2077.png"),
    brand: insiderLogo,
    title: "Adobe Express, free for 12 months",
    titleStyle: "top:71.94px;width:236px",
    caption: "Claim by 31 October",
    captionWidth: 163,
    action: "Claim",
    buttonStyle: "left:191px",
    about: "Design posts, reels and flyers with Adobe Express Premium, on the house for a year with Airtel Insider.",
    facts: [["Worth", "₹4,788"], ["Valid for", "12 months"], ["Claim by", "31 October"]],
  },
  {
    id: "duolingo",
    kind: "peach",
    art: art("duolingo", "image-1.png"),
    title: "3 Months of Duolingo Super",
    titleStyle: "top:69px;width:169px",
    brand: insiderLogo,
    caption: "Ends in 2 days",
    captionWidth: 163,
    action: "Claim",
    buttonStyle: "right:18px",
    about: "No ads, unlimited hearts and personalised practice. Three months of Duolingo Super for Insider members.",
    facts: [["Worth", "₹1,197"], ["Valid for", "3 months"], ["Offer ends", "In 2 days"]],
  },
  {
    id: "virdas",
    kind: "club",
    brand: clubLockup,
    art: art("virdas", "image-2076.png"),
    title: "Vir Das Live, Delhi",
    titleStyle: "top:91px;width:119px",
    sub: "Free for members",
    subTop: 152,
    caption: "Register by 16 October",
    captionWidth: 84,
    action: "Register",
    buttonStyle: "right:18px",
    about: "Vir Das brings his new hour to Delhi. Advantage Club members get in free, seats are drawn by ballot.",
    facts: [["Where", "Talkatora Stadium, Delhi"], ["When", "25 October, 8:00 pm"], ["Price", "Free for members"]],
  },
  {
    id: "googleone",
    kind: "dark",
    art: art("google", "image-2078.png"),
    brand: insiderLogo,
    title: "Google One, 100 GB for 6 months",
    titleStyle: "top:68px;width:236px",
    caption: "New this month",
    captionWidth: 163,
    action: "Claim",
    buttonStyle: "left:191px",
    about: "100 GB across Photos, Drive and Gmail for six months, shared with up to five family members.",
    facts: [["Worth", "₹780"], ["Valid for", "6 months"], ["Added", "This month"]],
  },
  {
    id: "mirzapur",
    kind: "club",
    brand: clubLockup,
    art: art("mirzapur", "image-2.png"),
    title: "Mirzapur: The Movie premiere",
    titleStyle: "top:84.76px;width:118px",
    caption: "Register by 18 October",
    captionWidth: 145,
    action: "Register",
    buttonStyle: "left:173px",
    about: "Watch Mirzapur: The Movie before release at a members-only premiere, with the cast in attendance.",
    facts: [["Where", "PVR Director's Cut, Delhi"], ["When", "20 October, 6:00 pm"], ["Price", "Free for members"]],
  },
];

const done = new Set(); // banners already registered for or claimed, shared by every copy
const copies = new Set();

function label(banner) {
  if (!done.has(banner.id)) return banner.action;
  return banner.action === "Register" ? "Registered ✓" : "Claimed ✓";
}

function sync() {
  copies.forEach(({ banner, button }) => {
    button.textContent = label(banner);
    button.setAttribute("aria-pressed", String(done.has(banner.id)));
    // Buttons pinned by their left edge in Figma grow to the left once the label is longer.
    if (banner.buttonStyle.startsWith("left") && done.has(banner.id)) button.style.cssText = "right:14px";
  });
}

function act(banner) {
  if (done.has(banner.id)) return;
  done.add(banner.id);
  sync();
  toast(banner.action === "Register" ? "You are registered. Passes arrive by SMS." : "Claimed. Check your SMS for the code.");
}

function openDetails(banner) {
  const plain = banner.title.replace("<br />", " ");
  openSheet({
    eyebrow: banner.kind === "club" ? "The Advantage Club" : "Airtel Insider",
    title: plain,
    text: banner.about,
    content: `<ul class="sheet__facts">${banner.facts.map(([key, value]) => `<li><span>${key}</span><strong>${value}</strong></li>`).join("")}</ul>`,
    cta: {
      label: label(banner),
      onClick(close, button) {
        act(banner);
        button.textContent = label(banner);
        button.disabled = true;
        setTimeout(close, 500);
      },
    },
  });
}

/** One 280 × 364 banner. The whole card opens its details; the button acts in place. */
export function Banner(banner) {
  const title = `<p class="banner__title" style="${banner.titleStyle}">${banner.title}</p>`;
  const node = el(`
    <article class="banner banner--${banner.kind}" data-banner="${banner.id}" tabindex="0">
      ${banner.artOverTitle ? "" : banner.art}
      ${banner.brand}
      ${title}
      ${banner.artOverTitle ? banner.art : ""}
      ${banner.sub ? `<p class="banner__sub" style="top:${banner.subTop}px">${banner.sub}</p>` : ""}
      <div class="banner__caption">
        <p style="width:${banner.captionWidth}px">${banner.caption}</p>
        <button class="banner__button pressable" type="button" style="${banner.buttonStyle}" data-press="0.95"></button>
      </div>
    </article>
  `);
  const button = node.querySelector(".banner__button");
  copies.add({ banner, button });
  sync();

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    act(banner);
  });
  node.addEventListener("click", () => openDetails(banner));
  node.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target === node) openDetails(banner);
  });
  return node;
}
