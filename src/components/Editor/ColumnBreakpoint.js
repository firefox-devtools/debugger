/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { PureComponent } from "react";
import ReactDOM from "react-dom";
import classnames from "classnames";
import actions from "../../actions";
import { getDocument } from "../../utils/editor";
import Svg from "../shared/Svg";

// eslint-disable-next-line max-len
import type { ColumnBreakpoint as ColumnBreakpointType } from "../../selectors/visibleColumnBreakpoints";

type Bookmark = {
  clear: Function
};

type Props = {
  editor: Object,
  source: Object,
  enabled: boolean,
  toggleBreakpoint: typeof actions.toggleBreakpoint,
  columnBreakpoint: ColumnBreakpointType
};

const breakpointImg = document.createElement("div");
ReactDOM.render(<Svg name={"column-marker"} />, breakpointImg);
function makeBookmark({ breakpoint }, { onClick }) {
  const bp = breakpointImg.cloneNode(true);
  const isActive = breakpoint && !breakpoint.disabled;
  const condition = breakpoint && breakpoint.condition;

  bp.className = classnames("column-breakpoint", {
    "has-condition": condition,
    active: isActive,
    disabled: !isActive
  });

  if (condition) {
    bp.setAttribute("title", condition);
  }
  bp.onclick = onClick;

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
      onClick: this.toggleBreakpoint
    });

    this.bookmark = doc.setBookmark({ line: line - 1, ch: column }, { widget });
  };

  clearColumnBreakpoint = () => {
    if (this.bookmark) {
      this.bookmark.clear();
      this.bookmark = null;
    }
  };

  toggleBreakpoint = () => {
    const { columnBreakpoint, toggleBreakpoint } = this.props;
    const { line, column } = columnBreakpoint.location;
    toggleBreakpoint(line, column);
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
