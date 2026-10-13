import { asset, el } from "../lib/dom.js";
import { renderedScale } from "../lib/gesture.js";
import { icons } from "../lib/icons.js";
import { animate, reducedMotion, transition } from "../lib/motion.js";
import { STATUS, getPartner, onPartnerChange, planOf, request, updatePartner } from "../lib/partners.js";
import { overlayHost, toast } from "./overlays.js";

const logo = (partner) => `<span class="pp-logo ${partner.inset ? "pp-logo--inset" : ""}"><img src="${asset(partner.logo)}" alt="" /></span>`;
const chip = (partner) => `<span class="pp-chip" data-tone="${STATUS[partner.status][1]}">${STATUS[partner.status][0]}</span>`;

/**
 * Manage: Airtel's white bottom sheet over the partner's PDP. Opens at a little over half
 * the screen and grows to nearly full when more is shown. Change Plan and the account
 * details open inside it; cancelling asks for confirmation in a dialog on top.
 */
export function openManage(id) {
  const host = overlayHost();
  const layer = el(`
    <div class="msheet" role="dialog" aria-modal="true">
      <div class="msheet__scrim"></div>
      <div class="msheet__panel">
        <button class="msheet__grab" type="button" aria-label="Expand or collapse"><i></i></button>
        <div class="msheet__body"></div>
      </div>
    </div>
  `);
  const panel = layer.querySelector(".msheet__panel");
  const body = layer.querySelector(".msheet__body");
  const view = { open: null, picked: null, confirming: false, busy: false, done: null, expanded: false };

  function setExpanded(expanded) {
    view.expanded = expanded;
    layer.classList.toggle("is-expanded", expanded);
  }

  function planBlock(partner) {
    const current = planOf(partner);
    const picked = partner.plans.find((plan) => plan.id === view.picked);
    if (view.done) return `<div class="msheet__note" data-tone="good">${icons.arrow}<p><strong>You are now on ${current.name}.</strong> The change is confirmed and applies from today.</p></div>`;
    if (view.confirming && picked) {
      return `
        <div class="msheet__confirm">
          <p class="msheet__label">Confirm your upgrade</p>
          <ul class="msheet__facts">
            <li><span>Current plan</span><strong>${current.name}</strong></li>
            <li><span>New plan</span><strong>${picked.name}</strong></li>
            <li><span>Added to your bill</span><strong>+₹${picked.delta} a month</strong></li>
            <li><span>Starts</span><strong>Today</strong></li>
          </ul>
          <button class="msheet__cta" type="button" data-act="confirm-upgrade" ${view.busy ? "disabled" : ""}>${view.busy ? "Confirming…" : "Confirm Upgrade"}</button>
          <button class="msheet__ghost" type="button" data-act="back" ${view.busy ? "disabled" : ""}>Go Back</button>
        </div>`;
    }
    return `
      <div class="msheet__plans">
        <p class="msheet__label">Change your plan</p>
        ${partner.plans
          .map(
            (plan) => `
              <button class="msheet__plan" type="button" data-plan="${plan.id}" aria-pressed="${plan.id === (view.picked ?? current.id)}">
                <i></i>
                <span><strong>${plan.name}</strong><small>${plan.perks.join(" · ")}</small></span>
                <em>${plan.id === current.id ? "You’re on this plan" : `+₹${plan.delta - current.delta}`}</em>
              </button>`,
          )
          .join("")}
        ${picked && picked.id !== current.id ? `<button class="msheet__cta" type="button" data-act="upgrade">${picked.delta > current.delta ? "Upgrade" : "Switch"} to ${picked.name.replace(partner.name + " ", "")}</button>` : ""}
      </div>`;
  }

  function render() {
    const partner = getPartner(id);
    const plan = planOf(partner);
    const cancelling = partner.status === "cancelling";
    const actions = [
      partner.supports.changePlan && partner.plans.length > 1 && !cancelling && ["plan", "Change Plan", "Move to a different " + partner.name + " plan"],
      partner.supports.account && partner.account && ["account", "Manage Account", partner.account],
      ["details", "View Details", "Activation, eligibility and terms"],
      partner.supports.cancel && !cancelling && ["cancel", "Cancel Benefit", "Keeps working until " + partner.validTill],
    ].filter(Boolean);

    body.innerHTML = `
      <header class="msheet__head">
        ${logo(partner)}
        <div><h2>${partner.name}</h2><p>${plan.name}</p></div>
        ${chip(partner)}
      </header>
      <p class="msheet__valid">${cancelling ? "Access ends on" : "Valid till"} <strong>${partner.validTill}</strong></p>
      ${partner.status === "expiring" ? `<div class="msheet__note" data-tone="warn"><p><strong>Expiring soon.</strong> Recharge before ${partner.validTill} to keep ${partner.name}.</p></div>` : ""}
      ${cancelling ? `<div class="msheet__note" data-tone="warn"><p><strong>Cancellation scheduled.</strong> You can keep using ${partner.name} until ${partner.validTill}.</p></div>` : ""}
      <p class="msheet__label">Your benefits</p>
      <ul class="msheet__perks">${plan.perks.map((perk) => `<li>${perk}</li>`).join("")}</ul>
      <p class="msheet__label">Manage your ${partner.name}</p>
      <div class="msheet__actions">
        ${actions
          .map(
            ([key, title, sub]) => `
              <button class="msheet__action" type="button" data-open="${key}" data-danger="${key === "cancel"}" aria-expanded="${view.open === key}">
                <span><strong>${title}</strong><small>${sub}</small></span>${icons.chevron}
              </button>
              ${view.open === key && key === "plan" ? planBlock(partner) : ""}
              ${view.open === key && key === "account" ? `<div class="msheet__inline"><ul class="msheet__facts"><li><span>Connected account</span><strong>${partner.account}</strong></li><li><span>Linked number</span><strong>9716317865</strong></li></ul><button class="msheet__ghost" type="button" data-act="change-account">Change Account</button></div>` : ""}
              ${view.open === key && key === "details" ? `<div class="msheet__inline"><ul class="msheet__facts"><li><span>Activated on</span><strong>${partner.activatedOn ?? "—"}</strong></li><li><span>Eligibility</span><strong>Postpaid ₹399 and above</strong></li><li><span>Billed through</span><strong>Airtel</strong></li></ul><p class="msheet__terms">The benefit stays active while your Airtel plan is active. Partner terms apply. One benefit per Airtel number.</p></div>` : ""}`,
          )
          .join("")}
      </div>
      <p class="msheet__mock">Prototype data · no real plan or payment is changed</p>`;
  }

  function close() {
    stop();
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    animate(layer.querySelector(".msheet__scrim"), { opacity: 0 }, transition("sheetOut"));
    animate(panel, { y: "100%" }, transition("sheetOut")).then(() => layer.remove());
  }

  function confirmCancel() {
    const partner = getPartner(id);
    const modal = el(`
      <div class="mmodal" role="alertdialog" aria-modal="true">
        <div class="mmodal__box">
          <h3>Are you sure you want to cancel this subscription?</h3>
          <p>Your benefit will remain active until <strong>${partner.validTill}</strong>. After that you will no longer be able to use ${partner.name} through your Airtel benefit.</p>
          <button class="msheet__cta" type="button" data-keep>Keep Subscription</button>
          <button class="msheet__ghost msheet__ghost--danger" type="button" data-confirm>Confirm Cancellation</button>
          <p class="mmodal__error" hidden>That did not go through. Please try again.</p>
        </div>
      </div>
    `);
    const dismiss = () => animate(modal, { opacity: 0 }, { duration: 0.18 }).then(() => modal.remove());
    modal.querySelector("[data-keep]").addEventListener("click", dismiss);
    modal.querySelector("[data-confirm]").addEventListener("click", async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = "Cancelling…";
      try {
        await request();
        updatePartner(id, { status: "cancelling" });
        view.open = null;
        dismiss();
        toast(`${partner.name} will end on ${partner.validTill}`);
      } catch {
        button.disabled = false;
        button.textContent = "Confirm Cancellation";
        modal.querySelector(".mmodal__error").hidden = false;
      }
    });
    layer.append(modal);
    animate(modal, { opacity: [0, 1] }, { duration: 0.2 });
    animate(modal.firstElementChild, { scale: [0.92, 1], y: [12, 0] }, transition("sheetIn"));
  }

  body.addEventListener("click", async (event) => {
    const open = event.target.closest("[data-open]");
    const plan = event.target.closest("[data-plan]");
    const act = event.target.closest("[data-act]")?.dataset.act;
    if (open) {
      if (open.dataset.open === "cancel") return confirmCancel();
      view.open = view.open === open.dataset.open ? null : open.dataset.open;
      Object.assign(view, { picked: null, confirming: false, done: null });
      if (view.open) setExpanded(true);
      render();
      requestAnimationFrame(() => body.querySelector(`[data-open="${view.open}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } else if (plan) {
      view.picked = plan.dataset.plan;
      render();
    } else if (act === "upgrade") {
      view.confirming = true;
      render();
    } else if (act === "back") {
      view.confirming = false;
      render();
    } else if (act === "confirm-upgrade") {
      view.busy = true;
      render();
      try {
        await request();
        view.done = true;
        updatePartner(id, { planId: view.picked });
        toast("Plan updated");
      } catch {
        toast("That did not go through. Please try again.");
      }
      Object.assign(view, { busy: false, confirming: false, picked: null });
      render();
    } else if (act === "change-account") {
      toast("Opens the partner’s sign-in in the real app");
    }
  });

  // Drag the sheet by its handle: up to expand, down to collapse, further down to close.
  let drag = null;
  const grab = layer.querySelector(".msheet__grab");
  function onMove(event) {
    if (drag) drag.dy = (event.clientY - drag.y) / drag.scale;
  }
  function onUp() {
    if (!drag) return;
    const { dy } = drag;
    drag = null;
    if (Math.abs(dy) < 6) setExpanded(!view.expanded);
    else if (dy < -24) setExpanded(true);
    else if (dy > 24 && view.expanded) setExpanded(false);
    else if (dy > 24) close();
  }
  grab.addEventListener("pointerdown", (event) => (drag = { y: event.clientY, dy: 0, scale: renderedScale(panel) }));
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  layer.querySelector(".msheet__scrim").addEventListener("click", close);

  const stop = onPartnerChange((partner) => partner.id === id && render());
  render();
  host.append(layer);
  animate(layer.querySelector(".msheet__scrim"), { opacity: [0, 1] }, transition("scrim"));
  animate(panel, { y: ["100%", "0%"] }, reducedMotion.matches ? { duration: 0.01 } : transition("sheetIn"));
}
