// @flow
import { DOM as dom, Component, createFactory } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import actions from "../actions";
import { getPaneCollapse } from "../selectors";
import { formatKeyShortcut } from "../utils/text";

import _PaneToggleButton from "./shared/Button/PaneToggle";
const PaneToggleButton = createFactory(_PaneToggleButton);

import "./WelcomeBox.css";

type Props = {
  horizontal: boolean,
  togglePaneCollapse: Function,
  endPanelCollapsed: boolean
};

class WelcomeBox extends Component {
  props: Props;

  renderToggleButton() {
    if (this.props.horizontal) {
      return;
    }

    return PaneToggleButton({
      position: "end",
      collapsed: !this.props.endPanelCollapsed,
      horizontal: this.props.horizontal,
      handleClick: this.props.togglePaneCollapse
    });
  }

  render() {
    const searchLabel = L10N.getFormatStr(
      "welcome.search",
      formatKeyShortcut(L10N.getStr("sources.search.key"))
    );
    return dom.div(
      { className: "welcomebox" },
      searchLabel,
      this.renderToggleButton()
    );
  }
}

WelcomeBox.displayName = "WelcomeBox";

export default connect(
  state => ({
    endPanelCollapsed: getPaneCollapse(state, "end")
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(WelcomeBox);
