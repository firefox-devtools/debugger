// @flow
const I = require("immutable");
const makeRecord = require("../utils/makeRecord");
const C = require("../constants");

import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

type SidebarState = {
  collapsed: boolean,
  width: number,
  prevWidth: number,
};

type SidebarsState = {
  left: I.Map<string, SidebarState>,
  right: I.Map<string, SidebarState>,
};

const State = makeRecord(({
  left: I.Map({
    collapsed: false,
    width: 300,
    prevWidth: 0
  }),
  right: I.Map({
    collapsed: false,
    width: 300,
    prevWidth: 0
  }),
} : SidebarsState));

function update(state = State(), action: Action) : Record<SidebarsState> {
  switch (action.type) {
    case C.COLLAPSE_SIDEBAR: {
      let width = state.get(action.side).get("width"),
        prevWidth = state.get(action.side).get("prevWidth");
      return state.mergeIn([action.side], {
        collapsed: action.collapsed,
        width: action.collapsed ? 0 : prevWidth,
        prevWidth: action.collapsed ? width : 0,
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

function getSidebarsState(state) {
  console.log(state);
  return state.sidebars;
}

function getSidebarCollapsed(state, side: string) {
  return state.sidebars.get(side).get("collapsed");
}

module.exports = {
  State,
  update,
  getSidebarsState,
  getSidebarCollapsed
};
