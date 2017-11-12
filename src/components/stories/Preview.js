/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import PropTypes from "prop-types";
import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { Preview } from "../Editor/Preview";
import { L10N } from "devtools-launchpad";
import { setValue } from "devtools-config";
import * as I from "immutable";

import "../App.css";
import "../SecondaryPanes/Frames/Frames.css";
import "devtools-modules/src/themes/dark-theme.css";

function createArrayPreview(name) {
  return {
    enumerable: true,
    writerable: true,
    configurable: true,
    value: {
      type: "object",
      actor: `server2.conn45.child1/${name}`,
      class: "Object",
      ownPropertyLength: 2,
      preview: {
        kind: "ArrayLike",
        ownProperties: {},
        ownPropertiesLength: 0,
        length: 1
      }
    }
  };
}

function createObjectPreview(name) {
  return {
    enumerable: true,
    writerable: true,
    configurable: true,
    value: {
      type: "Object",
      actor: `server2.conn45.child1/${name}`,
      class: "Object",
      ownPropertyLength: 2,
      preview: {
        kind: "object",
        ownProperties: {},
        ownPropertiesLength: 0,
        length: 1
      }
    }
  };
}

function createObjectGrip(id) {
  return {
    actor: `server2.conn45.child1/${id}`,
    type: "object",
    class: "Object",
    ownProperties: {},
    ownSymbols: {},
    safeGetters: {}
  };
}

function createFunctionGrip(name, parameterNames) {
  return {
    actor: `server2.conn45.child1/${name}`,
    type: "function",
    class: "Function",
    name,
    parameterNames
  };
}

const obj = {
  actor: "server2.conn45.child1/pausedobj81",
  type: "object",
  class: "Object",
  ownProperties: {
    cid: {
      value: "view4"
    },
    model: {
      value: {
        type: "object",
        actor: "server2.conn45.child1/pausedobj82",
        class: "Object",
        ownPropertyLength: 8,
        preview: {
          kind: "Object",
          ownProperties: {},
          ownPropertiesLength: 8,
          safeGetterValues: {}
        }
      }
    },
    $el: {
      value: {
        type: "object",
        actor: "server2.conn45.child1/pausedobj83",
        class: "Object",
        ownPropertyLength: 2,
        preview: {
          kind: "ArrayLike",
          length: 1
        }
      }
    },
    el: {
      value: {
        type: "object",
        actor: "server2.conn45.child1/pausedobj84",
        class: "HTMLLIElement",
        ownPropertyLength: 0,
        preview: {
          kind: "DOMNode",
          nodeType: 1,
          nodeName: "li",
          attributes: {},
          attributesLength: 0
        }
      }
    }
  },
  prototype: {
    type: "object",
    actor: "server2.conn45.child1/pausedobj426",
    class: "Object",
    ownPropertyLength: 14
  },
  ownSymbols: []
};

// NOTE: we need this for supporting L10N in storybook
// we can move this to a shared helper as we add additional stories
if (typeof window == "object") {
  window.L10N = L10N;
  window.L10N.setBundle(require("../../../assets/panel/debugger.properties"));
}

function PreviewFactory({ dir = "ltr", theme = "light", ...props }) {
  const themeClass = `theme-${theme}`;
  document.dir = dir;
  document.body.parentNode.className = themeClass;

  const popoverPos = {
    top: 200,
    left: 200,
    bottom: 80,
    width: 60,
    height: 30
  };

  const range = {
    start: { line: 3, column: 4 },
    end: { line: 3, column: 4 }
  };

  const editor = { codeMirror: { markText: () => {} } };

  return (
    <div
      className="editor-wrapper"
      style={{
        width: "calc(100vw - 30px)",
        height: "calc(100vh - 30px)",
        margin: "10px"
      }}
    >
      <div
        className={`preview ${themeClass}`}
        dir={dir}
        style={{ width: "100vw" }}
      >
        <Preview
          value={null}
          expression={null}
          loadedObjects={{}}
          editor={editor}
          popoverPos={popoverPos}
          range={range}
          loadObjectProperties={() => {}}
          onClose={action("onClose")}
          {...props}
        />
      </div>
    </div>
  );
}

PreviewFactory.displayName = "PreviewFactory";
PreviewFactory.propTypes = {
  dir: PropTypes.string,
  theme: PropTypes.string
};

storiesOf("Preview", module)
  .add("simple Object", () => {
    setValue("features.previewWatch", false);
    return (
      <PreviewFactory
        value={obj}
        expression="this"
        loadedObjects={I.Map().set(obj.actor, obj)}
      />
    );
  })
  .add("simple Object with Input", () => {
    setValue("features.previewWatch", true);
    return (
      <PreviewFactory
        value={obj}
        expression="this"
        loadedObjects={{ [obj.actor]: obj }}
      />
    );
  })
  .add("Object with window keys", () => {
    const grip = createObjectGrip("foo");
    grip.ownProperties.arr = createArrayPreview("arr");
    grip.ownProperties.location = createObjectPreview("location");
    return (
      <PreviewFactory
        value={grip}
        expression="this"
        loadedObjects={{ [grip.actor]: grip }}
      />
    );
  })
  .add("Window Preview", () => {
    const grip = createObjectGrip("foo");
    grip.class = "Window";
    grip.ownProperties.arr = createArrayPreview("arr");
    grip.ownProperties.location = createObjectPreview("location");
    return (
      <PreviewFactory
        value={grip}
        expression="this"
        loadedObjects={{ [grip.actor]: grip }}
      />
    );
  })
  .add("Function Preview", () => {
    const grip = createFunctionGrip("renderFoo", ["props", "state"]);
    return (
      <PreviewFactory
        value={grip}
        expression="this"
        loadedObjects={{ [grip.actor]: grip }}
      />
    );
  });
