import { asset, el } from "../lib/dom.js";
import { renderedScale } from "../lib/gesture.js";
import { animate, reducedMotion } from "../lib/motion.js";
import { earn } from "../lib/store.js";
import { flyCoin, openSheet, toast } from "./overlays.js";

const COIN = "screenshot-20260908-at-100950-am-1.png";

/** Scratch card: rub the foil away with a finger or the mouse to show the prize. */
export function openScratch() {
  const prize = 100;
  const card = el(`
    <div class="scratch">
      <div class="scratch__prize">
        <img src="${asset(COIN)}" alt="" />
        <strong>${prize} coins</strong>
        <span>Added to your balance</span>
      </div>
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
    if (!reducedMotion.matches) animate(card.querySelector(".scratch__prize"), { scale: [0.86, 1] }, { type: "spring", visualDuration: 0.5, bounce: 0.45 });
    flyCoin(card.querySelector(".scratch__prize img"), () => earn(prize, "Scratch card"));
    toast(`You won ${prize} coins`);
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

  openSheet({ eyebrow: "Scratch and claim", title: "First time travel", text: "Scratch the card to see what you have won.", content: card });
}

const SEGMENTS = [50, 10, 100, 20, 200, 10, 75, 500];

/** Spin the wheel: one tap spins to a prize and adds the coins. */
export function openSpin() {
  const wheel = el(`
    <div>
      <div class="wheel">
        <div class="wheel__disc">
          ${SEGMENTS.map((coins, index) => `<span class="wheel__label" style="transform:rotate(${index * 45}deg)">${coins}<small>coins</small></span>`).join("")}
        </div>
        <div class="wheel__hub"></div>
        <div class="wheel__pointer"></div>
      </div>
      <p class="wheel__result" role="status">Tap spin to try your luck</p>
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
        result.textContent = "Spinning…";
        const index = Math.floor(Math.random() * SEGMENTS.length);
        // Land the chosen segment under the pointer, after five full turns.
        const from = turns;
        turns = Math.ceil(turns / 360) * 360 + 360 * 5 + (360 - index * 45);
        await animate(disc, { rotate: [from, turns] }, reducedMotion.matches ? { duration: 0.01 } : { duration: 4.2, ease: [0.12, 0.8, 0.14, 1] });
        const coins = SEGMENTS[index];
        result.textContent = `You won ${coins} coins`;
        flyCoin(wheel.querySelector(".wheel__hub"), () => earn(coins, "Spin the wheel"));
        toast(`You won ${coins} coins`);
        button.textContent = "Spin again";
        button.disabled = false;
        spinning = false;
      },
    },
  });
}
