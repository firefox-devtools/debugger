/* Checks to see if the root element is available and
 * if the element is visible. We check the width of the element
 * because it is more reliable than either checking a focus state or
 * the visibleState or hidden property.
 */
export function isVisible() {
  const el = document.querySelector("#mount");
  return el && el.getBoundingClientRect().width;
}
