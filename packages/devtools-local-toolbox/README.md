# Local Toolbox

<img width="1271" alt="debugger-screenshot" src="https://cloud.githubusercontent.com/assets/2134/19079518/bdb69580-8a08-11e6-909c-bc74e49bc395.png">

The local toolbox makes it easy to build a developer tool for Firefox, Chrome, and Node.

[Debugger.html](../../README.md) and [Console.html](https://github.com/jasonlaster/console.html) are good examples of tools built on top of the toolbox.

**Features**
* *Dev Server* - local development environment to run your tool
* *Webpack Base* - webpack config to build on top of  
* *Landing Page* - see available connections
* *Bootstrap function* - hook to start your tool with a debuggee connection
* *Configs* - config system to add additional runtime configuration

#### Dev Server
#### Webpack Config

#### Landing Page

The [Landing Page](./src/index.js)  shows the available Chrome, Firefox, and Node tabs to debug.

**Features**
* shows available connections
* has tools title
* sets up L10N
* loads the light, dark, and firebug themes

[Screenshot ](https://cloud.githubusercontent.com/assets/254562/20671763/a749acfa-b54c-11e6-9a4a-6b0fc4f45589.png)

#### Bootstrap function

The bootstrap function starts the toolbox and provides a connection hook for doing post-connect setup with the debuggee connection.

**Features**
* checks for a connection id i.e. `firefox-tab=child1/tab1`
* gets available tabs
* connects to a debuggee tab
* renders either the Landing Page or tool root component

```js
bootstrap(React, ReactDOM, App, actions, store)
  .then(conn => onConnect(conn, actions));
```


#### Configs

The toolbox has a [config system](../devtools-config/README.md) for adding runtime configs.

**Features**
* *target configs* - firefox, chrome, node configuration
* *feature flags* toggle features in the build
* *themes* - enable light, dark, firebug
* *hot-reloading* - toggle hot Reloading
* *logging* - enable different logging support
* *environments* - different configs for development, ci, panel
* *local override* - local config overrides

Here's an example [config](https://github.com/jasonLaster/console.html/blob/master/configs/development.json).
