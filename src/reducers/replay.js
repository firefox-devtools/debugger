/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Breakpoints reducer
 * @module reducers/replay
 */
export type ReplayState = {
  history: any,
  index: number
};

export function initialState(): ReplayState {
  return {
    history: [],
    index: -1
  };
}

function update(state: ReplayState = initialState(), action: any): ReplayState {
  switch (action.type) {
    case "TRAVEL_TO": {
      return { ...state, index: action.index };
    }

    case "PAUSED": {
      const { selectedFrameId, frames, loadedObjects, pauseInfo } = action;
      const { why } = pauseInfo;
      pauseInfo.isInterrupted = pauseInfo.why.type === "interrupted";

      // turn this into an object keyed by object id
      const objectMap = {};
      loadedObjects.forEach(obj => {
        objectMap[obj.value.objectId] = obj;
      });

      const paused = {
        isWaitingOnBreak: false,
        pause: pauseInfo,
        selectedFrameId,
        frames,
        frameScopes: {},
        loadedObjects: objectMap,
        why
      };

      const history = [...state.history, paused];
      return { ...state, history };
    }
  }

  return state;
}

export function getHistory(state: any): any {
  return state.replay.history;
}

export function getHistoryFrame(state: any): any {
  console.log(state.replay);
  return state.replay.history[state.replay.index];
}

export function getHistoryPosition(state: any): any {
  return state.replay.index;
}

export default update;
