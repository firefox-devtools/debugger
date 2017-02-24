const React = require("react");
const { DOM: dom } = React;

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

  el.addEventListener(
    "mouseleave",
    () => el.parentNode.removeChild(el)
  );

  return el;
}

function createPopup(e, content) {
  return Popover({
    content: dom.div(
      { className: "popover-content" },
      ""
    ),
    pos: { top: e.pageY, left: e.pageX }
  });
}

module.exports = createPopup;
