### DevTools Client Adapters

DevTools Client Adapters provides a common interface for:

1. getting firefox, chrome, and node tabs
2. connecting to a tab
3. communicating with the tab over RDP

##### get Firefox, Chrome, and Node tabs

```js
client.firefox.connectClient().then(tabs => {
  console.log(tabs)
});

client.chrome.connectClient().then(tabs => {
  console.log(tabs)
});

client.chrome.connectNodeClient().then(tabs => {
  console.log(tabs)
});


client.chrome.connectClient().then(tabs => {
  console.log(tabs)
});
```

##### connect to either Firefox, Chrome, or Node
```js
client.startDebuggingTab(tab)
client.startDebuggingNode(tab)
```

##### send commands to the process
```js
tab.setBreakpoint({ sourceId: 23, line: 2, column: 0 })
tab.resume()
```

##### receive events from the process

```js
tab.on("paused", pauseData => console.log(pauseData))
```
