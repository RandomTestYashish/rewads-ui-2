export const asset = (name) => `src/assets/${name}`;

/** Builds a single element from an HTML string. */
export function el(markup) {
  const template = document.createElement("template");
  template.innerHTML = markup.trim();
  return template.content.firstElementChild;
}

/** Marks one item in a group as current and clears the rest. */
export function selectOne(items, selected, attribute, value = "true") {
  items.forEach((item) => item.setAttribute(attribute, item === selected ? value : "false"));
}

/**
 * An image that Figma draws differently in the light frame. The dark file sits in
 * `assets/`, its light twin in `assets/light/`; `applyTheme` swaps between them.
 */
export function themed(name, className = "") {
  return `<img class="${className}" data-themed="${name}" src="${asset(name)}" alt="" />`;
}

export function applyTheme(root, theme) {
  root.dataset.theme = theme;
  root.querySelectorAll("[data-themed]").forEach((image) => {
    image.src = asset(theme === "light" ? `light/${image.dataset.themed}` : image.dataset.themed);
  });
}
