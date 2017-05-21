## Debugger Architecture

* [Debugger Protocol](#debugger-protocol)
* [Client and Actors](#clients-and-actors)

### Debugger Protocol

The client speaks with the server over a websocket with a JSON protocol.

### Clients and Actors

The Debugger client communicates with the server via clients and actors.

* [BreakpointClient]
* [ThreadClient]
* [SourceClient]

#### Commands
|method|Client|Actor|
|----|----------|------|
|setBreakpoint|[client][setBreakpointActor]|[actor][setBreakpointClient]|

**Add Commands**

#### Events

**Add Events**

[BreakpointClient]:https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-sham-modules/shared/client/main.js#L3008

[SourceClient]:https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-sham-modules/shared/client/main.js#L2751

[ThreadClient]:https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-sham-modules/shared/client/main.js#L1700

[setBreakpointActor]:https://dxr.mozilla.org/mozilla-central/source/devtools/server/actors/source.js#654-678
[setBreakpointClient]:https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-sham-modules/shared/client/main.js#L2925-L2969
