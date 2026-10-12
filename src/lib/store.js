/** Session state shared by the header, the rewards rail and the sheets. */
const listeners = new Set();

export const state = {
  earned: 0, // coins earned this session, added to each frame's starting balance
  history: [], // { label, coins }
  rewards: [
    { id: "netflix", name: "Netflix Basic", art: "netflix", coins: 50, claimed: false },
    { id: "appletv", name: "Apple TV", art: "appletv", coins: 50, claimed: false },
    { id: "googleone", name: "Google One", art: "tile", logo: "logo-2.png", wash: "#3b82f6", coins: 30, claimed: false },
    { id: "xstream", name: "Xstream Play", art: "tile", logo: "logo.png", wash: "#e10203", coins: 30, claimed: false },
    { id: "jiohotstar", name: "JioHotstar Mobile", art: "tile", logo: "frame-1.png", wash: "#a23bff", coins: 40, claimed: false },
    { id: "appletvplus", name: "Apple TV+", art: "tile", logo: "logo-1.png", inset: true, wash: "#5ec8ff", coins: 40, claimed: false },
  ],
};

// The two frames show different balances (7,636 on the coin, 286 on the pill).
export const START_BALANCE = { dark: 7636, light: 286 };

export const unclaimed = () => state.rewards.filter((reward) => !reward.claimed);

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(change) {
  listeners.forEach((listener) => listener(change));
}

export function earn(coins, label) {
  state.earned += coins;
  state.history.unshift({ label, coins });
  emit({ type: "earn", coins });
}

export function claim(id) {
  const reward = state.rewards.find((item) => item.id === id);
  if (!reward || reward.claimed) return null;
  reward.claimed = true;
  emit({ type: "claim", reward });
  return reward;
}
