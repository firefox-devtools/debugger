/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { PureComponent } from "react";
import { connect } from "react-redux";
import actions from "../../actions";
import classNames from "classnames";

import { getExtra, getSelectedComponentIndex } from "../../selectors";

import "./Frames/Frames.css";

type Props = {
  extra: Object,
  selectedComponentIndex: number,
  selectComponent: Function
};

class ReactComponentStack extends PureComponent<Props> {
  onMouseDown(e: SyntheticKeyboardEvent<HTMLElement>, componentIndex: number) {
    if (e.nativeEvent.which == 3) {
      return;
    }
    this.props.selectComponent(componentIndex);
  }

  render() {
    const { componentStack } = this.props.extra.react;
    return (
      <div className="pane frames">
        <ul>
          {componentStack
            .slice()
            .reverse()
            .map((component, index) => (
              <li
                className={classNames("frame", {
                  selected: this.props.selectedComponentIndex === index
                })}
                key={index}
                onMouseDown={e => this.onMouseDown(e, index)}
              >
                {component}
              </li>
            ))}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  extra: getExtra(state),
  selectedComponentIndex: getSelectedComponentIndex(state)
});

export default connect(mapStateToProps, actions)(ReactComponentStack);
