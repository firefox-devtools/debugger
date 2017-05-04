// @flow

declare module "debugger-html" {
  /**
 * Breakpoint ID
 *
 * @memberof types
 * @static
 */
  declare type BreakpointId = string;

  /**
 * Source ID
 *
 * @memberof types
 * @static
 */
  declare type SourceId = string;

  /**
 * Actor ID
 *
 * @memberof types
 * @static
 */
  declare type ActorId = string;

  /**
 * Source File Location
 *
 * @memberof types
 * @static
 */
  declare type Location = {
    sourceId: SourceId,
    line: number,
    column?: number,
    sourceUrl?: string
  };

  /**
 * Breakpoint
 *
 * @memberof types
 * @static
 */
  declare type Breakpoint = {
    id: BreakpointId,
    location: Location,
    loading: boolean,
    disabled: boolean,
    text: string,
    condition: ?string
  };

  /**
 * Breakpoint Result is the return from an add/modify Breakpoint request
 *
 * @memberof types
 * @static
 */
  declare type BreakpointResult = {
    id: ActorId,
    actualLocation: Location
  };

  /**
 * Frame ID
 *
 * @memberof types
 * @static
 */
  declare type FrameId = string;

  /**
 * Frame
 * @memberof types
 * @static
 */
  declare type Frame = {
    id: FrameId,
    displayName: string,
    location: Location,
    source?: Source,
    scope: Scope,
    // FIXME Define this type more clearly
    this: Object,
    framework?: string
  };

  /**
 * why
 * @memberof types
 * @static
 */
  declare type Why = {
    type: string
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
  declare type WhyPaused = {
    type: string
  };

  declare type LoadedObject = {
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
  declare type Pause = {
    frames: Frame[],
    why: Why,
    getIn: (string[]) => any,
    loadedObjects?: LoadedObject[]
  };
  /**
 * Expression
 * @memberof types
 * @static
 */
  declare type Expression = {
    id: number,
    input: string
  };

  /**
  * Grip
  * @memberof types
  * @static
  */
  declare type Grip = {
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
  };

  /**
   * Source
   *
   * @memberof types
   * @static
   */
  declare type Source = {
    id: SourceId,
    url?: string,
    sourceMapURL?: string,
    isBlackBoxed: boolean,
    isPrettyPrinted: boolean
  };

  /**
   * SourceText
   * @memberof types
   * @static
   */
  declare type SourceText = {
    id: string,
    text: string,
    contentType: string,
    loading?: boolean
  };

  /**
 * Script
 * This describes scripts which are sent to the debug server to be eval'd
 * @memberof types
 * @static
 * FIXME: This needs a real type definition
 */
  declare type Script = any;

  /**
 * Scope
 * @memberof types
 * @static
 */
  declare type Scope = {
    actor: ActorId,
    parent: Scope,
    bindings: {
      // FIXME Define these types more clearly
      arguments: Array<Object>,
      variables: Object
    },
    object: Object,
    function: {
      actor: ActorId,
      class: string,
      displayName: string,
      location: Location,
      // FIXME Define this type more clearly
      parameterNames: Array<Object>
    },
    type: string
  };
}
