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

  render() {
    const { pauseInfo } = this.props;
    const reason = getPauseReason(pauseInfo);
    const message = pauseInfo ? pauseInfo.getIn(["why"]).get("message") : null;

    // => here
    return reason ?
      dom.div({ className: "pane why-paused" }, [
        dom.div(null, L10N.getStr(reason)),
        message ? dom.div(null, message) : null])
        : null;
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
