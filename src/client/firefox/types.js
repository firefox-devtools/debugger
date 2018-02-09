/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * These are Firefox specific types that allow us to type check
 * the packet information exchanged using the Firefox Remote Debug Protocol
 * https://wiki.mozilla.org/Remote_Debugging_Protocol
 */

import type {
  FrameId,
  ActorId,
  Script,
  Source,
  Pause,
  Frame,
  SourceId
} from "../../types";

type URL = string;

/**
 * The protocol is carried by a reliable, bi-directional byte stream; data sent
 * in both directions consists of JSON objects, called packets. A packet is a
 * top-level JSON object, not contained inside any other value.
 *
 * Every packet sent to the client has the form:
 *  `{ "to":actor, "type":type, ... }`
 *
 * where actor is the name of the actor to whom the packet is directed and type
 * is a string specifying what sort of packet it is. Additional properties may
 * be present, depending on type.
 *
 * Every packet sent from the server has the form:
 *  `{ "from":actor, ... }`
 *
 * where actor is the name of the actor that sent it. The packet may have
 * additional properties, depending on the situation.
 *
 * If a packet is directed to an actor that no longer exists, the server
 * sends a packet to the client of the following form:
 *  `{ "from":actor, "error":"noSuchActor" }`
 *
 * where actor is the name of the non-existent actor. (It is strange to receive
 * messages from actors that do not exist, but the client evidently believes
 * that actor exists, and this reply allows the client to pair up the error
 * report with the source of the problem.)
 *
 * Clients should silently ignore packet properties they do not recognize. We
 * expect that, as the protocol evolves, we will specify new properties that
 * can appear in existing packets, and experimental implementations will do
 * the same.
 *
 * @see https://wiki.mozilla.org/Remote_Debugging_Protocol#Packets
 * @memberof firefox/packets
 * @static
 */

/**
 * Frame Packet
 * @memberof firefox/packets
 * @static
 */
export type FramePacket = {
  actor: ActorId,
  arguments: any[],
  callee: any,
  environment: any,
  this: any,
  depth?: number,
  oldest?: boolean,
  type: "pause" | "call",
  where: ActualLocation
};

/**
 * Firefox Source File payload
 * introductionType can be a "scriptElement"
 * @memberof firefox/payloads
 * @static
 */
export type SourcePayload = {
  actor: ActorId,
  generatedUrl?: URL,
  introductionType: string,
  introductionUrl?: URL,
  isBlackBoxed: boolean,
  isPrettyPrinted: boolean,
  isSourceMapped: boolean,
  sourceMapURL?: URL,
  url: URL
};

/**
 * Source Packet sent when there is a "new source" event
 * coming from the debug server
 * @memberof firefox/packets
 * @static
 */
export type SourcePacket = {
  from: ActorId,
  source: SourcePayload,
  type: string
};

/**
 * Sources Packet from calling threadClient.getSources();
 * @memberof firefox/packets
 * @static
 */
export type SourcesPacket = {
  from: ActorId,
  sources: SourcePayload[]
};

/**
 * Pause Packet sent when the server is in a "paused" state
 *
 * @memberof firefox
 * @static
 */
export type PausedPacket = {
  actor: ActorId,
  from: ActorId,
  type: string,
  frame: FramePacket,
  why: {
    actors: ActorId[],
    type: string,
    onNext?: Function
  }
};

export type ResumedPacket = {
  from: ActorId,
  type: string
};

/**
 * Location of an actual event, when breakpoints are set they are requested
 * at one location but the server will respond with the "actual location" where
 * the breakpoint was really set if it differs from the requested location.
 *
 * @memberof firefox
 * @static
 */
export type ActualLocation = {
  source: SourcePayload,
  line: number,
  column?: number
};

/**
 * Response from the `getFrames` function call
 * @memberof firefox
 * @static
 */
export type FramesResponse = {
  frames: FramePacket[],
  from: ActorId
};

export type TabPayload = {
  actor: ActorId,
  animationsActor: ActorId,
  callWatcherActor: ActorId,
  canvasActor: ActorId,
  consoleActor: ActorId,
  cssPropertiesActor: ActorId,
  cssUsageActor: ActorId,
  directorManagerActor: ActorId,
  emulationActor: ActorId,
  eventLoopLagActor: ActorId,
  framerateActor: ActorId,
  gcliActor: ActorId,
  inspectorActor: ActorId,
  memoryActor: ActorId,
  monitorActor: ActorId,
  outerWindowID: number,
  performanceActor: ActorId,
  performanceEntriesActor: ActorId,
  profilerActor: ActorId,
  promisesActor: ActorId,
  reflowActor: ActorId,
  storageActor: ActorId,
  styleEditorActor: ActorId,
  styleSheetsActor: ActorId,
  timelineActor: ActorId,
  title: string,
  url: URL,
  webExtensionInspectedWindowActor: ActorId,
  webaudioActor: ActorId,
  webglActor: ActorId
};

/**
 * Response from the `listTabs` function call
 * @memberof firefox
 * @static
 */
