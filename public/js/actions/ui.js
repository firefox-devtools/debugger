// @flow

/**
 * Redux actions for UI
 * @module actions/ui
 */

const C = require("../constants");
import type { SidebarSide } from "./types";
const { getSidebarCollapsed } = require("../selectors");

type ThunkArgs = {
  dispatch: any,
  getState: any,
  client: any
};

/**
 * toggle a sidebar's collapse state
 *
 * @memberof actions/ui
 * @static
 */
function toggleSidebar(side: SidebarSide) {
  return ({ dispatch, getState } : ThunkArgs) => {
    let collapsed = !getSidebarCollapsed(getState(), side);
    return dispatch({ type: C.TOGGLE_SIDEBAR, side, collapsed });
  };
}

/**
 * resize a sidebar
 *
 * @memberof actions/ui
 * @static
 */
function resizeSidebar(side: SidebarSide, width: number) {
  return ({ dispatch }: ThunkArgs) => {
    return dispatch({ type: C.RESIZE_SIDEBAR, side, width });
  };
}

module.exports = {
  toggleSidebar,
  resizeSidebar
};
