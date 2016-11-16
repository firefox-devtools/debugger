// @flow

/**
 * Flow types
 * @module types
 */

/**
 * Pause
 *
 * @memberof types
 * @static
 */
export type Frame = {
  id: string,
  displayName: string,
  location: Location,
  this: ?Object,
  scope: ?Object
}

export type Why = {
  type: string
}

export type Pause = {
  frames: Frame[],
  why: Why
}

export type Expression = {
  id: number,
  input: string
}

export type Grip = {
  actor: string,
  class: string,
  extensible: boolean,
  frozen: boolean,
  isGlobal: boolean,
  ownPropertyLength: number,
  preview: {
    kind: string,
    url: string
  },
  sealed: boolean,
  type: string
}

/**
 * Source
 *
 * @memberof types
 * @static
 */
export type Source = {
  id: string,
  url?: string,
  sourceMapURL?: string
};

/**
 * Source File Location
 *
 * @memberof actions/types
 * @static
 */
export type Location = {
  sourceId: string,
  line: number,
  column?: number
};

/**
 * Breakpoint
 *
 * @memberof actions/types
 * @static
 */
export type Breakpoint = {
  id: string,
  location: Location,
  loading: boolean,
  disabled: boolean,
  text: string,
  condition: ?string,
};

/**
 * Source Text
 *
 * @memberof actions/types
 * @static
 */
export type SourceText = {
  id: string,
  text: string,
  contentType: string
};
