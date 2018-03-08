/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { findBestMatchExpression } from "../utils/ast";
import { getTokenLocation } from "../utils/editor";
import { isReactComponent, isImmutable } from "../utils/preview";
import { isGeneratedId } from "devtools-source-map";
import { PROMISE } from "./utils/middleware/promise";
import { getExpressionFromCoords } from "../utils/editor/get-expression";

import {
  getPreview,
  isLineInScope,
  getSelectedSource,
  getSelectedFrame,
  getSymbols,
  getCanRewind
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

function isInvalidTarget(target: HTMLElement) {
  if (!target || !target.innerText) {
    return true;
  }

  const tokenText = target.innerText.trim();
  const cursorPos = target.getBoundingClientRect();

  // exclude literal tokens where it does not make sense to show a preview
  const invaildType = ["cm-string", "cm-number", "cm-atom"].includes(
    target.className
  );

  // exclude syntax where the expression would be a syntax error
  const invalidToken =
    tokenText === "" || tokenText.match(/[(){}\|&%,.;=<>\+-/\*\s]/);

  // exclude codemirror elements that are not tokens
  const invalidTarget =
    (target.parentElement &&
      !target.parentElement.closest(".CodeMirror-line")) ||
    cursorPos.top == 0;

  return invalidTarget || invalidToken || invaildType;
}

export function updatePreview(target: HTMLElement, editor: any) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    const tokenText = target.innerText ? target.innerText.trim() : "";
    const tokenPos = getTokenLocation(editor.codeMirror, target);
    const cursorPos = target.getBoundingClientRect();
    const preview = getPreview(getState());

    if (getCanRewind(getState())) {
      return;
    }

    if (preview) {
      // Return early if we are currently showing another preview or
      // if we are mousing over the same token as before
      if (preview.updating || isEqual(preview.tokenPos, tokenPos)) {
        return;
      }

      // We are mousing over a new token that is not in the preview
      if (!target.classList.contains("debug-expression")) {
        dispatch(clearPreview());
      }
    }

    if (isInvalidTarget(target)) {
      return;
    }

    if (!isLineInScope(getState(), tokenPos.line)) {
      return;
    }

    const source = getSelectedSource(getState());
    const symbols = getSymbols(getState(), source.toJS());

    let match;
    if (!symbols || symbols.identifiers.length > 0) {
      match = findBestMatchExpression(symbols, tokenPos, tokenText);
    } else {
      match = getExpressionFromCoords(editor.codeMirror, tokenPos);
    }

    if (!match || !match.expression) {
      return;
    }

    const { expression, location } = match;
    dispatch(setPreview(expression, location, tokenPos, cursorPos));
  };
}

export function setPreview(
  expression: string,
  location: AstLocation,
  tokenPos: AstLocation,
  cursorPos: any
) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    await dispatch({
      type: "SET_PREVIEW",
      [PROMISE]: (async function() {
        const source = getSelectedSource(getState());

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
