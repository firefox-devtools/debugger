/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import { connect } from "react-redux";

import Reps from "devtools-reps";
const {
  REPS: { Rep },
  MODE,
  ObjectInspector,
  ObjectInspectorUtils
} = Reps;

const {
  createNode,
  getChildren,
  getValue,
  nodeIsPrimitive,
  NODE_TYPES
} = ObjectInspectorUtils.node;
const { loadItemProperties } = ObjectInspectorUtils.loadProperties;

import actions from "../../../actions";
import { getAllPopupObjectProperties } from "../../../selectors";
import Popover from "../../shared/Popover";
import PreviewFunction from "../../shared/PreviewFunction";
import { markText } from "../../../utils/editor";
import Svg from "../../shared/Svg";
import { createObjectClient } from "../../../client/firefox";

import "./Popup.css";

import type { EditorRange } from "../../../utils/editor/types";
import type { Node } from "../../../utils/sources-tree/types";

type PopupValue = Object | null;
type Props = {
  setPopupObjectProperties: (Object, Object) => void,
  addExpression: (string, ?Object) => void,
  popupObjectProperties: Object,
  popoverPos: Object,
  value: PopupValue,
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

  async componentWillMount() {
    const {
      value,
      setPopupObjectProperties,
      popupObjectProperties
    } = this.props;

    const root = this.getRoot();

    if (
      !nodeIsPrimitive(root) &&
      value &&
      value.actor &&
      !popupObjectProperties[value.actor]
    ) {
      const onLoadItemProperties = loadItemProperties(root, createObjectClient);
      if (onLoadItemProperties !== null) {
        const properties = await onLoadItemProperties;
        setPopupObjectProperties(root.contents.value, properties);
      }
    }
  }

  componentDidMount() {
    const { value, editor, range } = this.props;

    if (!value || !value.type == "object") {
      return;
    }

    this.marker = markText(editor, "preview-selection", range);
  }

  componentWillUnmount() {
    if (this.marker) {
      this.marker.clear();
    }
  }

  getRoot() {
    const { expression, value, extra } = this.props;

    let rootValue = value;
    if (extra.immutable) {
      rootValue = extra.immutable.entries;
    }

    return createNode({
      name: expression,
      path: expression,
      contents: { value: rootValue }
    });
  }

  getChildren() {
    const { popupObjectProperties } = this.props;

    const root = this.getRoot();
    const value = getValue(root);
    const actor = value ? value.actor : null;
    const loadedRootProperties = popupObjectProperties[actor];
    if (!loadedRootProperties) {
      return null;
    }

    const children = getChildren({
      item: root,
      loadedProperties: new Map([[root.path, loadedRootProperties]])
    });

    if (children.length > 0) {
      return children;
    }

    return null;
  }

  renderFunctionPreview() {
    const { selectSourceURL, value } = this.props;

    if (!value) {
      return null;
    }

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

  renderReact(react: Object, roots: Array<Node>) {
    const reactHeader = react.displayName || "React Component";

    return (
      <div className="header-container">
        <Svg name="react" className="logo" />
        <h3>{reactHeader}</h3>
      </div>
    );
  }

  renderImmutable(immutable: Object) {
    const immutableHeader = immutable.type || "Immutable";

    return (
      <div className="header-container">
        <Svg name="immutable" className="logo" />
        <h3>{immutableHeader}</h3>
      </div>
    );
  }

  renderObjectPreview() {
    const { extra } = this.props;
    const root = this.getRoot();

    if (nodeIsPrimitive(root)) {
      return null;
    }

    let roots = this.getChildren();
    if (!Array.isArray(roots) || roots.length === 0) {
      return null;
    }

    let header = null;
    if (extra.immutable) {
      header = this.renderImmutable(extra.immutable);
      roots = roots.filter(r => r.type != NODE_TYPES.PROTOTYPE);
    }

    if (extra.react) {
      header = this.renderReact(extra.react);
      roots = roots.filter(r => ["state", "props"].includes(r.name));
    }

    return (
      <div className="preview-popup">
        {header}
        {this.renderObjectInspector(roots)}
      </div>
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
    const { openLink } = this.props;

    return (
      <ObjectInspector
        roots={roots}
        autoExpandDepth={0}
        disableWrap={true}
        focusable={false}
        openLink={openLink}
        createObjectClient={grip => createObjectClient(grip)}
      />
    );
  }

  renderPreview() {
    const { value } = this.props;
    if (!value) {
      return null;
    }

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

    if (value && value.type === "object" && !this.getChildren()) {
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
  setPopupObjectProperties,
  openLink
} = actions;

export default connect(
  state => ({
    popupObjectProperties: getAllPopupObjectProperties(state)
  }),
  {
    addExpression,
    selectSourceURL,
    selectLocation,
    setPopupObjectProperties,
    openLink
  }
)(Popup);
