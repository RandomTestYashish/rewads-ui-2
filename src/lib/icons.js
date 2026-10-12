// Line icons in the Phosphor style the Figma file uses, drawn on a 24px grid.
const svg = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const icons = {
  game: svg(`<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7 12.5h4M9 10.5v4"/><circle cx="15.2" cy="11.3" r="0.6" fill="currentColor"/><circle cx="17.3" cy="13.6" r="0.6" fill="currentColor"/>`),
  play: svg(`<rect x="3" y="5" width="18" height="14" rx="3.5"/><path d="M10.2 9.2v5.6l4.6-2.8z" fill="currentColor"/>`),
  shield: svg(`<path d="M12 3l7 2.8v5.4c0 4.4-2.9 7.7-7 9.8-4.1-2.1-7-5.4-7-9.8V5.8z"/><path d="M9 12l2.1 2.1L15.2 10"/>`),
  crown: svg(`<path d="M4 18.5h16M4.6 15.5L3.5 7.5l5 3.8L12 5.5l3.5 5.8 5-3.8-1.1 8z"/>`),
  ticket: svg(`<path d="M3.5 8.5a2 2 0 012-2h13a2 2 0 012 2v1.6a2 2 0 000 3.8v1.6a2 2 0 01-2 2h-13a2 2 0 01-2-2v-1.6a2 2 0 000-3.8z"/><path d="M14.5 6.5v2M14.5 11v2M14.5 15.5v2"/>`),
  question: svg(`<circle cx="12" cy="12" r="9"/><path d="M9.6 9.6a2.4 2.4 0 114.2 1.6c-.8.8-1.8 1.2-1.8 2.5M12 16.8h.01"/>`),
  arrow: svg(`<path d="M5 12h14M13 6l6 6-6 6"/>`),
  chevron: svg(`<path d="M6 9l6 6 6-6"/>`),
  check: svg(`<path d="M5 12.5l4.5 4.5L19 7.5"/>`),
  sparkle: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 6.6c.2.8.8 1.3 1.5 1.5L22 12l-6.6 1.9c-.8.2-1.3.8-1.5 1.5L12 22l-1.9-6.6c-.2-.8-.8-1.3-1.5-1.5L2 12l6.6-1.9c.8-.2 1.3-.8 1.5-1.5z"/></svg>`,
};
