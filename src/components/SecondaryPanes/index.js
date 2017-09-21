// @flow
import React, { PropTypes, Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ImPropTypes from "react-immutable-proptypes";

import actions from "../../actions";
import {
  getPause,
  getBreakpoints,
  getBreakpointsDisabled,
  getBreakpointsLoading,
  isPaused as getIsPaused,
  isStepping as getIsStepping
} from "../../selectors";

import { isEnabled } from "devtools-config";
import Svg from "../shared/Svg";
import { prefs } from "../../utils/prefs";
import { formatKey } from "../../utils/steppingShortcuts";
import Dropdown from "../shared/Dropdown";
import debugBtn from "../shared/debugBtn";

import Breakpoints from "./Breakpoints";
import Expressions from "./Expressions";
import SplitBox from "devtools-splitter";
import Frames from "./Frames";
import EventListeners from "./EventListeners";
import Workers from "./Workers";
import Accordion from "../shared/Accordion";
import CommandBar from "./CommandBar";

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

    return (
      <div className="breakpoints-buttons">
        {this.renderBreakpointsDropdown()}
        <input {...inputProps} />
      </div>
    );
  }

  renderBreakpointsDropdown() {
    const { breakOnNext } = this.props;
    const pauseBtn = debugBtn(
      breakOnNext,
      "pause",
      "active",
      L10N.getFormatStr("pauseButtonTooltip", formatKey("pause"))
    );
    const {
      shouldPauseOnExceptions,
      shouldIgnoreCaughtExceptions,
      pauseOnExceptions
    } = this.props;

    const dontPauseOnExceptionsBtn = debugBtn(
      () => pauseOnExceptions(true, true),
      "pause-exceptions",
      "enabled",
      L10N.getStr("ignoreExceptions")
    );

    const pauseOnCaughtExceptionsBtn = debugBtn(
      () => pauseOnExceptions(true, false),
      "pause-exceptions",
      "uncaught enabled",
      L10N.getStr("pauseOnUncaughtExceptions")
    );

    const pauseOnExceptionsBtn = debugBtn(
      () => pauseOnExceptions(false, false),
      "pause-exceptions",
      "all enabled",
      L10N.getStr("pauseOnExceptions")
    );

    const Panel = (
      <ul>
        <li>{pauseBtn} Pause on Next Statement</li>
        <li>{pauseOnCaughtExceptionsBtn} Pause on Uncaught Exceptions</li>
        <li>{pauseOnExceptionsBtn} Pause on Exceptions</li>
      </ul>
    );

    return <Dropdown panel={Panel} />;
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
    const { horizontal, isPaused, isStepping } = this.props;

    let scopesContent: any = null;

    let items: Array<SecondaryPanesItems> = [
      {
        header: L10N.getStr("breakpoints.header"),
        buttons: this.renderBreakpointsToggle(),
        component: Breakpoints,
        opened: true
      }
    ];

    if (horizontal && (isPaused || isStepping)) {
      items.push(this.getScopeItem());
    }

    if (isPaused || isStepping) {
      items.push({
        header: L10N.getStr("callStack.header"),
        component: Frames,
        opened: prefs.callStackVisible,
        onToggle: opened => {
          prefs.callStackVisible = opened;
        },
        shouldOpen: () => isPaused
      });
    }

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
    const { horizontal, isPaused, isStepping } = this.props;
    const items: Array<SecondaryPanesItems> = [];

    if (!horizontal && (isPaused || isStepping)) {
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
        style={{ width: "100vw" }}
        initialSize="300px"
        minSize={10}
        maxSize="50%"
        splitterSize={1}
        startPanel={<Accordion items={this.getStartItems()} />}
        endPanel={<Accordion items={this.getEndItems()} />}
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
  toggleAllBreakpoints: PropTypes.func.isRequired
};

SecondaryPanes.contextTypes = {
  shortcuts: PropTypes.object
};

SecondaryPanes.displayName = "SecondaryPanes";

export default connect(
  state => ({
    isPaused: getIsPaused(state),
    isStepping: getIsStepping(state),
    pauseData: getPause(state),
    breakpoints: getBreakpoints(state),
    breakpointsDisabled: getBreakpointsDisabled(state),
    breakpointsLoading: getBreakpointsLoading(state)
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(SecondaryPanes);
