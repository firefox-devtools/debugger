// @flow
import React, { PropTypes, Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { features } from "../../utils/prefs";
import ImPropTypes from "react-immutable-proptypes";

import actions from "../../actions";
import {
  getPause,
  getBreakpoints,
  getBreakpointsDisabled,
  getBreakpointsLoading
} from "../../selectors";

import { isEnabled } from "devtools-config";
import Svg from "../shared/Svg";
import { prefs } from "../../utils/prefs";

import Breakpoints from "./Breakpoints";
import Expressions from "./Expressions";
import SplitBox from "devtools-splitter";
import Frames from "./Frames";
import EventListeners from "./EventListeners";
import Workers from "./Workers";
import Accordion from "../shared/Accordion";
import CommandBar from "./CommandBar";
import UtilsBar from "./UtilsBar";

import _chromeScopes from "./ChromeScopes";
import _Scopes from "./Scopes";

const Scopes = isEnabled("chromeScopes") ? _chromeScopes : _Scopes;

import "./SecondaryPanes.css";

type SecondaryPanesItems = {
  header: string,
  component: any,
  opened?: boolean,
  onToggle?: () => void,
  shouldOpen?: () => void,
  buttons?: any
};

function debugBtn(onClick, type, className, tooltip) {
  return (
    <button
      onClick={onClick}
      className={`${type} ${className}`}
      key={type}
      title={tooltip}
    >
      <Svg name={type} title={tooltip} aria-label={tooltip} />
    </button>
  );
}

class SecondaryPanes extends Component {
  renderBreakpointsToggle() {
    const {
      toggleAllBreakpoints,
      breakpoints,
      breakpointsDisabled,
      breakpointsLoading
    } = this.props;
    const boxClassName = "breakpoints-toggle";
    const isIndeterminate =
      !breakpointsDisabled && breakpoints.some(x => x.disabled);

    if (breakpoints.size == 0) {
      return null;
    }

    const inputProps = {
      type: "checkbox",
      "aria-label": breakpointsDisabled
        ? L10N.getStr("breakpoints.enable")
        : L10N.getStr("breakpoints.disable"),
      className: boxClassName,
      disabled: breakpointsLoading,
      onChange: e => {
        e.stopPropagation();
        toggleAllBreakpoints(!breakpointsDisabled);
      },
      onClick: e => e.stopPropagation(),
      checked: !breakpointsDisabled && !isIndeterminate,
      ref: input => {
        if (input) {
          input.indeterminate = isIndeterminate;
        }
      },
      title: breakpointsDisabled
        ? L10N.getStr("breakpoints.enable")
        : L10N.getStr("breakpoints.disable")
    };

    return <input {...inputProps} />;
  }

  watchExpressionHeaderButtons() {
    return [
      debugBtn(
        evt => {
          evt.stopPropagation();
          this.props.evaluateExpressions();
        },
        "refresh",
        "refresh",
        L10N.getStr("watchExpressions.refreshButton")
      )
    ];
  }

  getScopeItem() {
    const isPaused = () => !!this.props.pauseData;

    return {
      header: L10N.getStr("scopes.header"),
      component: Scopes,
      opened: prefs.scopesVisible,
      onToggle: opened => {
        prefs.scopesVisible = opened;
      },
      shouldOpen: isPaused
    };
  }

  getWatchItem() {
    return {
      header: L10N.getStr("watchExpressions.header"),
      buttons: this.watchExpressionHeaderButtons(),
      component: Expressions,
      opened: true
    };
  }

  getStartItems() {
    const scopesContent: any = this.props.horizontal
      ? this.getScopeItem()
      : null;
    const isPaused = () => !!this.props.pauseData;

    const items: Array<SecondaryPanesItems> = [
      {
        header: L10N.getStr("breakpoints.header"),
        buttons: this.renderBreakpointsToggle(),
        component: Breakpoints,
        opened: true
      },
      {
        header: L10N.getStr("callStack.header"),
        component: Frames,
        opened: prefs.callStackVisible,
        onToggle: opened => {
          prefs.callStackVisible = opened;
        },
        shouldOpen: isPaused
      },
      scopesContent
    ];

    if (isEnabled("eventListeners")) {
      items.push({
        header: L10N.getStr("eventListenersHeader"),
        component: EventListeners
      });
    }

    if (isEnabled("workers")) {
      items.push({
        header: L10N.getStr("workersHeader"),
        component: Workers
      });
    }

    if (this.props.horizontal) {
      items.unshift(this.getWatchItem());
    }

    return items.filter(item => item);
  }

  renderHorizontalLayout() {
    return <Accordion items={this.getItems()} />;
  }

  getEndItems() {
    const items: Array<SecondaryPanesItems> = [];

    if (!this.props.horizontal) {
      items.unshift(this.getScopeItem());
    }

    if (!this.props.horizontal) {
      items.unshift(this.getWatchItem());
    }

    return items;
  }

  getItems() {
    return [...this.getStartItems(), ...this.getEndItems()];
  }

  renderVerticalLayout() {
    return (
      <SplitBox
        initialSize="300px"
        minSize={10}
        maxSize="50%"
        splitterSize={1}
        startPanel={<Accordion items={this.getStartItems()} />}
        endPanel={<Accordion items={this.getEndItems()} />}
      />
    );
  }

  renderUtilsBar() {
    if (!features.shortcuts) {
      return;
    }

    return (
      <UtilsBar
        horizontal={this.props.horizontal}
        toggleShortcutsModal={this.props.toggleShortcutsModal}
      />
    );
  }

  render() {
    return (
      <div className="secondary-panes secondary-panes--sticky-commandbar">
        <CommandBar horizontal={this.props.horizontal} />
        {this.props.horizontal
          ? this.renderHorizontalLayout()
          : this.renderVerticalLayout()}
        {this.renderUtilsBar()}
      </div>
    );
  }
}

SecondaryPanes.propTypes = {
  evaluateExpressions: PropTypes.func.isRequired,
  pauseData: PropTypes.object,
  horizontal: PropTypes.bool,
  breakpoints: ImPropTypes.map.isRequired,
  breakpointsDisabled: PropTypes.bool,
  breakpointsLoading: PropTypes.bool,
  toggleAllBreakpoints: PropTypes.func.isRequired,
  toggleShortcutsModal: PropTypes.func
};

SecondaryPanes.contextTypes = {
  shortcuts: PropTypes.object
};

export default connect(
  state => ({
    pauseData: getPause(state),
    breakpoints: getBreakpoints(state),
    breakpointsDisabled: getBreakpointsDisabled(state),
    breakpointsLoading: getBreakpointsLoading(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(SecondaryPanes);
