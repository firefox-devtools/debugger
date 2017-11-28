// @flow

import { findBestMatchExpression } from "../utils/ast";
import { getTokenLocation } from "../utils/editor";
import { isGeneratedId } from "devtools-source-map";
import { PROMISE } from "./utils/middleware/promise";

import {
  getPreview,
  getInScopeLines,
  getSelectedSource,
  getMappedExpression,
  getSelectedFrame,
  getSymbols
} from "../selectors";

import { isEqual } from "lodash";

import type { ThunkArgs } from "./types";
import type { AstLocation } from "../workers/parser";

const extraProps = {
  react: { displayName: "this._reactInternalInstance.getName()" },
  immutable: {
    isImmutable: exp => `Immutable.Iterable.isIterable(${exp})`,
    entries: exp => `${exp}.toJS()`,
    type: exp => `${exp}.constructor.name`
  }
};

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
    if (getSymbols(getState(), source.toJS()).functions.length == 0) {
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
        let immutableType = null;
        let immutableEntries = null;

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
        const { result } = await client.evaluate(expression, {
          frameId: selectedFrame.id
        });

        const reactDisplayName = await client.evaluate(
          extraProps.react.displayName,
          {
            frameId: selectedFrame.id
          }
        );

        const immutable = await client.evaluate(
          extraProps.immutable.isImmutable(expression),
          {
            frameId: selectedFrame.id
          }
        );

        if (immutable.result === true) {
          immutableEntries = await client.evaluate(
            extraProps.immutable.entries(expression),
            {
              frameId: selectedFrame.id
            }
          );

          immutableType = await client.evaluate(
            extraProps.immutable.type(expression),
            {
              frameId: selectedFrame.id
            }
          );
        }

        const extra = {
          react: {
            displayName: reactDisplayName.result
          },
          immutable: {
            isImmutable:
              immutable.result && immutable.result.type !== "undefined",
            type: immutableType && immutableType.result,
            entries: immutableEntries && immutableEntries.result
          }
        };

        if (result === undefined) {
          return;
        }

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
