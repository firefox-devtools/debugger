### debugger.html

This is a prototype debugger written without any XUL and based on React and Redux.

[![Build Status](https://travis-ci.org/jlongster/debugger.html.svg?branch=master)](https://travis-ci.org/jlongster/debugger.html)

#### Getting Started

```
$ npm install
$ npm start
$ python -m SimpleHTTPServer 8000 
```

Start Firefox in remote debugging mode and go to a tab you want to debug.

```
$ /Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin --start-debugger-server 6080
```

Set additional configuration options in Firefox using `about:config`:

- `devtools.debugger.remote-enabled` to `true`
- `devtools.chrome.enabled` to `true`
- `devtools.debugger.prompt-connection` to `false`


Open the debugger in another browser by visiting

```
localhost:8000
```


#### Advanced

##### User Configuration

You can add an `environment.json` to set user environmental variables, like the firefox source path. Start by copying the environment.sample.

```json
{ "firefoxSrcPath" : "/Users/jlaster/src/mozilla/gecko-dev"}
```

##### Remote Debugging
If you'd like to connect an existing browser to debugger.html, you can press "shift+F2" and type "listen" with the port 6080.
