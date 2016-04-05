# Debugger Experiment

## Getting Started

### 1. Install Dependencies
```js
$ npm install
```

### 2. Add Environment file

You'll need to add an `environment.json` file to set your path to the gecko repository.

```json
{ "geckoPath" : "/Users/jlaster/src/mozilla/gecko-dev"}
```

### 3. Start Firefox

You need to start a new instance of Firefox that you will be
debugging. Either press "shift+F2" and type "listen" in the new
instance or use the command line flag:

```
$ /Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin --start-debugger-server 6080
```

### 4. Start Debugger.html

Debugger.html requires two things to run in order to work, a websocket-proxy and webpack. Both of these tools are started by `npm start`.

```js
npm start
```

### 5. View the Debugger

```
$ open index.html
```
