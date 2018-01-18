/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import { connect } from "react-redux";

import Reps from "devtools-reps";
const { REPS: { Rep }, MODE, ObjectInspectorUtils } = Reps;
const { ObjectInspector } = Reps;
const { getChildren } = ObjectInspectorUtils;

import actions from "../../../actions";
import { getLoadedObjects } from "../../../selectors";
import Popover from "../../shared/Popover";
import PreviewFunction from "../../shared/PreviewFunction";
import { markText } from "../../../utils/editor";
import { isReactComponent, isImmutable } from "../../../utils/preview";
import Svg from "../../shared/Svg";

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
  editorRef: ?HTMLDivElement,
  selectSourceURL: (string, Object) => void,
  openLink: string => void,
  extra: Object
};

export class Popup extends Component<Props> {
  marker: any;
  pos: any;

  componentDidMount() {
    const {
      loadObjectProperties,
      loadedObjects,
      value,
      editor,
      range
    } = this.props;

    if (!value || !value.type == "object") {
      return;
    }

    this.marker = markText(editor, "preview-selection", range);

    if (value.actor && !loadedObjects[value.actor]) {
      loadObjectProperties(value);
    }
  }

  componentWillUnmount() {
    if (this.marker) {
      this.marker.clear();
    }
  }

  getRoot() {
    const { expression, value } = this.props;

    return {
      name: expression,
      path: expression,
      contents: { value }
    };
  }

  getChildren() {
    const { loadedObjects } = this.props;
    const getObjectProperties = id => loadedObjects[id];

    const root = this.getRoot();
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

  renderFunctionPreview() {
    const { selectSourceURL, value } = this.props;
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

  renderReact(react: Object, roots: Array<Object>) {
    const reactHeader = react.displayName || "React Component";

    const header = (
      <div className="header-container">
        <h3>{reactHeader}</h3>
      </div>
    );

    roots = roots.filter(r => ["state", "props"].includes(r.name));
    return (
      <div className="preview-popup">
        {header}
        {this.renderObjectInspector(roots)}
      </div>
    );
  }

  renderImmutable(immutable: Object, roots: Array<Object>) {
    const immutableHeader = immutable.type || "Immutable";

    const header = (
      <div className="header-container">
        <Svg name="immutable" className="immutable-logo" />
        <h3>{immutableHeader}</h3>
      </div>
    );

    roots = [
      {
        path: "entries",
        contents: { value: immutable.entries }
      }
    ];

    return (
      <div className="preview-popup">
        {header}
        {this.renderObjectInspector(roots)}
      </div>
    );
  }

  renderObjectPreview() {
    const { extra: { react, immutable } } = this.props;
    const root = this.getRoot();
    const roots = this.getChildren();
    const grip = root.contents.value;

    if (!roots) {
      return null;
    }

    if (isReactComponent(grip)) {
      return this.renderReact(react, roots);
    }

    if (isImmutable(grip)) {
      return this.renderImmutable(immutable, roots);
    }

    return (
      <div className="preview-popup">{this.renderObjectInspector(roots)}</div>
    );
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

  renderObjectInspector(roots: Array<Object>) {
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

  renderPreview() {
    const { value } = this.props;
    if (value.class === "Function") {
      return this.renderFunctionPreview();
    }

    if (value.type === "object") {
      return <div>{this.renderObjectPreview()}</div>;
    }

    return this.renderSimplePreview(value);
  }

  getPreviewType(value: any) {
    if (
      typeof value == "number" ||
      typeof value == "boolean" ||
      (typeof value == "string" && value.length < 10) ||
      (typeof value == "number" && value.toString().length < 10) ||
      value.type == "null" ||
      value.type == "undefined" ||
      value.class === "Function"
    ) {
      return "tooltip";
    }

    return "popover";
  }

  render() {
    const { popoverPos, onClose, value, editorRef } = this.props;
    const type = this.getPreviewType(value);

    if (value.type === "object" && !this.getChildren()) {
      return null;
    }

    return (
      <Popover
        targetPosition={popoverPos}
        onMouseLeave={onClose}
        type={type}
        editorRef={editorRef}
      >
        {this.renderPreview()}
      </Popover>
    );
  }
}

const {
  addExpression,
  selectSourceURL,
  selectLocation,
  loadObjectProperties,
  openLink
} = actions;

export default connect(
  state => ({
    loadedObjects: getLoadedObjects(state)
  }),
  {
    addExpression,
    selectSourceURL,
    selectLocation,
    loadObjectProperties,
    openLink
  }
)(Popup);
