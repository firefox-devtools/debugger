// @flow

import {
  getSource,
  hasSymbols,
  getSelectedLocation,
  getSelectedSource,
  getSelectedFrame,
  getSelection
} from "../selectors";

import { PROMISE } from "../utils/redux/middleware/promise";
import * as parser from "../utils/parser";

import { getClosestPath } from "../utils/parser/utils/closest";
import {
  isAsyncFunction,
  isAwaitExpression,
  containsPosition
} from "../utils/parser/utils/helpers";

import { addBreakpoint, removeBreakpoint } from "./breakpoints";
import { getHiddenBreakpoint } from "../reducers/breakpoints";
import { command, getPosition } from "./pause";
import type { NodePath } from "babel-traverse";

import type { SourceId } from "debugger-html";
import type { ThunkArgs } from "./types";
import type { AstLocation } from "../utils/parser";

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

/**
 * Action dispatched from stepOver action. Receives the position
 * and depending on where it is paused, sets up hidden breakpoints
 * and handles resume, stepOver (as needed)
 * @param position
 * @returns {function(ThunkArgs)}
 */
export function analyzeStepping(type) {
  return async ({ dispatch, getState, client }: ThunkArgs) => {
    const position = await dispatch(getPosition());
    const source = getSelectedSource(getState()).toJS();
    const hiddenBreakpointLocation = getHiddenBreakpoint(getState());

    await dispatch({
      type: "ANALYZE_STEPPING",
      [PROMISE]: (async function() {
        if (hiddenBreakpointLocation) {
          await dispatch(removeBreakpoint(hiddenBreakpointLocation));
        }
        const path = getClosestPath(source, position);
        if (!path) {
          return dispatch(command({ type }));
        }
        switch (type) {
          case "stepOver":
          case "stepIn":
          case "stepOut":
            if (isAwaitExpression(path)) {
              return dispatch(analyzeAwaitExpression(path, position, type));
            }
        }
        return dispatch(command({ type }));
      })()
    });
  };
}

function analyzeAwaitExpression(path: NodePath, position: AstLocation, type) {
  return async ({ dispatch }: ThunkArgs) => {
    const blockScope = path.scope.block;
    if (blockScope && isAsyncFunction(blockScope)) {
      const siblings = blockScope.body.body;
      for (let i = 0; i != siblings.length; i++) {
        const sibling = siblings[i];
        if (containsPosition(sibling.loc, position)) {
          const nextSibling = siblings[++i];
          const nextLocation = nextSibling.loc.start;
          nextLocation.sourceId = position.sourceId;
          await dispatch(
            addBreakpoint(nextLocation, { hidden: true, condition: "" })
          );
          if (type === "stepOver") {
            return dispatch(command({ type: "resume" }));
          }
          return dispatch(command({ type }));
        }
      }
    }
  };
}
