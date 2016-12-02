
## Toolbox Scripts

+ [dev](#dev)
  + [chrome-driver](#chrome-driver)
  + [firefox-driver](#firefox-driver)
  + [development-server](#development-server)
  + [prepare-mochitest-dev](#prepare-mochitest-dev)
  + [mocha-server](#mocha-server)
  + [node-unit-tests](#node-unit-tests)
  + [webpack.config](#webpack.config)

+ [ci](#ci)
  + [run-mochitest-docker](#run-mochitest-docker)
  + [update-docker](#update-docker)
  + [install-chrome](#install-chrome)
  + [install-firefox](#install-firefox)

+ [m-c](#m-c)
  + [make-firefox-bundle](#make-firefox-bundle)
  + [import-deps](#import-deps)
  + [download-firefox-artifact](#download-firefox-artifact)
  + [firefox-proxy](#firefox-proxy)
  + [webpack.config.devtools](#webpack.config.devtools)

-------------------------------
### dev

#### chrome-driver

#### firefox-driver

#### development-server

Features:

* serve an `index.html` root
* serve JS bundles with incremental builds and hot-reloading
* handle cross origin requests from the client
* runs firefox's tcp-ws proxy

Example [dev-server.js](https://github.com/jasonLaster/console.html/blob/master/bin/dev-server.js)

```js
toolbox.startDevServer(envConfig, webpackConfig);
```


#### prepare-mochitest-dev

#### mocha-server

#### node-unit-tests

### webpack.config

The webpack [config](../webpack.config.js) makes it easy to use the toolbox out of the box.

**Features**

* transpiles source: strips flow types, convert async to generators
* loads JSON files for L10N strings and Configs
* loads SVGs for inlining assets
* ignore modules that should be excluded (fs)
* CSS & JS hot reloading
* map shimmed modules to privileged modules when bundling for the panel
* bundles CSS into one file when building for the panel

Here's an example tool    [webpack.config.js](https://github.com/jasonLaster/console.html/blob/master/webpack.config.js).

-------------------------------
### ci

#### run-mochitest-docker

#### update-docker

#### install-chrome

#### install-firefox


-------------------------------
### m-c

#### make-firefox-bundle

#### import-deps

#### download-firefox-artifact

#### firefox-proxy

#### webpack.config.devtools
