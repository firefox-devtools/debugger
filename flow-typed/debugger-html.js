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
    column: ?number,
    sourceUrl?: string
  };

  declare type PendingLocation = {
    line: number,
    column: ?number,
    sourceUrl?: string
  };

  declare type ASTLocation = {|
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
  declare type Breakpoint = {
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
 * Breakpoint sync data
 *
 * @memberof types
 * @static
 */
  declare type BreakpointSyncData = {
    previousLocation: Location | null,
    breakpoint: Breakpoint
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
 * PendingBreakpoint
 *
 * @memberof types
 * @static
 */
  declare type PendingBreakpoint = {
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
  declare type ContextMenuItem = {
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
    loadedObjects?: LoadedObject[]
  };
  /**
 * Expression
 * @memberof types
 * @static
 */
  declare type Expression = {
    input: string,
    value: Object,
    from: string
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
   * SourceScope
   * @memberof types
   * @static
   */
  declare type SourceScope = {
    type: string,
    start: Location,
    end: Location,
    bindings: {
      [name: string]: Location[]
    }
  };

  /*
   * MappedScopeBindings
   * @memberof types
   * @static
   */
  declare type MappedScopeBindings = {
    type: string,
    bindings: {
      [originalName: string]: string
    }
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
 * Describes content of the binding.
 * FIXME Define these type more clearly
 */
  declare type BindingContents = {
    value: any
  };

  /**
 * Defines map of binding name to its content.
 */
  declare type ScopeBindings = {
    [name: string]: BindingContents
  };

  /**
 * Scope
 * @memberof types
 * @static
 */
  declare type Scope = {
    actor: ActorId,
    parent: ?Scope,
    bindings: {
      arguments: Array<ScopeBindings>,
      variables: ScopeBindings
    },
    sourceBindings?: {
      [originalName: string]: string
    },
    object: Object,
    function: {
      actor: ActorId,
      class: string,
      displayName: string,
      location: Location,
      parameterNames: string[]
    },
    type: string
  };
}
