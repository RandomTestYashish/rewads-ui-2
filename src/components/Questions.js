import { el, themed } from "../lib/dom.js";
import { openSheet } from "./overlays.js";

const QUESTIONS = [
  ["How claiming works", "Tap Claim Now on a reward and it is linked to your Airtel number straight away. Most rewards switch on within a few minutes, and you get an SMS when they do."],
  ["Rewards that have not switched on", "Some partners take up to 24 hours to activate. If a reward still shows as pending after that, claim it again from View all or reach us on Airtel Thanks help."],
  ["How Advantage Club draws work", "Register before the closing date shown on the banner. Seats are drawn at random from all registered postpaid members, and winners are told by SMS two days before the event."],
  ["Rewards across your numbers", "Rewards belong to the number that earned them. Switch numbers from the top of Airtel Thanks to see and claim what each one has."],
];

/** Questions: one answer open at a time. The last row leads to the terms. */
export function Questions() {
  const section = el(`
    <section class="faq reveal" id="questions">
      <h2 class="faq__heading">Questions</h2>
      ${QUESTIONS.map(
        ([question, answer], index) => `
          <div class="faq__item">
            <button class="faq__q" type="button" aria-expanded="false" aria-controls="faq-${index}">
              <span>${question}</span>
              ${themed("ph-regular-caret-down.svg")}
            </button>
            <div class="faq__a" id="faq-${index}"><div><p>${answer}</p></div></div>
          </div>`,
      ).join("")}
      <div class="faq__item">
        <button class="faq__q" type="button" data-terms>
          <span>Terms and conditions</span>
          ${themed("ph-regular-caret-right-1.svg")}
        </button>
      </div>
    </section>
  `);

  const buttons = [...section.querySelectorAll("[aria-expanded]")];
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      buttons.forEach((other) => other.setAttribute("aria-expanded", String(other === button && open)));
    }),
  );

  section.querySelector("[data-terms]").addEventListener("click", () =>
    openSheet({
      eyebrow: "My Rewards",
      title: "Terms and conditions",
      text: "Rewards are offered to active Airtel customers and depend on your current plan. Each reward can be claimed once per number and must be claimed before the date shown on it. Partner subscriptions are governed by the partner’s own terms. Airtel coins have no cash value and expire 12 months after they are earned.",
    }),
  );

  return section;
}
