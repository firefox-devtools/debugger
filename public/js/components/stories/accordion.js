"use strict";

const React = require("react");
const { DOM: dom } = React;
const Accordion = React.createFactory(require("../Accordion"));
const { storiesOf } = require("@kadira/storybook");

let items = [
  { header: "Breakpoints",
    component: () => dom.div({className: "pane-info"}, "No Breakpoints")
  },
  { header: "Call Stack",
    component: () => dom.div({className: "pane-info"}, "Not Paused")
  },
  { header: "Scopes",
    component: () => dom.div({className: "pane-info"}, "Not Paused")
  }
];

storiesOf("Accordion", module)
  .add("3 Closed Panes", () => {
    items[1].opened = false;
    return renderContainer(
      Accordion({
        items: items
      })
    );
  })
  .add("1 Open Pane", () => {
    items[1].opened = true;
    return renderContainer(
      Accordion({
        items: items
      })
    );
  });

function renderContainer(child) {
  return dom.div({ style: {
    width: "300px",
    margin: "auto",
    paddingTop: "100px"
  }}, child);
}
