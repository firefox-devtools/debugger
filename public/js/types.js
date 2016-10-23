// @flow

/**
 * Flow types
 * @module types
 */

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
