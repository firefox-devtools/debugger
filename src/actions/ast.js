// @flow

import {
  getBreakpoints,
  getSource,
  hasSymbols,
  getSelectedLocation,
  getSelectedSource,
  getSelectedFrame,
  getSelection
} from "../selectors";

import { resyncBreakpoint } from "./breakpoints";
import { PROMISE } from "../utils/redux/middleware/promise";
import * as parser from "../utils/parser";

import type { SourceId } from "debugger-html";
import type { ThunkArgs } from "./types";
import type { AstLocation } from "../utils/parser";

async function shouldValidate(breakpoint, source) {
  const { sourceUrl } = breakpoint.location;
  const sameSource = sourceUrl && sourceUrl === source.url;

  if (sameSource) {
    return true;
  }
  return false;
}

async function validateBreakpoints(state, dispatch, source, symbols) {
  const breakpoints = getBreakpoints(state);
  if (!breakpoints) {
    return;
  }
  const breakpointsArray = breakpoints.valueSeq().toJS();
  console.log(breakpointsArray);
  for (let breakpoint of breakpointsArray) {
    if (shouldValidate(breakpoint, source)) {
      await dispatch(
        resyncBreakpoint(source.id, breakpoint, symbols.functions)
      );
    }
  }
}

export function setSymbols(sourceId: SourceId) {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const sourceRecord = getSource(getState(), sourceId);
    if (!sourceRecord) {
      return;
    }

    const source = sourceRecord.toJS();
    if (!source.text || hasSymbols(getState(), source)) {
      return;
    }

    const symbols = await parser.getSymbols(source);
    validateBreakpoints(getState(), dispatch, source, symbols);

    dispatch({
      type: "SET_SYMBOLS",
      source,
      symbols
    });
  };
}

export function setOutOfScopeLocations() {
  return async ({ dispatch, getState }: ThunkArgs) => {
    const location = getSelectedLocation(getState());
    if (!location) {
      return;
    }

    const source = getSource(getState(), location.sourceId);

    if (!location.line || !source) {
      return dispatch({
        type: "OUT_OF_SCOPE_LOCATIONS",
        locations: null
      });
    }

    const locations = await parser.getOutOfScopeLocations(
      source.toJS(),
      location
    );

    return dispatch({
      type: "OUT_OF_SCOPE_LOCATIONS",
      locations
    });
  };
}

export function clearSelection() {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    const currentSelection = getSelection(getState());
    if (!currentSelection) {
      return;
    }

    return dispatch({
      type: "CLEAR_SELECTION"
    });
  };
}

export function setSelection(
  token: string,
  tokenPos: AstLocation,
  cursorPos: any
) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    const currentSelection = getSelection(getState());
    if (currentSelection && currentSelection.updating) {
      return;
    }

    await dispatch({
      type: "SET_SELECTION",
      [PROMISE]: (async function() {
        const source = getSelectedSource(getState());
        const closestExpression = await parser.getClosestExpression(
          source.toJS(),
          token,
          tokenPos
        );

        if (!closestExpression) {
          return;
        }

        const { expression, location } = closestExpression;

        if (!expression) {
          return;
        }

        const selectedFrame = getSelectedFrame(getState());
        const { result } = await client.evaluate(expression, {
          frameId: selectedFrame.id
        });

        return {
          expression,
          result,
          location,
          tokenPos,
          cursorPos
        };
      })()
    });
  };
}
