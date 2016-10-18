# Local Toolbox


<img width="1271" alt="debugger-screenshot" src="https://cloud.githubusercontent.com/assets/2134/19079518/bdb69580-8a08-11e6-909c-bc74e49bc395.png">

![Circle CI status](https://circleci.com/gh/devtools-html/debugger.html.svg??&style=shield)
[![npm version](https://img.shields.io/npm/v/debugger.html.svg)](https://www.npmjs.com/package/debugger.html)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)


## Components

* RDP Client
* Landing Page
* Config


#### Firefox

* *lib/devtools*
* *client/shared/main*

#### Chrome

* *chrome-remote-debugging-protocol*

## Getting Started

If you're building a new **embedded application**, you will be able to use
the [rdp client]() out of the box. The client will let you connect to firefox,
chrome, and node, get the available tabs, and debug a single tab.

If you're building a new **application**, you can use the local toolbox as well,
which provides a UI for connecting to a tab and development environment for building
out your app. It is what we use to build the Firefox Debugger, so it *has* to be good!
