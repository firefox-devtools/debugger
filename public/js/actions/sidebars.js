// @flow

/**
 * Redux actions for sidebars
 * @module actions/sidebars
 */

const C = require("../constants");
const { getSidebarCollapsed } = require("../selectors");

type ThunkArgs = {
  dispatch: any,
  getState: any,
  client: any
}

type SidebarSide = "left" | "right";

/**
 * collapse a sidebar
 *
 * @memberof actions/sidebars
 * @static
 */
function collapseSidebar(side: SidebarSide) {
  return ({ dispatch, getState } : ThunkArgs) => {
    let collapsed = !getSidebarCollapsed(getState(), side);
    return dispatch({ type: C.COLLAPSE_SIDEBAR, side, collapsed });
  };
}

function resizeSidebar(side: SidebarSide, width: number) {
  return ({ dispatch }: ThunkArgs) => {
    return dispatch({ type: C.RESIZE_SIDEBAR, side, width });
  };
}

module.exports = {
  collapseSidebar,
  resizeSidebar
};
