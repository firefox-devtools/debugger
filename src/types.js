/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

export type SearchModifiers = {
  caseSensitive: boolean,
  wholeWord: boolean,
  regexMatch: boolean
};

export type Mode =
  | String
  | {
      name: string,
      typescript?: boolean,
      base?: {
        name: string,
        typescript: boolean
      }
    };

/**
 * Breakpoint ID
 *
 * @memberof types
 * @static
 */
export type BreakpointId = string;

/**
 * Source ID
 *
 * @memberof types
 * @static
 */
export type SourceId = string;

/**
 * Actor ID
 *
 * @memberof types
 * @static
 */
export type ActorId = string;

/**
 * Source File Location
 *
 * @memberof types
 * @static
 */
export type Location = {
  sourceId: SourceId,
  line: number,
  column: ?number,
  sourceUrl?: string
};

export type PendingLocation = {
  line: number,
  column: ?number,
  sourceUrl?: string
};

export type ASTLocation = {|
  name: ?string,
  offset: {
    column: ?number,
    line: number
  }
|};

/**
 * Breakpoint
 *
 * @memberof types
 * @static
 */
export type Breakpoint = {
  id: BreakpointId,
  location: Location,
  astLocation: ?ASTLocation,
  generatedLocation: Location,
  loading: boolean,
  disabled: boolean,
  hidden: boolean,
  text: string,
  condition: ?string
};

/**
 * Breakpoint Result is the return from an add/modify Breakpoint request
 *
 * @memberof types
 * @static
 */
export type BreakpointResult = {
  id: ActorId,
  actualLocation: Location
};

/**
 * PendingBreakpoint
 *
 * @memberof types
 * @static
 */
export type PendingBreakpoint = {
  location: PendingLocation,
  astLocation: ASTLocation,
  generatedLocation: PendingLocation,
  loading: boolean,
  disabled: boolean,
  text: string,
  condition: ?string
};

/**
 * Frame ID
 *
 * @memberof types
 * @static
 */
export type FrameId = string;

/**
 * Frame
 * @memberof types
 * @static
 */
export type Frame = {
  id: FrameId,
  displayName: string,
  location: Location,
  generatedLocation: Location,
  source?: Source,
  scope: Scope,
  // FIXME Define this type more clearly
  this: Object,
  framework?: string
};

/**
 * ContextMenuItem
 *
 * @memberof types
 * @static
 */
export type ContextMenuItem = {
  id: string,
  label: string,
  accesskey: string,
  disabled: boolean,
  click: Function
};

/**
 * why
 * @memberof types
 * @static
 */
export type ExceptionReason = {|
  exception: string | Grip,
  message: string,
  type: "exception",
  frameFinished?: Object
|};

/**
 * why
 * @memberof types
 * @static
 */
export type Why =
  | ExceptionReason
  | {
      type: string,
      frameFinished?: Object
    };

/**
 * Why is the Debugger Paused?
 * This is the generic state handling the reason the debugger is paused.
 * Reasons are usually related to "breakpoint" or "debuggerStatement"
 * and should eventually be specified here as an enum.  For now we will
 * just offer it as a string.
 * @memberof types
 * @static
 */
export type WhyPaused = {
  type: string
};

export type LoadedObject = {
  objectId: string,
  parentId: string,
  name: string,
  value: any
};

/**
 * Pause
 * @memberof types
 * @static
 */
export type Pause = {
  frame: Frame,
  frames: Frame[],
  why: Why,
  loadedObjects?: LoadedObject[]
};

/**
 * Expression
 * @memberof types
 * @static
 */
export type Expression = {
  input: string,
  value: Object,
  from: string,
  updating: boolean
};

/**
 * PreviewGrip
 * @memberof types
 * @static
 */

export type PreviewGrip = {
  kind: string,
  url: string,
  fileName: string,
  message: string,
  name: string,
  ownProperties?: Object
};

/**
 * Grip
 * @memberof types
 * @static
 */
export type Grip = {
  actor: string,
  class: string,
  extensible: boolean,
  frozen: boolean,
  isGlobal: boolean,
  ownPropertyLength: number,
  preview?: PreviewGrip,
  sealed: boolean,
  type: string
};

/**
 * Source
 *
 * @memberof types
 * @static
 */
export type Source = {
  id: SourceId,
  url: string,
  sourceMapURL?: string,
  isBlackBoxed: boolean,
  isPrettyPrinted: boolean,
  isWasm: boolean,
  text?: string,
  contentType?: string,
  error?: string,
  loadedState: "unloaded" | "loading" | "loaded"
};

/**
 * Tab
 *
 * @memberof types
 * @static
 */
export type Tab = {
  id: string,
  title: string,
  tooltip: string
};

/**
 * Script
 * This describes scripts which are sent to the debug server to be eval'd
 * @memberof types
 * @static
 * FIXME: This needs a real type definition
 */
export type Script = any;

/**
 * Describes content of the binding.
 * FIXME Define these type more clearly
 */
export type BindingContents = {
  value: any
};

/**
 * Defines map of binding name to its content.
 */
export type ScopeBindings = {
  [name: string]: BindingContents
};

/**
 * Scope
 * @memberof types
 * @static
 */
export type Scope = {
  actor: ActorId,
  parent: ?Scope,
  bindings: {
    arguments: Array<ScopeBindings>,
    variables: ScopeBindings
  },
  object: ?Object,
  function: ?{
    actor: ActorId,
    class: string,
    displayName: string,
    location: Location,
    parameterNames: string[]
  },
  type: string
};

export type Worker = {
  actor: string,
  type: number,
  url: string
};
