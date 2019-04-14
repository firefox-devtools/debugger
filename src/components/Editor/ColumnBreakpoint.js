/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { PureComponent } from "react";
import classnames from "classnames";
import { showMenu } from "devtools-contextmenu";

import { getDocument } from "../../utils/editor";
import { breakpointItems, createBreakpointItems } from "./menus/breakpoints";

// eslint-disable-next-line max-len
import type { ColumnBreakpoint as ColumnBreakpointType } from "../../selectors/visibleColumnBreakpoints";
import type { BreakpointItemActions } from "./menus/breakpoints";
import type { Source } from "../../types";

type Bookmark = {
  clear: Function
};

type Props = {
  editor: Object,
  source: Source,
  columnBreakpoint: ColumnBreakpointType,
  breakpointActions: BreakpointItemActions
};

const breakpointButton = document.createElement("button");
breakpointButton.innerHTML =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 13" width="11" height="13"><path d="M5.07.5H1.5c-.54 0-1 .46-1 1v10c0 .54.46 1 1 1h3.57c.58 0 1.15-.26 1.53-.7l3.7-5.3-3.7-5.3C6.22.76 5.65.5 5.07.5z"/></svg>';

function makeBookmark({ breakpoint }, { onClick, onContextMenu }) {
  const bp = breakpointButton.cloneNode(true);

  const isActive = breakpoint && !breakpoint.disabled;
  const isDisabled = breakpoint && breakpoint.disabled;
  const condition = breakpoint && breakpoint.options.condition;
  const logValue = breakpoint && breakpoint.options.logValue;

  bp.className = classnames("column-breakpoint", {
    "has-condition": condition,
    "has-log": logValue,
    active: isActive,
    disabled: isDisabled
  });

  if (condition) {
    bp.setAttribute("title", condition);
  }
  bp.onclick = onClick;

  // NOTE: flow does not know about oncontextmenu
  (bp: any).oncontextmenu = onContextMenu;

  return bp;
}

export default class ColumnBreakpoint extends PureComponent<Props> {
  addColumnBreakpoint: Function;
  bookmark: ?Bookmark;

  addColumnBreakpoint = (nextProps: ?Props) => {
    const { columnBreakpoint, source } = nextProps || this.props;

    const sourceId = source.id;
    const doc = getDocument(sourceId);
    if (!doc) {
      return;
    }

    const { line, column } = columnBreakpoint.location;
    const widget = makeBookmark(columnBreakpoint, {
      onClick: this.onClick,
      onContextMenu: this.onContextMenu
    });

    this.bookmark = doc.setBookmark({ line: line - 1, ch: column }, { widget });
  };

  clearColumnBreakpoint = () => {
    if (this.bookmark) {
      this.bookmark.clear();
      this.bookmark = null;
    }
  };

  onClick = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const { columnBreakpoint, breakpointActions } = this.props;
    if (columnBreakpoint.breakpoint) {
      breakpointActions.removeBreakpoint(columnBreakpoint.breakpoint);
    } else {
      breakpointActions.addBreakpoint(columnBreakpoint.location);
    }
  };

  onContextMenu = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const {
      columnBreakpoint: { breakpoint, location },
      breakpointActions
    } = this.props;

    const items = breakpoint
      ? breakpointItems(breakpoint, breakpointActions)
      : createBreakpointItems(location, breakpointActions);

    showMenu(event, items);
  };

  componentDidMount() {
    this.addColumnBreakpoint();
  }

  componentWillUnmount() {
    this.clearColumnBreakpoint();
  }

  componentDidUpdate() {
    this.clearColumnBreakpoint();
    this.addColumnBreakpoint();
  }

  render() {
    return null;
  }
}
