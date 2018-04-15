/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { isConsole } from "../utils/preview";
import { findBestMatchExpression } from "../utils/ast";
import { getTokenLocation } from "../utils/editor";
import { isGeneratedId } from "devtools-source-map";
import { PROMISE } from "./utils/middleware/promise";
import { getExpressionFromCoords } from "../utils/editor/get-expression";

import {
  getPreview,
  isLineInScope,
  isSelectedFrameVisible,
  getSelectedSource,
  getSelectedFrame,
  getSymbols,
  getCanRewind
} from "../selectors";

import { getMappedExpression } from "./expressions";
import { getExtra } from "./pause";
import { isEqual } from "lodash";

import type { Action, ThunkArgs } from "./types";
import type { ColumnPosition } from "../types";
import type { AstLocation } from "../workers/parser";

function isInvalidTarget(target: HTMLElement) {
  if (!target || !target.innerText) {
    return true;
  }

  const tokenText = target.innerText.trim();
  const cursorPos = target.getBoundingClientRect();

  // exclude literal tokens where it does not make sense to show a preview
  const invalidType = ["cm-atom", ""].includes(target.className);

  // exclude syntax where the expression would be a syntax error
  const invalidToken =
    tokenText === "" || tokenText.match(/^[(){}\|&%,.;=<>\+-/\*\s](?=)/);

  // exclude codemirror elements that are not tokens
  const invalidTarget =
    (target.parentElement &&
      !target.parentElement.closest(".CodeMirror-line")) ||
    cursorPos.top == 0;

  return invalidTarget || invalidToken || invalidType;
}

export function updatePreview(target: HTMLElement, editor: any) {
  return ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
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

    if (
      !isSelectedFrameVisible(getState()) ||
      !isLineInScope(getState(), tokenPos.line)
    ) {
      return;
    }

    const source = getSelectedSource(getState());
    const symbols = getSymbols(getState(), source);

    let match;
    if (!symbols || symbols.loading) {
      match = getExpressionFromCoords(editor.codeMirror, tokenPos);
    } else {
      match = findBestMatchExpression(symbols, tokenPos);
    }

    if (!match) {
      return;
    }

    const { expression, location } = match;

    if (isConsole(expression)) {
      return;
    }

    dispatch(setPreview(expression, location, tokenPos, cursorPos));
  };
}

export function setPreview(
  expression: string,
  location: AstLocation,
  tokenPos: ColumnPosition,
  cursorPos: any
) {
  return async ({ dispatch, getState, client, sourceMaps }: ThunkArgs) => {
    await dispatch(
      ({
        type: "SET_PREVIEW",
        [PROMISE]: (async function() {
          const source = getSelectedSource(getState());
          const sourceId = source.id;
          const selectedFrame = getSelectedFrame(getState());

          if (location && !isGeneratedId(sourceId)) {
            expression = await dispatch(getMappedExpression(expression));
          }

          if (!selectedFrame) {
            return;
          }

          const { result } = await client.evaluateInFrame(
            expression,
            selectedFrame.id
          );

          if (result === undefined) {
            return;
          }

          const extra = await dispatch(getExtra(expression, result));

          return {
            expression,
            result,
            location,
            tokenPos,
            cursorPos,
            extra
          };
        })()
      }: Action)
    );
  };
}

export function clearPreview() {
  return ({ dispatch, getState, client }: ThunkArgs) => {
    const currentSelection = getPreview(getState());
    if (!currentSelection) {
      return;
    }

    return dispatch(
      ({
        type: "CLEAR_SELECTION"
      }: Action)
    );
  };
}
