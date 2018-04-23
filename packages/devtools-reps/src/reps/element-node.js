/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// ReactJS
const PropTypes = require("prop-types");

// Utils
const {
  isGrip,
  wrapRender,
} = require("./rep-utils");
const {rep: StringRep} = require("./string");
const { MODE } = require("./constants");
const nodeConstants = require("../shared/dom-node-constants");

const dom = require("react-dom-factories");
const { span } = dom;

/**
 * Renders DOM element node.
 */
ElementNode.propTypes = {
  object: PropTypes.object.isRequired,
  inspectIconTitle: PropTypes.string,
  // @TODO Change this to Object.values once it's supported in Node's version of V8
  mode: PropTypes.oneOf(Object.keys(MODE).map(key => MODE[key])),
  onDOMNodeClick: PropTypes.func,
  onDOMNodeMouseOver: PropTypes.func,
  onDOMNodeMouseOut: PropTypes.func,
  onInspectIconClick: PropTypes.func,
};

function ElementNode(props) {
  let {
    object,
    inspectIconTitle,
    mode,
    onDOMNodeClick,
    onDOMNodeMouseOver,
    onDOMNodeMouseOut,
    onInspectIconClick,
  } = props;
  let elements = getElements(object, mode);

  let isInTree = object.preview && object.preview.isConnected === true;

  let baseConfig = {
    "data-link-actor-id": object.actor,
    className: "objectBox objectBox-node"
  };
  let inspectIcon;
  if (isInTree) {
    if (onDOMNodeClick) {
      Object.assign(baseConfig, {
        onClick: _ => onDOMNodeClick(object)
      });
    }

    if (onDOMNodeMouseOver) {
      Object.assign(baseConfig, {
        onMouseOver: _ => onDOMNodeMouseOver(object)
      });
    }

    if (onDOMNodeMouseOut) {
      Object.assign(baseConfig, {
        onMouseOut: onDOMNodeMouseOut
      });
    }

    if (onInspectIconClick) {
      inspectIcon = dom.button({
        className: "open-inspector",
        // TODO: Localize this with "openNodeInInspector" when Bug 1317038 lands
        title: inspectIconTitle || "Click to select the node in the inspector",
        onClick: e => {
          if (onDOMNodeClick) {
            e.stopPropagation();
          }

          onInspectIconClick(object, e);
        }
      });
    }
  }

  return span(baseConfig,
    ...elements,
    inspectIcon
  );
}

function getElements(grip, mode) {
  let {
    attributes,
    nodeName,
    isAfterPseudoElement,
    isBeforePseudoElement,
  } = grip.preview;
  const nodeNameElement = span({
    className: "tag-name"
  }, nodeName);

  if (isAfterPseudoElement || isBeforePseudoElement) {
    return [
      span({ className: "attrName" }, `::${ isAfterPseudoElement ? "after" : "before" }`)
    ];
  }

  if (mode === MODE.TINY) {
    let elements = [nodeNameElement];
    if (attributes.id) {
      elements.push(
        span({className: "attrName"}, `#${attributes.id}`));
    }
    if (attributes.class) {
      elements.push(
        span({className: "attrName"},
          attributes.class
            .trim()
            .split(/\s+/)
            .map(cls => `.${cls}`)
            .join("")
        )
      );
    }
    return elements;
  }

  let attributeKeys = Object.keys(attributes);
  if (attributeKeys.includes("class")) {
    attributeKeys.splice(attributeKeys.indexOf("class"), 1);
    attributeKeys.unshift("class");
  }
  if (attributeKeys.includes("id")) {
    attributeKeys.splice(attributeKeys.indexOf("id"), 1);
    attributeKeys.unshift("id");
  }
  const attributeElements = attributeKeys.reduce((arr, name, i, keys) => {
    let value = attributes[name];
    let attribute = span({},
      span({className: "attrName"}, name),
      span({className: "attrEqual"}, "="),
      StringRep({className: "attrValue", object: value}),
    );

    return arr.concat([" ", attribute]);
  }, []);

  return [
    span({className: "angleBracket"}, "<"),
    nodeNameElement,
    ...attributeElements,
    span({className: "angleBracket"}, ">"),
  ];
}

// Registration
function supportsObject(object, noGrip = false) {
  if (noGrip === true || !isGrip(object)) {
    return false;
  }
  return object.preview && object.preview.nodeType === nodeConstants.ELEMENT_NODE;
}

// Exports from this module
module.exports = {
  rep: wrapRender(ElementNode),
  supportsObject,
};
