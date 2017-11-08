## Getting Setup

![][debugger-intro-gif]

:construction_worker: If something goes wrong, checkout our [most common issues][common-issues] and find us in [slack]!

### Step 1. Installing the Debugger

First, we'll clone the debugger locally, then we'll install its
dependencies with [Yarn]. If you don't have Yarn, you can install it [here][yarn-install].

Also, before you start, it's helpful to make sure you have node 7.
We recommend, [nvm] for updating the latest node.

```bash
git clone https://github.com/devtools-html/debugger.html.git
cd debugger.html
yarn install
```

*What should I do if I get an error?*



*Why Yarn and not NPM?*

We like [Yarn] because it makes sure everyone is using the same library versions.

### Step 2. Start the Debugger

Next, we'll start the debugger and run it [locally][dev-server].

```bash
yarn start
```

Open `http://localhost:8000` in any browser and launch
Firefox or Chrome. You should now be able to select a
tab to debug.

| Launchpad | Tabs |
| -- | -- |
| ![pad2-screenshot] | ![launchpad-screenshot] |

Congratulations! You're now up and running. :sweat_smile:

*What should I do if I get an error?*

Ask in our [slack] channel or file an issue [issue][yarn-run-firefox-fails] here.

Here is a list of some of the [most common issues][common-issues]

### Next Steps

Try this [first activity][first-activity] if you want to start debugging the debugger! :clap:

## Appendix

### Quick Setup

This setup is for people on the DevTools team and DevTools wizards.

```bash
curl -o- -L https://yarnpkg.com/install.sh | bash -s
git clone git@github.com:devtools-html/debugger.html.git
cd debugger.html
yarn install

# close firefox if it's already running
/Applications/Firefox.app/Contents/MacOS/firefox-bin --start-debugger-server 6080 -P development

# create a new terminal tab
cd debugger.html
yarn start
```

### Starting Firefox

If you're looking for an alternative to `yarn run firefox`, you have several
alternatives.

#### Firefox CLI

##### 1. Run `firefox-bin` from the command line
```bash
/Applications/Firefox.app/Contents/MacOS/firefox-bin --start-debugger-server 6080 -P development
```

You'll be shown a prompt to create a new "development" profile. The development profile is where your remote development user settings will be kept. *It's a good thing :)*

##### 2. Go to `about:config` and set these preferences

Navigate to `about:config` and accept any warning message. Then search for the following preferences and double click them to toggle their values to the following. [example](http://g.recordit.co/3VsHIooZ9q.gif)

* `devtools.debugger.remote-enabled` to `true`
* `devtools.chrome.enabled` to `true`
* `devtools.debugger.prompt-connection` to `false`

##### 3. Restart Firefox

Close firefox and re-open it with the `firefox-bin` command.

#### Firefox GCLI

1. Open Firefox
2. Press <kbd>shift</kbd>+<kbd>F2</kbd> to open GCLI
3. Type `listen 6080` into GCLI

NOTE: This assumes that you've already set the other preferences in
`about:config`.

#### Firefox using WebSocket transport

The default, traditional way to connect to Firefox uses a custom TCP protocol.
However, Firefox also now supports connecting via WebSockets as well.  To use
this mode:

##### 1. Create a `configs/local.json` file in your `debugger.html` clone with:
```
{
  "firefox": {
    "webSocketConnection": true,
    "webSocketHost": "localhost:6080"
  }
}
```
##### 2. Enable WebSocket mode when opening the server socket
  * With the Firefox CLI approach, add the `ws:` prefix to the port:
  ```bash
  /Applications/Firefox.app/Contents/MacOS/firefox-bin --start-debugger-server ws:6080 -P development
  ```
  * With the GCLI approach, enter `listen 6080 websocket`


### Starting Chrome

There are two ways to run chrome. Here's the easy way to run chrome

```bash
yarn run chrome
```

Here's the slightly harder way.

```bash
 /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --user-data-dir=/tmp/chrome-dev-profile
```

Note that the [script](https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-launchpad/bin/chrome-driver.js) just automates the command :)

### Starting Node

It's easy to start Node in a mode where DevTools will find it:

* `--inspect` - tells node to open a debugger server
* `--debug-brk` - tells node to pause on the first statement

```bash
node --inspect --debug-brk ./node_modules/.bin/webpack
```

**Note** *./node_modules/.bin/webpack* could be anything. We're often debugging webpack these days so it's often appropriate :unamused:

**Note:** Currently Node.js debugging is limited in some ways, there isn't support for seeing variables or the console, but you can manage breakpoints and navigate code execution (pause, step-in, step-over, etc.) in the debugger across various sources.

### Windows + Linux setup

Windows and Linux should *just work*, but unfortunately there are several edge cases.

If you find any issues on these two platforms comment on these issues:
* [windows][windows-issue]
* [linux][linux-issue]

**Firefox windows command**

```bash
"C:\Program Files (x86)\Mozilla Firefox\firefox.exe" -start-debugger-server 6080 -P development
```

### Debugger examples

Starting Firefox or Chrome following the previous steps opens the browser on [the online debugger examples][debugger-examples].

If you want to hack the debugger even with being offline, you might want to get [the repo containing those examples][debugger-examples] to run them locally.

[debugger-intro-gif]:http://g.recordit.co/WjHZaXKifZ.gif
[debugger-examples]:https://devtools-html.github.io/debugger-examples/
[debugger-examples-repo]:https://github.com/devtools-html/debugger-examples
[yarn-run-firefox-fails]:https://github.com/devtools-html/debugger.html/issues/1341
[linux-issue]:https://github.com/devtools-html/debugger.html/issues/1082
[windows-issue]:https://github.com/devtools-html/debugger.html/issues/1248
[yarn-issue]:https://github.com/devtools-html/debugger.html/issues/1216
[yarn-update]:https://github.com/devtools-html/debugger.html/pull/1483
[Yarn]:https://yarnpkg.com
[yarn-install]:https://yarnpkg.com/en/docs/install
[dev-server]:https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-launchpad/README.md#dev-server
[first-activity]: ./debugging-the-debugger.md
[common-issues]: ./most-common-issues.md
[slack]:https://devtools-html-slack.herokuapp.com/
[launchpad-screenshot]:https://cloud.githubusercontent.com/assets/2134/22162697/913777b2-df04-11e6-9150-f6ad676c31ef.png
[nvm]:https://github.com/creationix/nvm
[pad2-screenshot]: https://shipusercontent.com/1b41eb3d0f4630ed9197c737cb6e3cb4/Screen%20Shot%202017-11-08%20at%2010.08.51%20AM.png
