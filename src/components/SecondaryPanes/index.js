/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import { isGeneratedId } from "devtools-source-map";
import { connect } from "../../utils/connect";
import { List } from "immutable";

import actions from "../../actions";
import {
  getTopFrame,
  getBreakpointsList,
  getBreakpointsDisabled,
  getBreakpointsLoading,
  getExpressions,
  getIsWaitingOnBreak,
  getPauseCommand,
  getMapScopes,
  getSelectedFrame,
  getShouldPauseOnExceptions,
  getShouldPauseOnCaughtExceptions,
  getWorkers,
  getCurrentThread
} from "../../selectors";

import AccessibleImage from "../shared/AccessibleImage";
import { prefs, features } from "../../utils/prefs";

import Breakpoints from "./Breakpoints";
import Expressions from "./Expressions";
import SplitBox from "devtools-splitter";
import Frames from "./Frames";
import Workers from "./Workers";
import Accordion from "../shared/Accordion";
import CommandBar from "./CommandBar";
import UtilsBar from "./UtilsBar";
import XHRBreakpoints from "./XHRBreakpoints";
import EventListeners from "./EventListeners";
import WhyPaused from "./WhyPaused";

import Scopes from "./Scopes";

import "./SecondaryPanes.css";

import type { Expression, Frame, WorkerList } from "../../types";

type AccordionPaneItem = {
  header: string,
  component: any,
  opened?: boolean,
  onToggle?: () => void,
  shouldOpen?: () => boolean,
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
      <AccessibleImage className={type} title={tooltip} aria-label={tooltip} />
    </button>
  );
}

type State = {
  showExpressionsInput: boolean,
  showXHRInput: boolean
};

type Props = {
  expressions: List<Expression>,
  hasFrames: boolean,
  horizontal: boolean,
  breakpoints: Object,
  selectedFrame: ?Frame,
  breakpointsDisabled: boolean,
  breakpointsLoading: boolean,
  isWaitingOnBreak: boolean,
  renderWhyPauseDelay: number,
  shouldMapScopes: boolean,
  shouldPauseOnExceptions: boolean,
  shouldPauseOnCaughtExceptions: boolean,
  workers: WorkerList,
  toggleShortcutsModal: () => void,
  toggleAllBreakpoints: typeof actions.toggleAllBreakpoints,
  toggleMapScopes: typeof actions.toggleMapScopes,
  evaluateExpressions: typeof actions.evaluateExpressions,
  pauseOnExceptions: typeof actions.pauseOnExceptions,
  breakOnNext: typeof actions.breakOnNext
};

const mdnLink =
  "https://developer.mozilla.org/docs/Tools/Debugger/Using_the_Debugger_map_scopes_feature?utm_source=devtools&utm_medium=debugger-map-scopes";

