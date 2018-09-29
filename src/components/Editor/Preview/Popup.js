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
  objectInspector
} = Reps;

const { ObjectInspector, utils } = objectInspector;

const {
  node: { createNode, getChildren, getValue, nodeIsPrimitive, NODE_TYPES },
  loadProperties: { loadItemProperties }
} = utils;

import actions from "../../../actions";
import { getAllPopupObjectProperties } from "../../../selectors";
import Popover from "../../shared/Popover";
import PreviewFunction from "../../shared/PreviewFunction";
import { isReactComponent, isImmutablePreview } from "../../../utils/preview";

import Svg from "../../shared/Svg";
import { createObjectClient } from "../../../client/firefox";

import "./Popup.css";

import type { EditorRange } from "../../../utils/editor/types";
import type { Coords } from "../../shared/Popover";

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

type State = {
  top: number
};

function inPreview(event) {
  const relatedTarget: Element = (event.relatedTarget: any);

  if (
    !relatedTarget ||
    (relatedTarget.classList &&
      relatedTarget.classList.contains("preview-expression"))
  ) {
    return true;
  }

  // $FlowIgnore
  const inPreviewSelection = document
    .elementsFromPoint(event.clientX, event.clientY)
    .some(el => el.classList.contains("preview-selection"));

  return inPreviewSelection;
}

export class Popup extends Component<Props, State> {
  marker: any;
  pos: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      top: 0
    };
  }

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

  onMouseLeave = (e: SyntheticMouseEvent<HTMLDivElement>) => {
    const relatedTarget: Element = (e.relatedTarget: any);

    if (!relatedTarget) {
      return this.props.onClose();
    }

    if (!inPreview(e)) {
      this.props.onClose();
    }
  };

  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.props.onClose();
    }
  };

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

  getObjectProperties() {
    const { popupObjectProperties } = this.props;
    const root = this.getRoot();
    const value = getValue(root);
    if (!value) {
      return null;
    }

    return popupObjectProperties[value.actor];
  }

  getChildren() {
    const properties = this.getObjectProperties();
    const root = this.getRoot();

    if (!properties) {
      return null;
    }

    const children = getChildren({
      item: root,
      loadedProperties: new Map([[root.path, properties]])
    });

    if (children.length > 0) {
      return children;
    }

    return null;
  }

  calculateMaxHeight = () => {
    const { editorRef } = this.props;
    if (!editorRef) {
      return "auto";
    }
    return editorRef.getBoundingClientRect().height - this.state.top;
  };

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

  renderReact(react: Object) {
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
    const { extra, value } = this.props;
    const root = this.getRoot();

    if (nodeIsPrimitive(root)) {
      return null;
    }

    let roots = this.getChildren();
    if (!Array.isArray(roots) || roots.length === 0) {
      return null;
    }

    let header = null;
    if (extra.immutable && isImmutablePreview(value)) {
      header = this.renderImmutable(extra.immutable);
      roots = roots.filter(r => r.type != NODE_TYPES.PROTOTYPE);
    } else if (extra.react && isReactComponent(this.getObjectProperties())) {
      header = this.renderReact(extra.react);
      roots = roots.filter(r => ["state", "props"].includes(r.name));
    }

    return (
      <div
        className="preview-popup"
        style={{ maxHeight: this.calculateMaxHeight() }}
      >
        {header}
        {this.renderObjectInspector(roots)}
      </div>
    );
  }

  renderSimplePreview(value: any) {
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
    // We don't have to check and
    // return on `false`, `""`, `0`, `undefined` etc,
    // these falsy simple typed value because we want to
    // do `renderSimplePreview` on these values below.
    const { value } = this.props;

    if (value && value.class === "Function") {
      return this.renderFunctionPreview();
    }

    if (value && value.type === "object") {
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

  onPopoverCoords = (coords: Coords) => {
    this.setState({ top: coords.top });
  };

  render() {
    const { popoverPos, value, editorRef } = this.props;
    const type = this.getPreviewType(value);

    if (value && value.type === "object" && !this.getChildren()) {
      return null;
    }

    return (
      <Popover
        targetPosition={popoverPos}
        onMouseLeave={this.onMouseLeave}
        onKeyDown={this.onKeyDown}
        type={type}
        onPopoverCoords={this.onPopoverCoords}
        editorRef={editorRef}
      >
        {this.renderPreview()}
      </Popover>
    );
  }
}

const mapStateToProps = state => ({
  popupObjectProperties: getAllPopupObjectProperties(state)
});

const {
  addExpression,
  selectSourceURL,
  selectLocation,
  setPopupObjectProperties,
  openLink
} = actions;

const mapDispatchToProps = {
  addExpression,
  selectSourceURL,
  selectLocation,
  setPopupObjectProperties,
  openLink
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Popup);
