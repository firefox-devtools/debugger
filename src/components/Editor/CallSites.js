/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React, { Component } from "react";
import { connect } from "react-redux";

import { range, keyBy, isEqualWith } from "lodash";

import CallSite from "./CallSite";

import {
  getSelectedSource,
  getSymbols,
  getSelectedLocation,
  getBreakpointsForSource
} from "../../selectors";

import { getTokenLocation } from "../../utils/editor";
import { isWasm } from "../../utils/wasm";

import actions from "../../actions";

function getCallSiteAtLocation(callSites, location) {
  return callSites.find(callSite =>
    isEqualWith(callSite.location, location, (cloc, loc) => {
      return (
        loc.line === cloc.start.line &&
        (loc.column >= cloc.start.column && loc.column <= cloc.end.column)
      );
    })
  );
}

class CallSites extends Component {
  props: {
    symbols: Array<Symbol>,
    callSites: Array<Symbol>,
    editor: Object,
    breakpoints: Map,
    addBreakpoint: Function,
    removeBreakpoint: Function,
    selectedSource: Object,
    selectedLocation: Object
  };

  componentDidMount() {
    const { editor } = this.props;
    const codeMirrorWrapper = editor.codeMirror.getWrapperElement();
    const scroller = editor.codeMirror.getScrollerElement();

    codeMirrorWrapper.addEventListener("click", e => this.onTokenClick(e));
    scroller.addEventListener("scroll", e => this.onScoll());
  }

  componentWillUnmount() {
    const { editor } = this.props;
    const codeMirrorWrapper = editor.codeMirror.getWrapperElement();
    const scroller = editor.codeMirror.getScrollerElement();

    codeMirrorWrapper.removeEventListener("click", e => this.onTokenClick(e));
    scroller.removeEventListener("scroll", e => this.onScoll());
  }

  onScoll(e) {
    this.setState({ state: this.state });
  }

  onTokenClick(e) {
    const { target } = e;
    const { editor, selectedLocation } = this.props;

    if (
      !target.classList.contains("call-site") &&
      !target.classList.contains("call-site-bp")
    ) {
      return;
    }

    const { sourceId } = selectedLocation;
    const { line, column } = getTokenLocation(editor.codeMirror, target);

    this.toggleBreakpoint(line, isWasm(sourceId) ? undefined : column);
  }

  toggleBreakpoint(line, column = undefined) {
    const {
      selectedSource,
      selectedLocation,
      addBreakpoint,
      removeBreakpoint,
      callSites
    } = this.props;

    const callSite = getCallSiteAtLocation(callSites, { line, column });

    if (!callSite) {
      return;
    }

    const bp = callSite.breakpoint;

    if ((bp && bp.loading) || !selectedLocation || !selectedSource) {
      return;
    }

    const { sourceId } = selectedLocation;

    if (bp) {
      // NOTE: it's possible the breakpoint has slid to a column
      column = column || bp.location.column;
      removeBreakpoint({
        sourceId: sourceId,
        line: line,
        column
      });
    } else {
      addBreakpoint({
        sourceId: sourceId,
        sourceUrl: selectedSource.url,
        line: line,
        column: column
      });
    }
  }

  isVisible(codeMirror: any, top: number, left: number) {
    function withinBounds(x, min, max) {
      return x >= min && x <= max;
    }

    const scrollArea = codeMirror.getScrollInfo();
    const charWidth = codeMirror.defaultCharWidth();
    const fontHeight = codeMirror.defaultTextHeight();
    const { scrollTop, scrollLeft } = codeMirror.doc;

    const inXView = withinBounds(
      left,
      scrollLeft,
      scrollLeft + (scrollArea.clientWidth - 30) - charWidth
    );

    const inYView = withinBounds(
      top,
      scrollTop,
      scrollTop + scrollArea.clientHeight - fontHeight
    );

    return inXView && inYView;
  }

  callSiteIsVisible(codeMirror: any, line: number, column: number) {
    const { top, left } = codeMirror.charCoords(
      { line: line, ch: column },
      "local"
    );

    return this.isVisible(codeMirror, top, left);
  }

  // Return the call sites that are on the same line as an
  // existing line breakpoint
  filterCallSitesByLineNumber() {
    const { callSites, breakpoints, editor } = this.props;

    const breakpointLines = new Set(
      breakpoints.toIndexedSeq().map(bp => bp.location.line)
    );

    return callSites.filter(
      ({ location }) =>
        breakpointLines.has(location.start.line) &&
        this.callSiteIsVisible(
          editor.codeMirror,
          location.start.line,
          location.start.column
        )
    );
  }

  render() {
    const { editor, callSites, selectedSource } = this.props;

    let sites;
    if (!callSites) {
      return null;
    }

    const callSitesFiltered = this.filterCallSitesByLineNumber();

    editor.codeMirror.operation(() => {
      const childCallSites = callSitesFiltered.map((callSite, index) => {
        const props = {
          key: index,
          callSite,
          editor,
          source: selectedSource,
          breakpoint: callSite.breakpoint,
          showCallSite: true
        };
        return <CallSite {...props} />;
      });
      sites = <div>{childCallSites}</div>;
    });
    return sites;
  }
}

function getCallSites(symbols, breakpoints) {
  if (!symbols || !symbols.callExpressions) {
    return;
  }

  const callSites = symbols.callExpressions;

  // NOTE: we create a breakpoint map keyed on location
  // to speed up the lookups. Hopefully we'll fix the
  // inconsistency with column offsets so that we can expect
  // a breakpoint to be added at the beginning of a call expression.
  const bpLocationMap = keyBy(breakpoints.valueSeq().toJS(), ({ location }) =>
    locationKey(location)
  );

  function locationKey({ line, column }) {
    return `${line}/${column}`;
  }

  function findBreakpoint(callSite) {
    const {
      location: { start, end }
    } = callSite;

    const breakpointId = range(start.column - 1, end.column)
      .map(column => locationKey({ line: start.line, column }))
      .find(key => bpLocationMap[key]);

    if (breakpointId) {
      return bpLocationMap[breakpointId];
    }
  }

  return callSites
    .filter(({ location }) => location.start.line === location.end.line)
    .map(callSite => ({ ...callSite, breakpoint: findBreakpoint(callSite) }));
}

const mapStateToProps = state => {
  const selectedLocation = getSelectedLocation(state);
  const selectedSource = getSelectedSource(state);
  const sourceId = selectedLocation && selectedLocation.sourceId;
  const symbols = getSymbols(state, selectedSource);
  const breakpoints = getBreakpointsForSource(state, sourceId);

  return {
    selectedLocation,
    selectedSource,
    callSites: getCallSites(symbols, breakpoints),
    breakpoints: breakpoints
  };
};

const { addBreakpoint, removeBreakpoint } = actions;
const mapDispatchToProps = { addBreakpoint, removeBreakpoint };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CallSites);
