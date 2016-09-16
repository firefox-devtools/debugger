// @flow
const I = require("immutable");
const makeRecord = require("../utils/makeRecord");
const C = require("../constants");

import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type SidebarState = {
  collapsed: boolean,
  width: number,
};

export type SidebarsState = {
  left: I.Map<string, SidebarState>,
  right: I.Map<string, SidebarState>,
};

const State = makeRecord(({
  left: I.Map({
    collapsed: false,
    width: 300,
  }),
  right: I.Map({
    collapsed: false,
    width: 300,
  }),
} : SidebarsState));

function update(state = State(), action: Action) : Record<SidebarsState> {
  switch (action.type) {
    case C.TOGGLE_SIDEBAR: {
      return state.mergeIn([action.side], {
        collapsed: action.collapsed,
      });
    }
    case C.RESIZE_SIDEBAR: {
      return state.mergeIn([action.side], {
        width: action.width,
      });
    }
  }

  return state;
}
// Selectors

type OuterState = { ui: Record<SidebarsState> };

function getSidebarDimensions(state: OuterState) {
  return state.ui;
}

function getSidebarCollapsed(state: OuterState, side: string) {
  return state.ui.getIn([side, "collapsed"]);
}

function getSidebarWidth(state: OuterState, side: string) {
  return state.ui.getIn([side, "width"]);
}

module.exports = {
  State,
  update,
  getSidebarDimensions,
  getSidebarCollapsed,
  getSidebarWidth
};
