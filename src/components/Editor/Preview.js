// @flow

import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";
const ObjectInspector = React.createFactory(
  require("../shared/ObjectInspector").default
);
const Popover = React.createFactory(require("../shared/Popover").default);
const previewFunction = require("../shared/previewFunction").default;

import { getLoadedObjects } from "../../selectors";
import { getChildren } from "../../utils/object-inspector";

const Rep = require("../shared/Rep").default;
const { MODE } = require("devtools-reps");

const { DOM: dom, PropTypes, Component } = React;

require("./Preview.css");

class Preview extends Component {
  componentDidMount() {
    const { loadObjectProperties, loadedObjects, value } = this.props;

    if (!value || !value.type == "object") {
      return;
    }

    if (value.actor && !loadedObjects.has(value.actor)) {
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

  renderFunctionPreview(value, root) {
    const { selectSourceURL } = this.props;
    const { location } = value;

    return dom.div(
      {
        className: "preview",
        onClick: () => selectSourceURL(location.url, { line: location.line })
      },
      previewFunction(value)
    );
  }

  renderObjectPreview(expression, root) {
    return dom.div({ className: "preview" }, this.renderObjectInspector(root));
  }

  renderSimplePreview(value) {
    return dom.div(
      { className: "preview" },
      Rep({ object: value, mode: MODE.LONG })
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
      loadObjectProperties,
      getActors: () => ({})
    });
  }

  renderPreview(expression, value) {
    const root = {
      name: expression,
      path: expression,
      contents: { value }
    };

    if (value.class === "Function") {
      return this.renderFunctionPreview(value, root);
    }

    if (value.type === "object") {
      return this.renderObjectPreview(expression, root);
    }

    return this.renderSimplePreview(value);
  }

  render() {
    const {
      popoverTarget,
      onClose,
      value,
      expression
    } = this.props;

    let type = value.class === "Function" ? "tooltip" : "popover";

    return Popover(
      {
        target: popoverTarget,
        onMouseLeave: onClose,
        type
      },
      this.renderPreview(expression, value)
    );
  }
}

Preview.propTypes = {
  loadObjectProperties: PropTypes.func,
  loadedObjects: PropTypes.object,
  selectedFrame: PropTypes.object,
  popoverTarget: PropTypes.object,
  value: PropTypes.any,
  expression: PropTypes.string,
  onClose: PropTypes.func,
  selectSourceURL: PropTypes.func
};

Preview.displayName = "Preview";

export default connect(
  state => ({
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Preview);
