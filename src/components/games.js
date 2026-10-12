import { el } from "../lib/dom.js";
import { animate, reducedMotion } from "../lib/motion.js";
import { confetti, openSheet, toast } from "./overlays.js";

const code = () => `AIR-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

/** A won voucher, drawn as a ticket with its code on the stub. */
function voucher({ title, text }) {
  return `
    <div class="voucher">
      <div class="voucher__main">
        <p class="voucher__eyebrow">You won</p>
        <p class="voucher__title">${title}</p>
        <p class="voucher__text">${text}</p>
      </div>
      <div class="voucher__stub"><span>Code</span><strong>${code()}</strong></div>
    </div>`;
}

const pop = (node) => !reducedMotion.matches && animate(node, { opacity: [0, 1], scale: [0.8, 1], y: [14, 0] }, { type: "spring", visualDuration: 0.45, bounce: 0.4 });

/** Scratch card: rub the foil away with a finger or the mouse to show the voucher under it. */
export function openScratch() {
  const prize = { title: "₹50 cashback", text: "On your next recharge of ₹299 or more" };
  const card = el(`
    <div class="scratch">
      <div class="scratch__prize">${voucher(prize)}</div>
      <canvas width="670" height="380" aria-label="Scratch here"></canvas>
    </div>
  `);
  const canvas = card.querySelector("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  // Foil: a brushed silver gradient with a hint to scratch.
  const foil = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  foil.addColorStop(0, "#8f8f96");
  foil.addColorStop(0.35, "#e9e9ee");
  foil.addColorStop(0.55, "#a9a9b1");
  foil.addColorStop(0.8, "#f4f4f7");
  foil.addColorStop(1, "#8b8b93");
  context.fillStyle = foil;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(0,0,0,0.5)";
  context.font = "italic 900 44px Inter, sans-serif";
  context.textAlign = "center";
  context.fillText("SCRATCH HERE", canvas.width / 2, canvas.height / 2 + 14);
  context.globalCompositeOperation = "destination-out";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 76;

  let last = null;
  let moves = 0;
  let revealed = false;

  function point(event) {
    const box = canvas.getBoundingClientRect();
    return { x: ((event.clientX - box.left) / box.width) * canvas.width, y: ((event.clientY - box.top) / box.height) * canvas.height };
  }

  function cleared() {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0;
    for (let i = 3; i < pixels.length; i += 4 * 40) if (pixels[i] === 0) clear += 1;
    return clear / (pixels.length / (4 * 40));
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    card.classList.add("is-revealed");
    pop(card.querySelector(".voucher"));
    confetti(card);
    toast("Voucher saved to My Rewards");
  }

  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    last = point(event);
    context.beginPath();
    context.arc(last.x, last.y, 38, 0, Math.PI * 2);
    context.fill();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!last) return;
    const next = point(event);
    context.beginPath();
    context.moveTo(last.x, last.y);
    context.lineTo(next.x, next.y);
    context.stroke();
    last = next;
    moves += 1;
    if (moves % 8 === 0 && cleared() > 0.45) reveal();
  });
  ["pointerup", "pointercancel"].forEach((type) =>
    canvas.addEventListener(type, () => {
      last = null;
      if (cleared() > 0.45) reveal();
    }),
  );

  openSheet({ eyebrow: "Scratch and claim", title: "Scratch and win", text: "Scratch the card to see what you have won.", content: card });
}

// What each slice of the wheel says, and the voucher it gives.
const SEGMENTS = [
  { big: "₹50", small: "off", title: "₹50 off", text: "On your next recharge of ₹299 or more" },
  { big: "1 GB", small: "data", title: "1 GB of data", text: "Added to your pack, valid for 3 days" },
  { big: "₹100", small: "cashback", title: "₹100 cashback", text: "On your next bill payment" },
  { big: "OTT", small: "1 month", title: "1 month of Xstream Play", text: "22 apps in one, on us" },
  { big: "₹25", small: "off", title: "₹25 off", text: "On any recharge" },
  { big: "2 GB", small: "data", title: "2 GB of data", text: "Added to your pack, valid for 7 days" },
  { big: "₹200", small: "voucher", title: "₹200 shopping voucher", text: "With Airtel Insider partners" },
  { big: "BOGO", small: "tickets", title: "Buy one, get one", text: "On movie tickets this weekend" },
];

/** Spin the wheel: one tap spins to a slice and hands over its voucher. */
export function openSpin() {
  const wheel = el(`
    <div>
      <div class="wheel">
        <div class="wheel__disc">
          ${SEGMENTS.map((segment, index) => `<span class="wheel__label" style="transform:rotate(${index * 45}deg)">${segment.big}<small>${segment.small}</small></span>`).join("")}
        </div>
        <div class="wheel__hub"></div>
        <div class="wheel__pointer"></div>
      </div>
      <div class="wheel__result" role="status"><p>Tap spin to try your luck</p></div>
    </div>
  `);
  const disc = wheel.querySelector(".wheel__disc");
  const result = wheel.querySelector(".wheel__result");
  let turns = 0;
  let spinning = false;

  openSheet({
    eyebrow: "Spin and win",
    title: "Spin the wheel",
    content: wheel,
    cta: {
      label: "Spin",
      async onClick(close, button) {
        if (spinning) return;
        spinning = true;
        button.disabled = true;
        result.innerHTML = "<p>Spinning…</p>";
        const index = Math.floor(Math.random() * SEGMENTS.length);
        // Land the chosen slice under the pointer, after five full turns.
        const from = turns;
        turns = Math.ceil(turns / 360) * 360 + 360 * 5 + (360 - index * 45);
        await animate(disc, { rotate: [from, turns] }, reducedMotion.matches ? { duration: 0.01 } : { duration: 4.2, ease: [0.12, 0.8, 0.14, 1] });
        result.innerHTML = voucher(SEGMENTS[index]);
        pop(result.firstElementChild);
        result.scrollIntoView({ behavior: "smooth", block: "nearest" });
        confetti(wheel.querySelector(".wheel__hub"));
        toast("Voucher saved to My Rewards");
        button.textContent = "Spin again";
        button.disabled = false;
        spinning = false;
      },
    },
  });
}
