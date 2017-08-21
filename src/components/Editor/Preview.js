// @flow

import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isEnabled } from "devtools-config";

import Reps from "devtools-reps";
const { REPS: { Rep }, MODE, ObjectInspectorUtils } = Reps;
const { ObjectInspector } = Reps;
const { getChildren } = ObjectInspectorUtils;

import Popover from "../shared/Popover";

import previewFunction from "../shared/previewFunction";
import { getLoadedObjects } from "../../selectors";
import actions from "../../actions";
import { markText } from "../../utils/editor";

import type { EditorRange } from "../../utils/editor/types";

import "./Preview.css";

export class Preview extends Component {
  marker: any;
  pos: any;
  props: {
    loadObjectProperties: Object => void,
    addExpression: (string, ?Object) => void,
    loadedObjects: Object,
    popoverPos: Object,
    value: Object,
    expression: string,
    onClose: () => void,
    range: EditorRange,
    editor: any,
    selectSourceURL: (string, Object) => void
  };

  componentDidMount() {
    const {
      loadObjectProperties,
      loadedObjects,
      value,
      editor,
      range
    } = this.props;

    this.marker = markText(editor, "selection", range);

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
        className="preview"
        onClick={() => selectSourceURL(location.url, { line: location.line })}
      >
        {previewFunction(value)}
      </div>
    );
  }

  renderObjectPreview(expression: string, root: Object) {
    return (
      <div className="preview">
        {this.renderObjectInspector(root)}
      </div>
    );
  }

  renderSimplePreview(value: Object) {
    return (
      <div className="preview">
        {Rep({ object: value, mode: MODE.LONG })}
      </div>
    );
  }

  renderObjectInspector(root: Object) {
    const { loadObjectProperties, loadedObjects } = this.props;

    const getObjectProperties = id => loadedObjects[id];
    const roots = this.getChildren(root, getObjectProperties);

    if (!roots) {
      return null;
    }

    return (
      <ObjectInspector
        roots={roots}
        autoExpandDepth={0}
        disableWrap={true}
        disabledFocus={true}
        getObjectProperties={getObjectProperties}
        loadObjectProperties={loadObjectProperties}
        // TODO: See https://github.com/devtools-html/debugger.html/issues/3555.
        getObjectEntries={actor => {}}
        loadObjectEntries={grip => {}}
      />
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
        <div className="expression-to-save-label">
          {expression}
        </div>
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

    let type = this.getPreviewType(value);

    return (
      <Popover targetPosition={popoverPos} onMouseLeave={onClose} type={type}>
        {this.renderPreview(expression, value)}
      </Popover>
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
