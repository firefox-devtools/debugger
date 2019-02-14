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

| method        | Client                       | Actor                        |
| ------------- | ---------------------------- | ---------------------------- |
| setBreakpoint | [client][setbreakpointactor] | [actor][setbreakpointclient] |

**Add Commands**

#### Events

**Add Events**

[breakpointclient]: https://github.com/firefox-devtools/devtools-core/blob/master/packages/devtools-sham-modules/shared/client/main.js#L3008
[sourceclient]: https://github.com/firefox-devtools/devtools-core/blob/master/packages/devtools-sham-modules/shared/client/main.js#L2751
[threadclient]: https://github.com/firefox-devtools/devtools-core/blob/master/packages/devtools-sham-modules/shared/client/main.js#L1700
[setbreakpointactor]: https://dxr.mozilla.org/mozilla-central/source/devtools/server/actors/source.js#654-678
[setbreakpointclient]: https://github.com/firefox-devtools/devtools-core/blob/master/packages/devtools-sham-modules/shared/client/main.js#L2925-L2969

#### Adding a new Actor Method

Actor methods are defined in `shared/specs` and implemented in `actors`. In this example, we add a method `evaluateExpressions` in the Frame actor.

We can test that method in the client with the `dbg.sendPacket` helper:

```js
dbg
  .sendPacket({
    to: dbg.selectors.getSelectedFrame().id,
    type: "evaluateExpressions"
  })
  .then(console.log); // {fine: true, from: "server1.conn2.child1/frame41"}
```

```diff
diff --git a/devtools/server/actors/frame.js b/devtools/server/actors/frame.js
index e02cc1e..c177eb9 100644
--- a/devtools/server/actors/frame.js
+++ b/devtools/server/actors/frame.js
@@ -62,16 +62,26 @@ let FrameActor = ActorClassWithSpec(frameSpec, {
     return envActor.form();
   },

+  evaluateExpressions: function(a, b, c) {
+    dump(`>> evaluateExpressions:  ${a} ${b}, ${c}\n`);
+    return { fine: true };
+  },
+

diff --git a/devtools/shared/specs/frame.js b/devtools/shared/specs/frame.js
index 35510b4..a06f4a2 100644
--- a/devtools/shared/specs/frame.js
+++ b/devtools/shared/specs/frame.js
@@ -11,6 +11,9 @@ const frameSpec = generateActorSpec({
   methods: {
     getEnvironment: {
       response: RetVal("json")
+    },
+    evaluateExpressions: {
+      response: RetVal("json")
     }
   },
 });
```
