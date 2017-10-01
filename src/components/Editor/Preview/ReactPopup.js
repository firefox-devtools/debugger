// @flow
import React, { Component } from "react";

import "./ReactPopup.css";

class ReactPopup extends Component {
  props: {
    roots: Array<Object>
  };

  renderComponentAttributes(root: Object) {
    if (!("preview" in root.contents.value)) {
      return <span className="none">none</span>;
    }
    const attributes = root.contents.value.preview.ownProperties;

    return Object.keys(attributes).map(key => {
      const val = attributes[key].value;
      let content = "";

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
        <li key={key} className>
          <span className="attrKey">{key}: </span>
          <span className={typeof val}>{content}</span>
        </li>
      );
    });
  }

  renderReactPreview() {
    const roots = this.props.roots.filter(r =>
      ["state", "props"].includes(r.name)
    );

    return (
      <div className="react-popup">
        <div className="react-popup-section">
          <h2>State</h2>
          <ul>{this.renderComponentAttributes(roots[1])}</ul>
        </div>
        <div className="react-popup-section">
          <h2>Props</h2>
          <ul>{this.renderComponentAttributes(roots[0])}</ul>
        </div>
      </div>
    );
  }

  render() {
    return this.renderReactPreview();
  }
}

export default ReactPopup;
