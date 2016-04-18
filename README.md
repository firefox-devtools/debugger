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

You can create a `development.local.json` for local user settings in `public/js/configs`.

##### Remote Debugging
If you'd like to connect an existing Firefox browser to debugger.html, you can press `shift+F2` to open the developer toolbar and type `listen 6080` into the developer toolbar console.
