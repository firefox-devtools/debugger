/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { PureComponent } from "react";
import { connect } from "../../utils/connect";

import { getPauseReason } from "../../utils/pause";
import { 
  getPaneCollapse,
  getPauseReason as getWhy
} from "../../selectors";
import type { Grip, ExceptionReason } from "../../types";

import "./WhyPaused.css";

type Props = {
  endPanelCollapsed: boolean,
  delay: Number,
  why: Why
}

type State = {
  hideWhyPaused: string
}

class WhyPaused extends PureComponent<Props> {
  constructor(props) {
    super(props);
    this.state = { hideWhyPaused: '' };
  }

  componentDidUpdate() {
    const { delay } = this.props;

    if (delay) {
      this.hide = setTimeout(() => {
        this.setState({ hideWhyPaused: ''});
      }, delay);
    } else {
      this.setState({ hideWhyPaused: 'pane why-paused'});
    }
  }

  renderExceptionSummary(exception: string | Grip) {
    if (typeof exception === "string") {
      return exception;
    }

    const preview = exception.preview;
    if (!preview || !preview.name || !preview.message) {
      return;
    }

    return `${preview.name}: ${preview.message}`;
  }

  renderMessage(why: ExceptionReason) {
    if (why.type == "exception" && why.exception) {
      return (
        <div className={"message warning"}>
          {renderExceptionSummary(why.exception)}
        </div>
      );
    }

    if (typeof why.message == "string") {
      return <div className={"message"}>{why.message}</div>;
    }

    return null;
  }

  render() {
    const { endPanelCollapsed, why } = this.props;
    const reason = getPauseReason(why);

    if (reason) {
      if (!endPanelCollapsed) {
        return (
          <div className={"pane why-paused"}>
            <div>
              <div>{L10N.getStr(reason)}</div>
              {this.renderMessage(why)}
            </div>
          </div>
        );
      // End panel collapsed. WIP  
      } else {
        return null;
      }
    }
    
    return <div className={this.state.hideWhyPaused} />;
  }
}

const mapStateToProps = state => ({
  endPanelCollapsed: getPaneCollapse(state, "end"),
  why: getWhy(state)
});

export default connect(mapStateToProps)(WhyPaused);
