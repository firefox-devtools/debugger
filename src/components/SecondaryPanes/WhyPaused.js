// @flow
import { DOM as dom, PropTypes, Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import actions from "../../actions";
import { getPause } from "../../selectors";
import isString from "lodash/isString";

import { getPauseReason } from "../../utils/pause";
import type { Pause } from "debugger-html";

import "./WhyPaused.css";
const get = require("lodash/get");

function renderExceptionSummary(exception) {
  if (isString(exception)) {
    return exception;
  }

  const message = get(exception, "preview.message");
  const name = get(exception, "preview.name");

  return `${name}: ${message}`;
}

class WhyPaused extends Component {
  renderMessage(pauseInfo: Pause) {
    if (!pauseInfo) {
      return null;
    }

    const message = get(pauseInfo, "why.message");
    if (message) {
      return dom.div({ className: "message" }, message);
    }

    const exception = get(pauseInfo, "why.exception");
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
  pauseInfo: PropTypes.object
};

export default connect(
  state => ({
    pauseInfo: getPause(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(WhyPaused);
