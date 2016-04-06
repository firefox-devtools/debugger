### debugger.html

This is a prototype debugger written without any XUL and based on React and Redux.

#### Getting Started

```js
$ npm install
$ npm start
```

Start Firefox in remote debugging mode and go to a tab you want to debug.

```
$ /Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin --start-debugger-server 6080
```

Go to the Debugger!

```
$ open index.html
```


#### Advanced

##### User Configuration

You can add an `environment.json` to set user environmental variables, like the firefox source path. Start by copying the environment.sample.

```json
{ "firefoxSrcPath" : "/Users/jlaster/src/mozilla/gecko-dev"}
```

##### Remote Debugging
If you'd like to connect an existing browser to debugger.html, you can press "shift+F2" and type "listen" with the port 6080.
