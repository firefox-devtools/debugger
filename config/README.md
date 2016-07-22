## Configuration

All default config values are in [`config/development.json`](./development.json), to override these values you need to [create a local config file](#create-a-local-config-file).

* `logging`
  * `client` Enables logging the Firefox protocol in the devtools console of the debugger
  * `firefoxProxy` Enables logging the Firefox protocol in the terminal running `npm start`
* `features` debugger related features
  * `tabs` Enables source view tabs in the editor (CodeMirror)
  * `sourceMaps` Enables source map loading when available
* `chrome` Chrome browser related flags
  * `debug` Enables listening for remotely debuggable Chrome browsers
  * `webSocketPort` Configures the web socket port specified when launching Chrome from the command line
* `firefox` Firefox browser related flags
  * `proxyPort` Port used by the development server run with `npm start`
  * `webSocketConnection` Favours Firefox WebSocket connection over the [firefox-proxy](../bin/firefox-proxy), :warning: Experimental feature and requires [bug 1286281](https://bugzilla.mozilla.org/show_bug.cgi?id=1286281)
  * `geckoDir` Local location of Firefox source code _only needed by project maintainers_
* `hotReloading` enables [Hot Reloading](../docs/local-development.md#hot-reloading) of CSS and React

### Create a local config file

To override any of the default configuration values above you need to create a new file in the config directory called `local.json`; it is easiest if you copy the `development.json` file.

* Copy the [`config/development.json`](./config/development.json) to `config/local.json`

> The `local.json` will be ignored by git so any changes you make won't be published, only make changes to the `development.json` file when related to features removed or added to the project.
