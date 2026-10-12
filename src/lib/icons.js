// Line icons in the Phosphor style the Figma file uses, drawn on a 24px grid.
const svg = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const icons = {
  home: svg(`<path d="M4 10.8L12 4l8 6.8V19a1 1 0 01-1 1h-4.5v-5.5h-5V20H5a1 1 0 01-1-1z"/>`),
  bookmark: svg(`<path d="M7 4h10a1 1 0 011 1v15l-6-4-6 4V5a1 1 0 011-1z"/>`),
  gift: svg(`<rect x="4" y="10" width="16" height="10" rx="1.5"/><path d="M3 7h18v3H3zM12 7v13M12 7c-1.5-3.5-6-3.5-5 0M12 7c1.5-3.5 6-3.5 5 0"/>`),
  game: svg(`<rect x="2.5" y="7" width="19" height="11" rx="5.5"/><path d="M7 12.5h4M9 10.5v4"/><circle cx="15.2" cy="11.3" r="0.6" fill="currentColor"/><circle cx="17.3" cy="13.6" r="0.6" fill="currentColor"/>`),
  help: svg(`<circle cx="12" cy="12" r="9"/><path d="M9.6 9.6a2.4 2.4 0 114.2 1.6c-.8.8-1.8 1.2-1.8 2.5M12 16.8h.01"/>`),
  close: svg(`<path d="M6 6l12 12M18 6L6 18"/>`),
  caret: svg(`<path d="M9 5.5l6.5 6.5L9 18.5"/>`),
  arrow: svg(`<path d="M5 12h14M13 6l6 6-6 6"/>`),
  chevron: svg(`<path d="M6 9l6 6 6-6"/>`),
  sparkle: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 6.6c.2.8.8 1.3 1.5 1.5L22 12l-6.6 1.9c-.8.2-1.3.8-1.5 1.5L12 22l-1.9-6.6c-.2-.8-.8-1.3-1.5-1.5L2 12l6.6-1.9c.8-.2 1.3-.8 1.5-1.5z"/></svg>`,
};
