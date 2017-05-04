// @flow
import { DOM as dom, Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ImPropTypes from "react-immutable-proptypes";
import actions from "../../actions";
import { getPause } from "../../selectors";
import isString from "lodash/isString";

import { getPauseReason } from "../../utils/pause";
import type { Pause } from "debugger-html";

import "./WhyPaused.css";

function renderExceptionSummary(exception) {
  if (isString(exception)) {
    return exception;
  }

  const message = exception.getIn(["preview", "message"]);
  const name = exception.getIn(["preview", "name"]);

  return `${name}: ${message}`;
}

class WhyPaused extends Component {
  renderMessage(pauseInfo: Pause) {
    if (!pauseInfo) {
      return null;
    }

    const message = pauseInfo.getIn(["why", "message"]);
    if (message) {
      return dom.div({ className: "message" }, message);
    }

    const exception = pauseInfo.getIn(["why", "exception"]);
    if (exception) {
      return dom.div(
        { className: "message" },
        renderExceptionSummary(exception)
      );
    }

    return null;
  }

  render() {
    const { pauseInfo } = this.props;
    const reason = getPauseReason(pauseInfo);

    if (!reason) {
      return null;
    }

    return dom.div(
      { className: "pane why-paused" },
      dom.div(null, L10N.getStr(reason)),
      this.renderMessage(pauseInfo)
    );
  }
}

WhyPaused.displayName = "WhyPaused";

WhyPaused.propTypes = {
  pauseInfo: ImPropTypes.map
};

export default connect(
  state => ({
    pauseInfo: getPause(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(WhyPaused);
