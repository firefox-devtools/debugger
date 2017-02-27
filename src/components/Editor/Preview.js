// @flow

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";
const ObjectInspector = React.createFactory(require("../shared/ObjectInspector"));
const Popover = React.createFactory(require("../shared/Popover"));

import { getLoadedObjects } from "../../selectors";
import { getChildren } from "../../utils/object-inspector";
import { getFilenameFromURL } from "../../utils/source";

const times = require("lodash/times");
const zip = require("lodash/zip");
const flatten = require("lodash/flatten");

const { DOM: dom, PropTypes, Component } = React;

require("./Preview.css");

function formatFunctionSignature(value) {
  const { displayName, parameterNames } = value;

  let params = parameterNames.map(param => dom.span(
    { className: "param" },
    param
  ));

  const commas = times(params.length - 1).map(() => dom.span(
    { className: "delimiter" },
    ", "
  ));

  params = flatten(zip(params, commas));

  return dom.div(
    { className: "function-signature" },
    dom.span(
      { className: "function-name" },
      displayName,
    ),
    dom.span({ className: "paren" }, "("),
    ...params,
    dom.span({ className: "paren" }, ")"),
  );
}

class Preview extends Component {

  componentDidUpdate() {
    const { loadObjectProperties, loadedObjects, value } = this.props;

    if (!value || !value.type == "object") {
      return;
    }

    if (!loadedObjects.has(value.actor)) {
      loadObjectProperties(value);
    }
  }

  getChildren(root, getObjectProperties) {
    const actors = {};

    const children = getChildren({
      getObjectProperties,
      actors,
      item: root
    });

    if (children.length > 0) {
      return children;
    }

    return [root];
  }

  renderFunctionPreview(expression, root) {
    const { selectSourceURL } = this.props;

    const value = root.contents.value;
    const { location: { url, line }} = value;
    const filename = getFilenameFromURL(url);

    return dom.div(
      { className: "preview" },
      dom.div(
        { className: "header" },
        dom.a(
          {
            className: "link",
            onClick: () => selectSourceURL(url, { line })
          },
          filename
        )
      ),
      formatFunctionSignature(value)
    );
  }

  renderObjectPreview(expression, root) {
    return dom.div(
      { className: "preview" },
      this.renderObjectInspector(root)
    );
  }

  renderSimplePreview(value) {
    return dom.div(
      {},
      value
    );
  }

  renderObjectInspector(root) {
    const {
      loadObjectProperties,
      loadedObjects
    } = this.props;

    const getObjectProperties = id => loadedObjects.get(id);
    const roots = this.getChildren(root, getObjectProperties);

    return ObjectInspector({
      roots,
      getObjectProperties,
      autoExpandDepth: 0,
      onDoubleClick: () => {},
      loadObjectProperties
    });
  }

  renderPreview(expression, value) {
    const root = {
      name: expression,
      path: expression,
      contents: { value }
    };

    if (value.class === "Function") {
      return this.renderFunctionPreview(expression, root);
    }

    if (value.type === "object") {
      return this.renderObjectPreview(expression, root);
    }

    return this.renderSimplePreview(value);
  }

  render() {
    const {
      popoverPos,
      onClose,
      value,
      expression
    } = this.props;

    return Popover(
      {
        pos: popoverPos,
        onMouseLeave: onClose
      },
      this.renderPreview(expression, value)
    );
  }
}

Preview.propTypes = {
  loadObjectProperties: PropTypes.func,
  loadedObjects: PropTypes.object,
  selectedFrame: PropTypes.object,
  popoverPos: PropTypes.object,
  value: PropTypes.any,
  expression: PropTypes.string,
  onClose: PropTypes.func
};

Preview.displayName = "Preview";

export default connect(
  state => ({
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Preview);
