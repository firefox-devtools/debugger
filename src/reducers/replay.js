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
  currentFrameIndex: number,
  recording: boolean,
  replaying: boolean
};

export function initialState(): ReplayState {
  return {
    history: [],
    currentFrameIndex: -1,
    recording: false,
    replaying: false
  };
}

function update(state: ReplayState = initialState(), action: any): ReplayState {
  switch (action.type) {
    case "RECORD": {
      return { ...state, recording: true };
    }

    case "STEP_FORWARD": {
      const currentFrameIndex = state.currentFrameIndex - 1;
      return { ...state, currentFrameIndex };
    }

    case "STEP_BACKWARD": {
      const currentFrameIndex = state.currentFrameIndex + 1;
      return { ...state, currentFrameIndex };
    }
  }

  return state;
}

export default update;
