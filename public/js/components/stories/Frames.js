const React = require("react");
const { DOM: dom, createElement } = React;
const { Provider } = require("react-redux");

const { createStore } = require("./utils");

const { storiesOf } = require("@kadira/storybook");
const Frames = React.createFactory(require("../Frames"));

const frameData = require("../../test/fixtures/frames.json");

storiesOf("Frames", module)
  .add("Blank", () => {
    return renderContainer(Frames);
  })
  .add("Paused", () => {
    return renderContainer(Frames, { frames: frameData });
  });

function renderContainer(Component, props) {
  const store = createStore();
  return dom.div(
    { style: {
      width: "400px",
      margin: "auto",
      paddingTop: "100px"
    }},
    dom.div({style: {border: "1px solid #ccc", padding: "20px" }},
            createElement(Provider, { store },
                          createElement(Component, props)))
  );
}
