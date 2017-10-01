// @flow

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isEnabled } from "devtools-config";

import Reps from "devtools-reps";
const { REPS: { Rep }, MODE, ObjectInspectorUtils } = Reps;
const { ObjectInspector } = Reps;
const { getChildren } = ObjectInspectorUtils;

import actions from "../../../actions";
import { getLoadedObjects } from "../../../selectors";
import Popover from "../../shared/Popover";
import PreviewFunction from "../../shared/PreviewFunction";
import { markText } from "../../../utils/editor";

import "./Popup.css";

import type { EditorRange } from "../../../utils/editor/types";

type Props = {
  loadObjectProperties: Object => void,
  addExpression: (string, ?Object) => void,
  loadedObjects: Object,
  popoverPos: Object,
  value: Object,
  expression: string,
  onClose: () => void,
  range: EditorRange,
  editor: any,
  selectSourceURL: (string, Object) => void,
  openLink: string => void
};

function isReactComponent(roots) {
  return roots.some(root => root.name === "_reactInternalInstance");
}

export class Popup extends Component {
  marker: any;
  pos: any;
  props: Props;

  componentDidMount() {
    const {
      loadObjectProperties,
      loadedObjects,
      value,
      editor,
      range
    } = this.props;

    this.marker = markText(editor, "preview-selection", range);

    if (!value || !value.type == "object") {
      return;
    }

    if (value.actor && !loadedObjects[value.actor]) {
      loadObjectProperties(value);
    }
  }

  componentWillUnmount() {
    if (this.marker) {
      this.marker.clear();
    }
  }

  getChildren(root: Object, getObjectProperties: Function) {
    const actors = {};

    const children = getChildren({
      getObjectProperties,
      actors,
      item: root
    });

    if (children.length > 0) {
      return children;
    }

    return null;
  }

  renderFunctionPreview(value: Object, root: Object) {
    const { selectSourceURL } = this.props;
    const { location } = value;

    return (
      <div
        className="preview-popup"
        onClick={() => selectSourceURL(location.url, { line: location.line })}
      >
        <PreviewFunction func={value} />
      </div>
    );
  }

  renderObjectPreview(expression: string, root: Object) {
    const content = null;
    const { loadedObjects } = this.props;
    const getObjectProperties = id => loadedObjects[id];
    const roots = this.getChildren(root, getObjectProperties);

    if (!roots) {
      return null;
    }

    if (isReactComponent(roots)) {
      content = this.renderReactPreview(roots);
    } else {
      content = this.renderObjectInspector(roots);
    }

    return <div className="preview-popup">{content}</div>;
  }

  renderSimplePreview(value: Object) {
    const { openLink } = this.props;
    return (
      <div className="preview-popup">
        {Rep({
          object: value,
          mode: MODE.LONG,
          openLink
        })}
      </div>
    );
  }

  renderObjectInspector(roots: Object) {
    const { loadObjectProperties, loadedObjects, openLink } = this.props;
    const getObjectProperties = id => loadedObjects[id];

    return (
      <ObjectInspector
        roots={roots}
        autoExpandDepth={0}
        disableWrap={true}
        disabledFocus={true}
        openLink={openLink}
        getObjectProperties={getObjectProperties}
        loadObjectProperties={loadObjectProperties}
        // TODO: See https://github.com/devtools-html/debugger.html/issues/3555.
        getObjectEntries={actor => {}}
        loadObjectEntries={grip => {}}
      />
    );
  }

  renderComponentAttributes(root: Object) {
    if (!("preview" in root.contents.value)) {
      return "none";
    }
    const attributes = root.contents.value.preview.ownProperties;

    return Object.keys(attributes).map(key => {
      const val = attributes[key].value;
      const content = "";

      switch (typeof val) {
        case "object":
          if (val.class === "Function") {
            content = `${val.displayName}()`;
          } else {
            content = val.type;
          }
          break;
        case "string":
          content = `"${val}"`;
          break;
        default:
          content = attributes[key].value.toString();
      }

      return (
        <div key={key}>
          <span>{key}: </span>
          <span>{content}</span>
        </div>
      );
    });
  }

  renderReactPreview(roots: Array) {
    roots = roots.filter(r => ["state", "props"].includes(r.name));

    return (
      <div className="react-popup">
        <div className="react-popup-section">
          <h2>State</h2>
          {this.renderComponentAttributes(roots[1])}
        </div>
        <div className="react-popup-section">
          <h2>Props</h2>
          {this.renderComponentAttributes(roots[0])}
        </div>
      </div>
    );
  }

  renderAddToExpressionBar(expression: string) {
    if (!isEnabled("previewWatch")) {
      return null;
    }

    const { addExpression } = this.props;
    return (
      <div className="add-to-expression-bar">
        <div className="prompt">»</div>
        <div className="expression-to-save-label">{expression}</div>
        <div
          className="expression-to-save-button"
          onClick={event => addExpression(event)}
        >
          {L10N.getStr("addWatchExpressionButton")}
        </div>
      </div>
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
      return (
        <div>
          {this.renderObjectPreview(expression, root)}
          {this.renderAddToExpressionBar(expression)}
        </div>
      );
    }

    return this.renderSimplePreview(value);
  }

  getPreviewType(value: any) {
    if (
      typeof value == "number" ||
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
    const { popoverPos, onClose, value, expression } = this.props;
    const type = this.getPreviewType(value);

    return (
      <Popover targetPosition={popoverPos} onMouseLeave={onClose} type={type}>
        {this.renderPreview(expression, value)}
      </Popover>
    );
  }
}

export default connect(
  state => ({
    loadedObjects: getLoadedObjects(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Popup);
