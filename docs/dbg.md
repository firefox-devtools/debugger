# DBG helper


### store

`dbg.store` redux store.

```js
const store = dbg.store.getState()

// select a source
const source = dbg.store.getState().sources.sources.first();
```

### actions

`dbg.actions` redux actions.
The actions are bound so you can call them directly!

```js
const source = dbg.store.getState().sources.sources.first();
dbg.actions.selectSource(source.id))
```

### selectors

`dbg.selectors` redux selectors.
The selectors are bound so you can call them without `store.getState()`!

```js
const source = dbg.selectors.getSelectedSource();
```

### client

`dbg.client` firefox commands.
The commands are the interface for talking to the debugger server.

```js
const source = dbg.selectors.getSelectedSource();
dbg.client
  .setBreakpoint({line: 24, sourceId: source.id})
  .then(console.log)
```

### prefs

`dbg.prefs` references the PreferencesHelper. You can use `dbg.prefs` to see or change the state of any pref.

```js
dbg.prefs.pauseOnExceptions // false
dbg.prefs.pauseOnExceptions = true
dbg.prefs.pauseOnExceptions // true
```

### features

`dbg.features` references the debugger's feature flags. You can use `dbg.features` to see or change the state of any flag.

```js
dbg.features.codeCoverage // false
dbg.features.codeCoverage = true
dbg.features.codeCoverage // true
```


### helpers

#### findSource

Sometimes you want to quickly grab a source object from the store, but you don't know the full url or source id. The `findSource` function is your friend here :)

```js
dbg.helpers.findSource("todo-view")
/*
{
  "isPrettyPrinted": false,
  "loadedState": "loaded",
  "text": "/*global B",
  "sourceMapURL": null,
  "isWasm": false,
  "url": "http://firefox-dev.tools/debugger-examples/examples/todomvc/js/views/todo-view.js",
  "contentType": "text/javascript",
  "isBlackBoxed": false,
  "id": "server1.conn16.child1/source33"
}
*/
```

#### sendPacket

`dbg.sendPacket` sends a packet to the server. This is a useful helper for prototyping new APIs that aren't used in the UI yet.

```js
dbg
  .sendPacket({
    to: dbg.selectors.getSelectedFrame().id,
    type: "evaluateExpressions"
  })
  .then(console.log)
```

#### evaluate

`dbg.helpers.evaluate` evaluate expressions in the context of the debuggee

```js
dbg.helpers.evaluate("2+2")
/*
{
  from: "server1.conn12.child1/consoleActor2",
  input: "2+2",
  result: 4,
  timestamp: 1517618115032,
  exception: null
}
*/

dbg.helpers.evaluate("2+2",  r => console.log(`yay ${r.result}`)) // yay 4
```
