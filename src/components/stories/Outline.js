import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { Outline } from "../PrimaryPanes/Outline";
import { L10N } from "devtools-launchpad";

import "../App.css";
import "../PrimaryPanes/Outline.css";

import "devtools-modules/src/themes/dark-theme.css";

if (typeof window == "object") {
  window.L10N = L10N;
  window.L10N.setBundle(require("../../../assets/panel/debugger.properties"));
}

function makeFuncLocation(startLine) {
  return {
    start: {
      line: startLine
    }
  };
}

function makeSymbolDeclaration(name, line) {
  return {
    id: `${name}:${line}`,
    name,
    location: makeFuncLocation(line)
  };
}

function OutlineFactory({ dir = "ltr", theme = "dark", ...props }) {
  const themeClass = `theme-${theme}`;
  document.body.parentNode.className = themeClass;
  return (
    <div
      className={`outline ${themeClass}`}
      dir={dir}
      style={{
        width: "300px",
        margin: "40px",
        border: "1px solid var(--theme-splitter-color)"
      }}
    >
      <Outline
        selectSource={action("selectFrame")}
        isHidden={false}
        {...props}
      />
    </div>
  );
}

OutlineFactory.propTypes = {
  dir: PropTypes.string,
  theme: PropTypes.string
};

storiesOf("Outline", module)
  .add("empty view", () => {
    const symbols = { functions: [], variables: [] };
    return <OutlineFactory symbols={symbols} />;
  })
  .add("simple view", () => {
    const symbols = {
      functions: [
        makeSymbolDeclaration("foo", 2),
        makeSymbolDeclaration("render", 2)
      ],
      variables: []
    };
    return <OutlineFactory symbols={symbols} />;
  });
