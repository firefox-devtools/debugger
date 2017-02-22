// @flow
import { DOM as dom, Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ImPropTypes from "react-immutable-proptypes";
import actions from "../../actions";
import { getPause } from "../../selectors";

import { getPauseReason } from "../../utils/pause";

import "./WhyPaused.css";

class WhyPaused extends Component {

  renderMessage(pauseInfo) {
    if (!pauseInfo) {
      return null;
    }

    const message = pauseInfo.getIn(["why"]).get("message");
    if (!message) {
      return null;
    }

    return dom.div(null, message);
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
