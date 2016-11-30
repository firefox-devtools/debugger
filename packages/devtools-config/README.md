## Configuration

All default config values are in [`config/development.json`](./development.json), to override these values you need to [create a local config file](#create-a-local-config-file).

* *logging*
  * `client` Enables logging the Firefox protocol in the devtools console of the debugger
  * `firefoxProxy` Enables logging the Firefox protocol in the terminal running `npm start`
  * `actions` Enables logging the redux actions
* *features* debugger related features
  * `tabs` Enables source view tabs in the editor (CodeMirror)
  * `sourceMaps` Enables source map loading when available
  * `watchExpressions` Enables accordion component for working with watch expressions
* *chrome* Chrome browser related flags
  * `debug` Enables listening for remotely debuggable Chrome browsers
  * `port` web socket port specified when launching Chrome from the command line
  * `host` host specified when launching Chrome from the command line
* *node* Node related flags
  * `debug` Enables listening for remotely debuggable Node processes
  * `port` web socket port specified when connecting to node
  * `host` host specified when connecting to node
* *firefox* Firefox browser related flags
  * `proxyHost` Host used by the development server run with `npm start`
  * `websocketHost` Host used by the client when establishing a websocket connection with Firefox.
  * `webSocketConnection` Favours Firefox WebSocket connection over the [firefox-proxy](../bin/firefox-proxy), :warning: Experimental feature and requires [bug 1286281](https://bugzilla.mozilla.org/show_bug.cgi?id=1286281)
  * `geckoDir` Local location of Firefox source code _only needed by project maintainers_
*  *development* Development server related settings
  * `serverPort` Listen Port used by the development server
  * `examplesPort` Listen Port used to serve examples
* `hotReloading` enables [Hot Reloading](../docs/local-development.md#hot-reloading) of CSS and React
* `baseWorkerURL` Location for where the worker bundles exist

### Local config

You can create a `configs/local.json` file to override development configs. This is great for enabling features locally or changing the theme. Copy the `local-sample` to get started.

```bash
cp configs/local-sample.json configs/local-sample.json
```

> The `local.json` will be ignored by git so any changes you make won't be published, only make changes to the `development.json` file when related to features removed or added to the project.
