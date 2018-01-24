/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { findBestMatchExpression } from "../utils/ast";
import { getTokenLocation } from "../utils/editor";
import { isReactComponent, isImmutable } from "../utils/preview";
import { isGeneratedId } from "devtools-source-map";
import { PROMISE } from "./utils/middleware/promise";

import {
  getPreview,
  getInScopeLines,
  getSelectedSource,
  getSelectedFrame,
  getSymbols
} from "../selectors";

import { getMappedExpression } from "./expressions";

import { isEqual } from "lodash";

import type { ThunkArgs } from "./types";
import type { AstLocation } from "../workers/parser";

async function getReactProps(evaluate) {
  const reactDisplayName = await evaluate(
    "this._reactInternalInstance.getName()"
  );

  return {
    displayName: reactDisplayName.result
  };
}

async function getImmutableProps(expression: string, evaluate) {
  const immutableEntries = await evaluate((exp => `${exp}.toJS()`)(expression));

  const immutableType = await evaluate(
    (exp => `${exp}.constructor.name`)(expression)
  );

  return {
    type: immutableType.result,
    entries: immutableEntries.result
  };
}

async function getExtraProps(expression, result, evaluate) {
  const props = {};
  if (isReactComponent(result)) {
    props.react = await getReactProps(evaluate);
  }

  if (isImmutable(result)) {
    props.immutable = await getImmutableProps(expression, evaluate);
  }

  return props;
}

export function updatePreview(target: HTMLElement, editor: any) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const location = getTokenLocation(editor.codeMirror, target);
    const tokenText = target.innerText ? target.innerText.trim() : "";
    const cursorPos = target.getBoundingClientRect();
    const preview = getPreview(getState());

    if (preview) {
      // We are mousing over the same token as before
      if (isEqual(preview.tokenPos, location)) {
        return;
      }

      // We are mousing over a new token that is not in the preview
      if (!target.classList.contains("debug-expression")) {
        dispatch(clearPreview());
      }
    }

    const source = getSelectedSource(getState());

    const symbols = getSymbols(getState(), source.toJS());
    if (symbols.functions.length == 0) {
      return;
    }

    const invalidToken =
      tokenText === "" || tokenText.match(/[(){}\|&%,.;=<>\+-/\*\s]/);

    const invalidTarget =
      (target.parentElement &&
        !target.parentElement.closest(".CodeMirror-line")) ||
      cursorPos.top == 0;

    const isUpdating = preview && preview.updating;

    const linesInScope = getInScopeLines(getState());
    const inScope = linesInScope && linesInScope.includes(location.line);

    const invaildType =
      target.className === "cm-string" ||
      target.className === "cm-number" ||
      target.className === "cm-atom";

    if (
      invalidTarget ||
      !inScope ||
      isUpdating ||
      invalidToken ||
      invaildType
    ) {
      return;
    }

    dispatch(setPreview(tokenText, location, cursorPos));
  };
}

export function setPreview(
  token: string,
  tokenPos: AstLocation,
  cursorPos: any
) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const currentSelection = getPreview(getState());
    if (currentSelection && currentSelection.updating) {
      return;
    }

    await dispatch({
      type: "SET_PREVIEW",
      [PROMISE]: (async function() {
        const source = getSelectedSource(getState());
        const symbols = getSymbols(getState(), source.toJS());
        const found = findBestMatchExpression(symbols, tokenPos, token);

        if (!found) {
          return;
        }

        let { expression, location } = found;

        if (!expression) {
          return;
        }

        const sourceId = source.get("id");
        if (location && !isGeneratedId(sourceId)) {
          const generatedLocation = await sourceMaps.getGeneratedLocation(
            { ...location.start, sourceId },
            source.toJS()
          );

          expression = await getMappedExpression(
            { sourceMaps },
            generatedLocation,
            expression
          );
        }

        const selectedFrame = getSelectedFrame(getState());
        if (!selectedFrame) {
          return;
        }

        const { result } = await client.evaluateInFrame(
          selectedFrame.id,
          expression
        );

        if (result === undefined) {
          return;
        }

        const extra = await getExtraProps(expression, result, expr =>
          client.evaluateInFrame(selectedFrame.id, expr)
        );

        return {
          expression,
          result,
          location,
          tokenPos,
          cursorPos,
          extra
        };
      })()
    });
  };
}

export function clearPreview() {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    const currentSelection = getPreview(getState());
    if (!currentSelection) {
      return;
    }

    return dispatch({
      type: "CLEAR_SELECTION"
    });
  };
}
