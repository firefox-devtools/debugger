// @flow

import { createFactory, DOM as dom, Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isEnabled } from "devtools-config";

import _ObjectInspector from "../shared/ObjectInspector";
const ObjectInspector = createFactory(_ObjectInspector);

import _Popover from "../shared/Popover";
const Popover = createFactory(_Popover);

import previewFunction from "../shared/previewFunction";
import { getLoadedObjects } from "../../selectors";
import actions from "../../actions";
import { getChildren } from "../../utils/object-inspector";
import Rep from "../shared/Rep";
import { MODE } from "devtools-reps";

import "./Preview.css";

class Preview extends Component {
  props: {
    loadObjectProperties: Object => void,
    addExpression: (string, ?Object) => void,
    loadedObjects: Object,
    popoverTarget: Object,
    value: Object,
    expression: string,
    onClose: () => void,
    selectSourceURL: (string, Object) => void
  };

  componentDidMount() {
    const {
      loadObjectProperties,
      loadedObjects,
      value,
      popoverTarget
    } = this.props;

    popoverTarget.classList.add("selected-token");

    if (!value || !value.type == "object") {
      return;
    }

    if (value.actor && !loadedObjects[value.actor]) {
      loadObjectProperties(value);
    }
  }

  componentWillUnmount() {
    const { popoverTarget } = this.props;
    popoverTarget.classList.remove("selected-token");
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

  renderFunctionPreview(value: Object, root: Object) {
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

  renderObjectPreview(expression: string, root: Object) {
    return dom.div({ className: "preview" }, this.renderObjectInspector(root));
  }

  renderSimplePreview(value: Object) {
    return dom.div(
      { className: "preview" },
      Rep({ object: value, mode: MODE.LONG })
    );
  }

  renderObjectInspector(root) {
    const { loadObjectProperties, loadedObjects } = this.props;

    const getObjectProperties = id => loadedObjects[id];
    const roots = this.getChildren(root, getObjectProperties);

    return ObjectInspector({
      roots,
      getObjectProperties,
      autoExpandDepth: 0,
      onDoubleClick: () => {},
      loadObjectProperties
    });
  }

  renderAddToExpressionBar(expression: string) {
    if (!isEnabled("previewWatch")) {
      return null;
    }

    const { addExpression } = this.props;
    return dom.div(
      { className: "add-to-expression-bar" },
      dom.div({ className: "prompt" }, "»"),
      dom.div({ className: "expression-to-save-label" }, expression),
      dom.div(
        {
          className: "expression-to-save-button",
          onClick: event => {
            addExpression(expression);
          }
        },
        L10N.getStr("addWatchExpressionButton")
      )
    );
  }

  renderPreview(expression: string, value: Object) {
    const root = {
      name: expression,
      path: expression,
      contents: { value }
    };

    if (value.class === "Function") {
      return this.renderFunctionPreview(value, root);
    }

    if (value.type === "object") {
      return dom.div(
        {},
        this.renderObjectPreview(expression, root),
        this.renderAddToExpressionBar(expression)
      );
    }

    return this.renderSimplePreview(value);
  }

  getPreviewType(value) {
    if (
      typeof value == "boolean" ||
      value.type == "null" ||
      value.type == "undefined" ||
      value.class === "Function"
    ) {
      return "tooltip";
    }

    return "popover";
  }

  render() {
    const { popoverTarget, onClose, value, expression } = this.props;

    let type = this.getPreviewType(value);

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

Preview.displayName = "Preview";

export default connect(
  state => ({
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Preview);
