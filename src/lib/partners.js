/*
 * Partner benefits: the single source of truth for Active Services, the Discovery PDP,
 * Claim, Manage and the swipe between partners.
 *
 * PROTOTYPE DATA. Plans, prices, dates, accounts and titles below are mock values, and
 * `request()` stands in for the entitlement backend: nothing here is a real transaction.
 */
const tiles = (names, hue) => names.map((title, index) => ({ title, hue: hue + index * 14 }));

export const partners = [
  {
    id: "netflix",
    order: 1,
    name: "Netflix",
    logo: "frame.png",
    inset: true,
    colors: ["#e50914", "#5c0308", "#140103"],
    tagline: "Films, series and more, included with your Airtel plan.",
    status: "active",
    planId: "basic",
    validTill: "3 Jan 2027",
    activatedOn: "3 Oct 2026",
    account: "y•••••r@gmail.com",
    plans: [
      { id: "basic", name: "Netflix Basic", delta: 0, perks: ["HD (720p) streaming", "1 screen at a time", "Downloads on 1 device"] },
      { id: "standard", name: "Netflix Standard", delta: 150, perks: ["Full HD (1080p) streaming", "2 screens at a time", "Downloads on 2 devices"] },
      { id: "premium", name: "Netflix Premium", delta: 300, perks: ["4K + HDR streaming", "4 screens at a time", "Downloads on 6 devices"] },
    ],
    rails: [
      { title: "Trending now", items: tiles(["The Last Monsoon", "Paper Kings", "Night Shift", "Delhi After Dark", "Small Town Giants"], 350) },
      { title: "New this week", items: tiles(["Orbit", "The Long Game", "Masala Heist", "Quiet Hours"], 10) },
    ],
    supports: { changePlan: true, account: true, cancel: true },
  },
  {
    id: "appletv",
    order: 2,
    name: "Apple TV+",
    logo: "logo-1.png",
    inset: true,
    colors: ["#3a3a40", "#1c1c20", "#050506"],
    tagline: "Apple Originals, ad-free. Three months on Airtel.",
    status: "eligible",
    planId: "trial",
    validTill: "3 months from activation",
    account: null,
    plans: [{ id: "trial", name: "Apple TV+ · 3 months", delta: 0, perks: ["Every Apple Original", "4K Dolby Vision", "Share with up to 5 family members"] }],
    rails: [
      { title: "Apple Originals", items: tiles(["Far Shore", "The Understudy", "Signal", "Harbour Lights", "Slow Horses of Mumbai"], 215) },
      { title: "Coming soon", items: tiles(["Second Sun", "The Archivist", "Glasshouse"], 250) },
    ],
    supports: { changePlan: false, account: true, cancel: true },
  },
  {
    id: "googleone",
    order: 3,
    name: "Google One",
    logo: "logo-2.png",
    colors: ["#1a73e8", "#174ea6", "#0b1f47"],
    tagline: "More room for Photos, Drive and Gmail.",
    status: "expiring",
    planId: "100gb",
    validTill: "20 Oct 2026",
    activatedOn: "20 Apr 2026",
    account: "y•••••r@gmail.com",
    plans: [
      { id: "100gb", name: "Google One 100 GB", delta: 0, perks: ["100 GB of storage", "Share with 5 people", "Google Photos editing tools"] },
      { id: "200gb", name: "Google One 200 GB", delta: 80, perks: ["200 GB of storage", "Share with 5 people", "3% back on the Google Store"] },
      { id: "2tb", name: "Google One 2 TB", delta: 520, perks: ["2 TB of storage", "Share with 5 people", "Gemini Advanced"] },
    ],
    rails: [{ title: "What you can do", items: tiles(["Back up every photo", "Free up your phone", "Share with family", "Edit like a pro"], 200) }],
    supports: { changePlan: true, account: true, cancel: true },
  },
  {
    id: "prime",
    order: 4,
    name: "Prime Video",
    logo: "ott-prime.svg",
    colors: ["#1a98ff", "#0b3f73", "#041423"],
    tagline: "Blockbusters and Amazon Originals with your plan.",
    status: "eligible",
    failFirstClaim: true, // shows the Activation Failed and retry states
    planId: "lite",
    validTill: "6 months from activation",
    account: null,
    plans: [{ id: "lite", name: "Prime Video Mobile", delta: 0, perks: ["SD streaming on 1 mobile", "Amazon Originals", "Live cricket"] }],
    rails: [{ title: "Top on Prime", items: tiles(["Mirzapur: The Movie", "The Family Plan", "Panchayat Returns", "Kings of Kota"], 195) }],
    supports: { changePlan: false, account: true, cancel: true },
  },
];

const listeners = new Set();
const ordered = () => [...partners].sort((a, b) => a.order - b.order);

export const getPartner = (id) => partners.find((partner) => partner.id === id);
export const planOf = (partner) => partner.plans.find((plan) => plan.id === partner.planId);
export const nextOf = (id) => ordered()[ordered().findIndex((partner) => partner.id === id) + 1] ?? null;
export const prevOf = (id) => ordered()[ordered().findIndex((partner) => partner.id === id) - 1] ?? null;
export const isClaimed = (partner) => !["eligible", "activating", "failed", "expired"].includes(partner.status);

export function updatePartner(id, patch) {
  Object.assign(getPartner(id), patch);
  listeners.forEach((listener) => listener(getPartner(id)));
}

export function onPartnerChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Stand-in for a backend call: resolves, or rejects when `fail` is set, after a short wait. */
export const request = (fail = false, ms = 1300) => new Promise((resolve, reject) => setTimeout(fail ? reject : resolve, ms));

// How each entitlement state reads on a chip: [label, tone]
export const STATUS = {
  active: ["Active", "good"],
  expiring: ["Expiring soon", "warn"],
  cancelling: ["Cancellation scheduled", "warn"],
  expired: ["Expired", "bad"],
  eligible: ["Ready to claim", "info"],
  activating: ["Activation in progress", "info"],
  failed: ["Activation failed", "bad"],
};

/** Starts the claim for a partner and reports the confirmed outcome through its status. */
export async function claimPartner(id) {
  const partner = getPartner(id);
  updatePartner(id, { status: "activating" });
  try {
    await request(partner.failFirstClaim && !partner.retried);
    updatePartner(id, { status: "active", activatedOn: "Today" });
  } catch {
    updatePartner(id, { status: "failed", retried: true });
  }
}
