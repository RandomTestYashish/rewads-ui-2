/** Shared between gesture handlers so only one of them owns a pointer drag at a time. */
export const gesture = { owner: null };

/** Pointer deltas arrive in viewport pixels; the phone may be CSS-scaled on small windows. */
export function renderedScale(element) {
  return element.offsetWidth ? element.getBoundingClientRect().width / element.offsetWidth : 1;
}
