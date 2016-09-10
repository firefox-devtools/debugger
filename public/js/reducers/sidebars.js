// @flow
const makeRecord = require("../utils/makeRecord");
const C = require("../constants");

import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type SidebarState = {
  collapsed: boolean,
  side: "left" | "right",
};

const State = makeRecord(({
  collapsed: false,
  side: "left",
} : SidebarState));

function update(state = State(), action: Action) : Record<SidebarState> {
  switch (action.type) {
    case C.COLLAPSE_SIDEBAR: {
      return state.merge({
        collapsed: action.collapsed,
        side: action.side || state.side
      });
    }
  }

  return state;
}

module.exports = {
  State,
  update
};
