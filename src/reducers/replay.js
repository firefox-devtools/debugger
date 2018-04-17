/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import { features } from "../utils/prefs";

import type { Action } from "../actions/types";

/**
 * Breakpoints reducer
 * @module reducers/replay
 */
export type ReplayState = {
  history: any,
  position: number
};

export function initialState(): ReplayState {
  return {
    history: [],
    position: -1
  };
}

const defaultFrameScopes = {
  original: {},
  generated: {}
};

function update(
  state: ReplayState = initialState(),
  action: Action
): ReplayState {
  if (!features.replay) {
    return state;
  }

  switch (action.type) {
    case "TRAVEL_TO": {
      return { ...state, position: action.position };
    }

    case "ADD_SCOPES": {
      return addScopes(state, action);
    }

    case "MAP_SCOPES": {
      return mapScopes(state, action);
    }

    case "CLEAR_HISTORY": {
      return { history: [], position: -1 };
    }

    case "PAUSED": {
      return paused(state, action);
    }

    case "EVALUATE_EXPRESSION": {
      return evaluateExpression(state, action);
    }
  }

  return state;
}

function addScopes(state: ReplayState, action: any) {
  const { frame, status, value } = action;
  const selectedFrameId = frame.id;
  const instance = state.history[state.position];

  if (!instance) {
    return state;
  }

  const pausedInst = instance.paused;

  const generated = {
    ...pausedInst.frameScopes.generated,
    [selectedFrameId]: {
      pending: status !== "done",
      scope: value
    }
  };

  const newPaused = {
    ...pausedInst,
    frameScopes: {
      ...pausedInst.frameScopes,
      generated
    }
  };

  const history = [...state.history];
  history[state.position] = { ...instance, paused: newPaused };
  return { ...state, history };
}

function mapScopes(state: ReplayState, action: any) {
  const { frame, status, value } = action;
  const selectedFrameId = frame.id;
  const instance = state.history[state.position];

  if (!instance) {
    return state;
  }

  const pausedInst = instance.paused;

  const original = {
    ...pausedInst.frameScopes.original,
    [selectedFrameId]: {
      pending: status !== "done",
      scope: value
    }
  };

  const newPaused = {
    ...pausedInst,
    frameScopes: {
      ...pausedInst.frameScopes,
      original
    }
  };

  const history = [...state.history];
  history[state.position] = { ...instance, paused: newPaused };
  return { ...state, history };
}

function evaluateExpression(state, action) {
  const { input, value } = action;
  const instance = state.history[state.position];
  if (!instance) {
    return state;
  }

  const prevExpressions = instance.expressions || [];
  const expression = { input, value };
  const expressions = [...prevExpressions, expression];

  const history = [...state.history];
  history[state.position] = { ...instance, expressions };
  return { ...state, history };
}

function paused(state, action) {
  const { selectedFrameId, frames, loadedObjects, why } = action;

  // turn this into an object keyed by object id
  const objectMap = {};
  loadedObjects.forEach(obj => {
    objectMap[obj.value.objectId] = obj;
  });

  const pausedInfo = {
    isWaitingOnBreak: false,
    selectedFrameId,
    frames,
    frameScopes: defaultFrameScopes,
    loadedObjects: objectMap,
    why
  };

  const history = [...state.history, { paused: pausedInfo }];
  const position = state.position + 1;
  return { ...state, history, position };
}

export function getHistory(state: any): any {
  return state.replay.history;
}

export function getHistoryFrame(state: any, position: number): any {
  return state.replay.history[position];
}

export function getHistoryPosition(state: any): any {
  return state.replay.position;
}

export default update;