class SecondaryPanes extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showExpressionsInput: false,
      showXHRInput: false
    };
  }

  onExpressionAdded = () => {
    this.setState({ showExpressionsInput: false });
  };

  onXHRAdded = () => {
    this.setState({ showXHRInput: false });
  };

  renderBreakpointsToggle() {
    const {
      toggleAllBreakpoints,
      breakpoints,
      breakpointsDisabled,
      breakpointsLoading
    } = this.props;
    const isIndeterminate =
      !breakpointsDisabled && breakpoints.some(x => x.disabled);

    if (features.skipPausing || breakpoints.length === 0) {
      return null;
    }

    const inputProps = {
      type: "checkbox",
      "aria-label": breakpointsDisabled
        ? L10N.getStr("breakpoints.enable")
        : L10N.getStr("breakpoints.disable"),
      className: "breakpoints-toggle",
      disabled: breakpointsLoading,
      key: "breakpoints-toggle",
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
    const { expressions } = this.props;

    const buttons = [];

    if (expressions.size) {
      buttons.push(
        debugBtn(
          evt => {
            evt.stopPropagation();
            this.props.evaluateExpressions();
          },
          "refresh",
          "refresh",
          L10N.getStr("watchExpressions.refreshButton")
        )
      );
    }

    buttons.push(
      debugBtn(
        evt => {
          if (prefs.expressionsVisible) {
            evt.stopPropagation();
          }
          this.setState({ showExpressionsInput: true });
        },
        "plus",
        "plus",
        L10N.getStr("expressions.placeholder")
      )
    );

    return buttons;
  }

  xhrBreakpointsHeaderButtons() {
    const buttons = [];

    buttons.push(
      debugBtn(
        evt => {
          if (prefs.xhrBreakpointsVisible) {
            evt.stopPropagation();
          }
          this.setState({ showXHRInput: true });
        },
        "plus",
        "plus",
        L10N.getStr("xhrBreakpoints.label")
      )
    );

    return buttons;
  }

  getScopeItem(): AccordionPaneItem {
    return {
      header: L10N.getStr("scopes.header"),
      className: "scopes-pane",
      component: <Scopes />,
      opened: prefs.scopesVisible,
      buttons: this.getScopesButtons(),
      onToggle: opened => {
        prefs.scopesVisible = opened;
      }
    };
  }

  getScopesButtons() {
    const { selectedFrame, shouldMapScopes } = this.props;

    if (
      !features.mapScopes ||
      !selectedFrame ||
      isGeneratedId(selectedFrame.location.sourceId)
    ) {
      return null;
    }

    return [
      <div>
        <label
          className="map-scopes-header"
          title={L10N.getStr("scopes.mapping.label")}
          onClick={e => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={shouldMapScopes ? "checked" : ""}
            onChange={e => this.props.toggleMapScopes()}
          />
          {L10N.getStr("scopes.map.label")}
        </label>
        <a
          className="mdn"
          target="_blank"
          href={mdnLink}
          onClick={e => e.stopPropagation()}
          title={L10N.getStr("scopes.helpTooltip.label")}
        >
          <AccessibleImage className="shortcuts" />
        </a>
      </div>
    ];
  }

  getWatchItem(): AccordionPaneItem {
    return {
      header: L10N.getStr("watchExpressions.header"),
      className: "watch-expressions-pane",
      buttons: this.watchExpressionHeaderButtons(),
      component: (
        <Expressions
          showInput={this.state.showExpressionsInput}
          onExpressionAdded={this.onExpressionAdded}
        />
      ),
      opened: prefs.expressionsVisible,
      onToggle: opened => {
        prefs.expressionsVisible = opened;
      }
    };
  }

  getXHRItem(): AccordionPaneItem {
    return {
      header: L10N.getStr("xhrBreakpoints.header"),
      className: "xhr-breakpoints-pane",
      buttons: this.xhrBreakpointsHeaderButtons(),
      component: (
        <XHRBreakpoints
          showInput={this.state.showXHRInput}
          onXHRAdded={this.onXHRAdded}
        />
      ),
      opened: prefs.xhrBreakpointsVisible,
      onToggle: opened => {
        prefs.xhrBreakpointsVisible = opened;
      }
    };
  }

  getCallStackItem(): AccordionPaneItem {
    return {
      header: L10N.getStr("callStack.header"),
      className: "call-stack-pane",
      component: <Frames />,
      opened: prefs.callStackVisible,
      onToggle: opened => {
        prefs.callStackVisible = opened;
      }
    };
  }

  getWorkersItem(): AccordionPaneItem {
    return {
      header: features.windowlessWorkers
        ? L10N.getStr("threadsHeader")
        : L10N.getStr("workersHeader"),
      className: "workers-pane",
      component: <Workers />,
      opened: prefs.workersVisible,
      onToggle: opened => {
        prefs.workersVisible = opened;
      }
    };
  }

  getBreakpointsItem(): AccordionPaneItem {
    const {
      shouldPauseOnExceptions,
      shouldPauseOnCaughtExceptions,
      pauseOnExceptions
    } = this.props;

    return {
      header: L10N.getStr("breakpoints.header"),
      className: "breakpoints-pane",
      buttons: [this.renderBreakpointsToggle()],
      component: (
        <Breakpoints
          shouldPauseOnExceptions={shouldPauseOnExceptions}
          shouldPauseOnCaughtExceptions={shouldPauseOnCaughtExceptions}
          pauseOnExceptions={pauseOnExceptions}
        />
      ),
      opened: prefs.breakpointsVisible,
      onToggle: opened => {
        prefs.breakpointsVisible = opened;
      }
    };
  }

  getEventListenersItem(): AccordionPaneItem {
    return {
      header: L10N.getStr("eventListenersHeader"),
      className: "event-listeners-pane",
      buttons: [],
      component: <EventListeners />,
      opened: prefs.eventListenersVisible,
      onToggle: opened => {
        prefs.eventListenersVisible = opened;
      }
    };
  }

  getStartItems(): AccordionPaneItem[] {
    const items: AccordionPaneItem[] = [];
    const { horizontal, hasFrames } = this.props;

    if (horizontal) {
      if (features.workers && this.props.workers.length > 0) {
        items.push(this.getWorkersItem());
      }

      items.push(this.getWatchItem());
    }

    items.push(this.getBreakpointsItem());

    if (hasFrames) {
      items.push(this.getCallStackItem());
      if (horizontal) {
        items.push(this.getScopeItem());
      }
    }

    if (features.xhrBreakpoints) {
      items.push(this.getXHRItem());
    }

    if (features.eventListenersBreakpoints) {
      items.push(this.getEventListenersItem());
    }

    return items;
  }

  getEndItems(): AccordionPaneItem[] {
    if (this.props.horizontal) {
      return [];
    }

    const items: AccordionPaneItem[] = [];
    if (features.workers && this.props.workers.length > 0) {
      items.push(this.getWorkersItem());
    }

    items.push(this.getWatchItem());

    if (this.props.hasFrames) {
      items.push(this.getScopeItem());
    }

    return items;
  }

  getItems(): AccordionPaneItem[] {
    return [...this.getStartItems(), ...this.getEndItems()];
  }

  renderHorizontalLayout() {
    const { renderWhyPauseDelay } = this.props;

    return (
      <div>
        <WhyPaused delay={renderWhyPauseDelay} />
        <Accordion items={this.getItems()} />
      </div>
    );
  }

  renderVerticalLayout() {
    return (
      <div>
        <SplitBox
          initialSize="300px"
          minSize={10}
          maxSize="50%"
          splitterSize={1}
          startPanel={
            <div style={{ width: "inherit" }}>
              <WhyPaused delay={this.props.renderWhyPauseDelay} />
              <Accordion items={this.getStartItems()} />
            </div>
          }
          endPanel={<Accordion items={this.getEndItems()} />}
        />
      </div>
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
      <div className="secondary-panes-wrapper">
        <CommandBar horizontal={this.props.horizontal} />
        <div className="secondary-panes">
          {this.props.horizontal
            ? this.renderHorizontalLayout()
            : this.renderVerticalLayout()}
        </div>
        {this.renderUtilsBar()}
      </div>
    );
  }
}

// Checks if user is in debugging mode and adds a delay preventing
// excessive vertical 'jumpiness'
function getRenderWhyPauseDelay(state, thread) {
  const inPauseCommand = !!getPauseCommand(state, thread);

  if (!inPauseCommand) {
    return 100;
  }

  return 0;
}

const mapStateToProps = state => {
  const thread = getCurrentThread(state);

  return {
    expressions: getExpressions(state),
    hasFrames: !!getTopFrame(state, thread),
    breakpoints: getBreakpointsList(state),
    breakpointsDisabled: getBreakpointsDisabled(state),
    breakpointsLoading: getBreakpointsLoading(state),
    isWaitingOnBreak: getIsWaitingOnBreak(state, thread),
    renderWhyPauseDelay: getRenderWhyPauseDelay(state, thread),
    selectedFrame: getSelectedFrame(state, thread),
    shouldMapScopes: getMapScopes(state),
    shouldPauseOnExceptions: getShouldPauseOnExceptions(state),
    shouldPauseOnCaughtExceptions: getShouldPauseOnCaughtExceptions(state),
    workers: getWorkers(state)
  };
};

export default connect(
  mapStateToProps,
  {
    toggleAllBreakpoints: actions.toggleAllBreakpoints,
    evaluateExpressions: actions.evaluateExpressions,
    pauseOnExceptions: actions.pauseOnExceptions,
    toggleMapScopes: actions.toggleMapScopes,
    breakOnNext: actions.breakOnNext
  }
)(SecondaryPanes);
