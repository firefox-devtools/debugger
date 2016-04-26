### debugger.html

This is a prototype debugger written without any XUL and based on React and Redux.

[![Build Status](https://travis-ci.org/jlongster/debugger.html.svg?branch=master)](https://travis-ci.org/jlongster/debugger.html)

#### Getting Started

```
$ npm install
$ npm start
```

Start Firefox in remote debugging mode. The `-P` parameter specifies a profile to use:

```
$ /Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin -P development --start-debugger-server 6080
```

Set additional configuration options in Firefox using `about:config`:

- `devtools.debugger.remote-enabled` to `true`
- `devtools.chrome.enabled` to `true`
- `devtools.debugger.prompt-connection` to `false`

Quit and re-open firefox with the same command. Go to some pages like [todomvc](http://todomvc.com/examples/backbone/) or [nyt](http://www.nytimes.com/).

Then open another browser and go to `http://localhost:8000`.

#### Advanced :see_no_evil:

##### User Configuration

You can create an `environment.json` to set user environmental variables, like the firefox source path. Start by copying the [`environment.sample`](https://github.com/jlongster/debugger.html/blob/master/environment.sample) file and update the source code location. **This is only necessary if you want to run tests**.

 * **firefoxSrcDir**: _absolute path to local firefox source code_
 * **firefoxObjDir**: _absolute path to a local build of firefox_

**NOTE**: Firefox source code is available on github at [gecko-dev](https://github.com/mozilla/gecko-dev/).  For a faster download add the depth option to your git clone `git clone --depth=1 https://github.com/mozilla/gecko-dev.git`  The MDN article [Working with Mozilla source code](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Source_Code) has a number of other options.

##### Remote Debugging
If you'd like to connect an existing Firefox browser to debugger.html, you can press `shift+F2` to open the developer toolbar and type `listen 6080` into the developer toolbar console.