export type ListTabsResponse = {
  actorRegistryActor: ActorId,
  addonsActor: ActorId,
  deviceActor: ActorId,
  directorRegistryActor: ActorId,
  from: string,
  heapSnapshotFileActor: ActorId,
  preferenceActor: ActorId,
  selected: number,
  tabs: TabPayload[]
};

/**
 * Actions
 * @memberof firefox
 * @static
 */
export type Actions = {
  paused: Pause => void,
  resumed: ResumedPacket => void,
  newSources: (Source[]) => void,
  fetchEventListeners: () => void,
  updateWorkers: () => void
};

/**
 * Tab Target gives access to the browser tabs
 * @memberof firefox
 * @static
 */
export type TabTarget = {
  on: (string, Function) => void,
  activeConsole: {
    evaluateJS: (
      script: Script,
      func: Function,
      params?: { frameActor?: FrameId }
    ) => void
  },
  form: { consoleActor: any },
  activeTab: {
    navigateTo: string => Promise<*>,
    reload: () => Promise<*>
  },
  destroy: () => void
};

/**
 * Clients for accessing the Firefox debug server and browser
 * @memberof firefox/clients
 * @static
 */

/**
 * DebuggerClient
 * @memberof firefox
 * @static
 */
export type DebuggerClient = {
  _activeRequests: {
    get: any => any,
    delete: any => void
  },
  mainRoot: {
    traits: any
  },
  connect: () => Promise<*>,
  listTabs: () => Promise<*>
};

export type TabClient = {
  listWorkers: () => Promise<*>,
  addListener: (string, Function) => void
};

/**
 * A grip is a JSON value that refers to a specific JavaScript value in the
 * debuggee. Grips appear anywhere an arbitrary value from the debuggee needs
 * to be conveyed to the client: stack frames, object property lists, lexical
 * environments, paused packets, and so on.
 *
 * For mutable values like objects and arrays, grips do not merely convey the
 * value's current state to the client. They also act as references to the
 * original value, by including an actor to which the client can send messages
 * to modify the value in the debuggee.
 *
 * @see https://wiki.mozilla.org/Remote_Debugging_Protocol#Grips
 * @memberof firefox
 * @static
 */
// FIXME: need Grip definition
export type Grip = {
  actor: string
};

export type FunctionGrip = {|
  class: "Function",
  name: string,
  parameterNames: string[],
  displayName: string,
  userDisplayName: string,
  url: string,
  line: number,
  column: number
|};

/**
 * SourceClient
 * @memberof firefox
 * @static
 */
export type SourceClient = {
  source: () => Source,
  setBreakpoint: ({
    line: number,
    column: ?number,
    condition: boolean,
    noSliding: boolean
  }) => Promise<BreakpointResponse>,
  prettyPrint: number => Promise<*>,
  disablePrettyPrint: () => Promise<*>,
  blackBox: () => Promise<*>,
  unblackBox: () => Promise<*>
};

/**
 * ObjectClient
 * @memberof firefox
 * @static
 */
export type ObjectClient = {
  getPrototypeAndProperties: () => any
};

/**
 * ThreadClient
 * @memberof firefox
 * @static
 */
export type ThreadClient = {
  resume: Function => Promise<*>,
  stepIn: Function => Promise<*>,
  stepOver: Function => Promise<*>,
  stepOut: Function => Promise<*>,
  rewind: Function => Promise<*>,
  reverseStepIn: Function => Promise<*>,
  reverseStepOver: Function => Promise<*>,
  reverseStepOut: Function => Promise<*>,
  breakOnNext: () => Promise<*>,
  // FIXME: unclear if SourceId or ActorId here
  source: ({ actor: SourceId }) => SourceClient,
  pauseGrip: (Grip | Function) => ObjectClient,
  pauseOnExceptions: (boolean, boolean) => Promise<*>,
  interrupt: () => Promise<*>,
  eventListeners: () => Promise<*>,
  getFrames: (number, number) => FramesResponse,
  getEnvironment: (frame: Frame) => Promise<*>,
  addListener: (string, Function) => void,
  getSources: () => Promise<SourcesPacket>,
  reconfigure: ({ observeAsmJS: boolean }) => Promise<*>,
  getLastPausePacket: () => ?PausedPacket,
  _parent: TabClient
};

/**
 * BreakpointClient
 * @memberof firefox
 * @static
 */
export type BreakpointClient = {
  actor: ActorId,
  remove: () => void,
  location: {
    actor: string,
    url: string,
    line: number,
    column: ?number,
    condition: string
  },
  setCondition: (ThreadClient, boolean, boolean) => Promise<BreakpointClient>,
  // getCondition: () => any,
  // hasCondition: () => any,
  // request: any,
  source: SourceClient
};

export type BPClients = { [id: ActorId]: BreakpointClient };

export type BreakpointResponse = [
  {
    actor?: ActorId,
    from?: ActorId,
    isPending?: boolean,
    actualLocation?: ActualLocation
  },
  BreakpointClient
];

export type FirefoxClientConnection = {
  getTabTarget: () => TabTarget,
  getThreadClient: () => ThreadClient,
  setTabTarget: (target: TabTarget) => void,
  setThreadClient: (client: ThreadClient) => void
};
