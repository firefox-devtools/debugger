### debugger.html

This is a prototype debugger written without any XUL and based on React and Redux.

[![Build Status](https://travis-ci.org/jlongster/debugger.html.svg?branch=master)](https://travis-ci.org/jlongster/debugger.html)

#### Getting Started

* `npm install` - Install Dependencies
* `npm run start-firefox` - Start Firefox
* `npm start` - Start Debugger

![screen shot 2016-05-16 at 1 24 29 pm](https://cloud.githubusercontent.com/assets/254562/15297643/34575ca6-1b69-11e6-9703-8ba0a029d4f9.png)

#### Running tests
* `npm test` - Run unit tests
* `npm run mocha-server` - Run unit tests in the browser
* `cypress run` - Run integration tests
* `cypress open` - Run integration tests in the browser
* `npm run lint` - Run CSS and JS linter
* `npm run storybook` - Open Storybook

#### Advanced :see_no_evil:

##### User Configuration

You can create a `development.local.json` for local user settings in `public/js/configs`.

+ `clientLogging` - set to `true` to see client logs

##### Remote Debugging
If you'd like to connect an existing Firefox browser to debugger.html, you can press `shift+F2` to open the developer toolbar and type `listen 6080` into the developer toolbar console.

##### Starting Firefox

Sometimes you will want to open firefox manually.

1) open a specific version of firefox
2) use a different profile

It is easy to open firefox with the `firefox-bin` script:

```
$ /Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin -P development --start-debugger-server 6080
```

* *--start-debugger-server 6080* Start Firefox in remote debugging mode.
* *-P development* parameter specifies a profile to use:

Firefox needs to some settings configured in `about:config` to remotely connect to devtools:

- `devtools.debugger.remote-enabled` to `true`
- `devtools.chrome.enabled` to `true`
- `devtools.debugger.prompt-connection` to `false`
