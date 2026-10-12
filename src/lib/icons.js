// Line icons in the Phosphor style the Figma file uses, drawn on a 24px grid.
const svg = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const icons = {
  caret: svg(`<path d="M9 5.5l6.5 6.5L9 18.5"/>`),
  arrow: svg(`<path d="M5 12h14M13 6l6 6-6 6"/>`),
  chevron: svg(`<path d="M6 9l6 6 6-6"/>`),
  sparkle: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 6.6c.2.8.8 1.3 1.5 1.5L22 12l-6.6 1.9c-.8.2-1.3.8-1.5 1.5L12 22l-1.9-6.6c-.2-.8-.8-1.3-1.5-1.5L2 12l6.6-1.9c.8-.2 1.3-.8 1.5-1.5z"/></svg>`,
};
