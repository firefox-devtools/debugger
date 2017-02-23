const ReactDOM = require("react-dom");

require("./Popover.css");

function Popover({ content, pos }) {
  const el = document.createElement("div");
  el.classList.add("popover");
  document.body.appendChild(el);
  ReactDOM.render(content, el);
  const rect = el.getBoundingClientRect();
  el.style.left = `${(pos.left - rect.width / 2)}px`;
  el.style.top = `${(pos.top + 10)}px`;

  return {
    el,
    destroy: () => el.parentNode.removeChild(el)
  };
}

module.exports = Popover;
