/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { PureComponent } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import actions from "../../actions";

import { createObjectClient } from "../../client/firefox";

import { getSelectedFrame, getAllPopupObjectProperties } from "../../selectors";

import { ObjectInspector, ObjectInspectorUtils } from "devtools-reps";
import { isReactComponent } from "../../utils/preview";

const { createNode, getChildren } = ObjectInspectorUtils.node;
const { loadItemProperties } = ObjectInspectorUtils.loadProperties;

type Props = {
  setPopupObjectProperties: (Object, Object) => void,
  frame: any,
  popupObjectProperties: Object
};

class FrameworkComponent extends PureComponent<Props> {
  async componentWillMount() {
    const expression = "this;";
    const { frame, setPopupObjectProperties } = this.props;
    const value = frame.this;

    const root = createNode(null, expression, expression, { value });
    const properties = await loadItemProperties(root, createObjectClient);
    if (properties) {
      setPopupObjectProperties(value, properties);
    }
  }

  renderReactComponent() {
    const { frame, popupObjectProperties } = this.props;
    const expression = "this;";
    const value = frame.this;
    const root = {
      name: expression,
      path: expression,
      contents: { value }
    };

    const loadedRootProperties = popupObjectProperties[value.actor];

    let roots = getChildren({
      item: root,
      loadedProperties: new Map([[root.path, loadedRootProperties]])
    });

    roots = roots.filter(r => ["state", "props"].includes(r.name));

    return (
      <div className="pane framework-component">
        <ObjectInspector
          roots={roots}
          autoExpandAll={false}
          autoExpandDepth={0}
          disableWrap={true}
          disabledFocus={true}
          dimTopLevelWindow={true}
          createObjectClient={grip => createObjectClient(grip)}
        />
      </div>
    );
  }

  render() {
    const { frame } = this.props;
    if (isReactComponent(frame.this)) {
      return this.renderReactComponent();
    }

    return null;
  }
}

export default connect(
  state => {
    return {
      frame: getSelectedFrame(state),
      popupObjectProperties: getAllPopupObjectProperties(state)
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(FrameworkComponent);
