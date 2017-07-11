import { Component, createFactory, DOM as dom } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isEnabled } from "devtools-config";

import range from "lodash/range";
import keyBy from "lodash/keyBy";
import find from "lodash/find";
import isEqualWith from "lodash/isEqualWith";

import _CallSite from "./CallSite";
const CallSite = createFactory(_CallSite);

import {
  getSelectedSource,
  getSymbols,
  getSelectedLocation,
  getBreakpointsForSource
} from "../../selectors";

import { getTokenLocation } from "../../utils/editor";

import actions from "../../actions";

function getCallSiteAtLocation(callSites, location) {
  return find(callSites, callSite =>
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

  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    this.state = {
      showCallSites: false
    };
  }

  componentDidMount() {
    const { editor } = this.props;
    const codeMirrorWrapper = editor.codeMirror.getWrapperElement();

    codeMirrorWrapper.addEventListener("click", e => this.onTokenClick(e));
    document.body.addEventListener("keydown", this.onKeyDown);
    document.body.addEventListener("keyup", this.onKeyUp);
  }

  componentDidUnMount() {
    const { editor } = this.props;
    const codeMirrorWrapper = editor.codeMirror.getWrapperElement();

    codeMirrorWrapper.addEventListener("click", e => this.onTokenClick(e));
    document.body.removeEventListener("keydown", e => this.onKeyDown);
    document.body.removeEventListener("keyup", this.onKeyUp);
  }

  onKeyUp(e) {
    if (e.key === "Alt") {
      e.preventDefault();
      this.setState({ showCallSites: false });
    }
  }

  onKeyDown(e) {
    if (e.key === "Alt") {
      e.preventDefault();
      this.setState({ showCallSites: true });
    }
  }

  onTokenClick(e) {
    const { target } = e;
    const { editor } = this.props;

    if (
      !isEnabled("columnBreakpoints") ||
      !e.altKey ||
      (!target.classList.contains("call-site") &&
        !target.classList.contains("call-site-bp"))
    ) {
      return;
    }

    const { line, column } = getTokenLocation(editor.codeMirror, target);

    this.toggleBreakpoint(line + 1, column - 2);
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
        sourceUrl: selectedSource.get("url"),
        line: line,
        column: column
      });
    }
  }

  render() {
    const { editor, callSites } = this.props;
    const { showCallSites } = this.state;
    let sites;
    if (!callSites) {
      return null;
    }

    editor.codeMirror.operation(() => {
      sites = dom.div(
        {},
        callSites.map((callSite, index) => {
          return CallSite({
            key: index,
            callSite,
            editor,
            breakpoint: callSite.breakpoint,
            showCallSite: showCallSites
          });
        })
      );
    });
    return sites;
  }
}

CallSites.displayName = "CallSites";
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
    const { location: { start, end } } = callSite;

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

export default connect(
  state => {
    const selectedLocation = getSelectedLocation(state);
    const selectedSource = getSelectedSource(state);
    const sourceId = selectedLocation && selectedLocation.sourceId;
    const source = selectedSource && selectedSource.toJS();

    const symbols = getSymbols(state, source);
    const breakpoints = getBreakpointsForSource(state, sourceId);

    return {
      selectedLocation,
      selectedSource,
      callSites: getCallSites(symbols, breakpoints),
      breakpoints: breakpoints
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(CallSites);
