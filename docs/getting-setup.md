## Getting Set Up

![][debugger-intro-gif]

### Step 1. Install a recent version of Node.js

You can download the latest versions [here][node].

### Step 2. Install Yarn

```bash
npm i -g yarn
```

**Why Yarn and not NPM?**

NPM installs the latest versions. We use [Yarn][yarn] because we want to make sure everyone is using the same libraries.

### Step 3. Install dependencies

```bash
git clone https://github.com/firefox-devtools/debugger.git
cd debugger
yarn install
```

**What should I do if I get an error?**

Yarn is still new; if you're experiencing any unusual errors with it, please leave a comment on [this issue][yarn-issue].

### Step 4. Start the debugger

Now that Firefox is open, let's start the development server. In a new terminal tab, run these commands:

```bash
cd debugger
yarn start
```

**What does this do?**

This command starts a development server.

### Step 5. Open the debugger

Go to `localhost:8000` in any browser to view the debugger. If everything is working successfully, your screen should look something like [this](https://cloud.githubusercontent.com/assets/254562/20439428/7498808a-ad89-11e6-895d-d6db320c5009.png).

Now, open Firefox by clicking on `Launch Firefox`. [Chrome](#starting-chrome) and [Node](#starting-node) are also available in the appendix. We recommend that you close other browsers before launching Firefox, though it is not required.

After Firefox is open, you may wish to experiment with the debugger and its features. A good example website for this is called [TodoMVC](http://todomvc.com/examples/vanillajs/), where you can debug a simple "to do" application in a wide variety of JS frameworks.

**Why am I opening Firefox from inside the debugger?**

`Launch Firefox` opens Firefox with special permissions that enable remote debugging.

**What should I see?**

Here's a [screenshot][done-screenshot].

**What should I do if this doesn't work?**

You can either try to [start Firefox manually](#starting-firefox), or you can get help by commenting on [this issue](https://github.com/firefox-devtools/debugger/issues/1341).

**What should I do if am unable to see icons on debugger?**

Install packages using `yarn install`

If the certificate is unable to be verified, you can open set strict-ssl to false. You should be able to configure this by running:

`yarn config set "strict-ssl" false -g` then run `yarn install`
    
### Next Steps

Try our official getting started activity [_Debugging the Debugger_](./debugging-the-debugger.md)!

## Appendix

### Quick Setup

This setup is for people on the DevTools team (and any of you DevTools wizards out there):

```bash
npm i -g yarn
git clone https://github.com/firefox-devtools/debugger.git
cd debugger
yarn install
# close Firefox if it's already running
/Applications/Firefox.app/Contents/MacOS/firefox-bin --start-debugger-server 6080 -P development
# create a new terminal tab
cd debugger
yarn start
```

### Starting Firefox

If you're looking for an alternative to opening Firefox from inside the debugger, you must use the command-line interface (CLI).

**Firefox CLI**

1. Run `firefox-bin` from the command line.

```bash
/Applications/Firefox.app/Contents/MacOS/firefox-bin --start-debugger-server 6080 -P development
```

You'll be prompted to create a new "development profile". The development profile is where your remote development user settings will be kept.

2. Navigate to `about:config` and accept any warning messages. Then, search for the following preferences, and double-click them to toggle their values according to [this example](http://g.recordit.co/3VsHIooZ9q.gif):

- `devtools.debugger.remote-enabled` to `true`
- `devtools.chrome.enabled` to `true`
- `devtools.debugger.prompt-connection` to `false`

3. Restart Firefox by closing and reopening it with the `firefox-bin` command.

#### Using Web Sockets

If you are not seeing any tabs when you connect, it is possible that switching from a TCP server to a WS could help.

1. create a `local.json` file in `configs` and set `firefox.webSocketConnection` to `true`
2. Start Firefox from the command line

```
/Applications/Firefox\ Nightly.app/Contents/MacOS/firefox --start-debugger-server ws:8116 -P dev
```

> NOTE: if you are curious about how the debugger server starts listening on a port
> this function is useful: [devtools-startup.js](https://searchfox.org/mozilla-central/source/devtools/startup/devtools-startup.js#789-854)

### Starting Firefox Nightly

You can open and debug a Firefox Nightly tab with the command-line interface (CLI).

>Steps 4-6 is for the Firefox Nightly configuration and **only need to be done once**:

1) Update/rebase your local Debugger repository, and download [Firefox Nightly](https://www.mozilla.org/en-CA/firefox/channel/desktop/)
2) Run `yarn start` and open `localhost:8000` on your browser
3) In a separate terminal tab, open Nightly with:
```shell
# For Mac Users
/Applications/Firefox\ Nightly.app/Contents/MacOS/firefox --start-debugger-server 6080

# For Windows Users
C:\Program Files\Firefox Nightly\firefox.exe -start-debugger-server 6080
```
4) Go to `about:config` in the URL bar
5) Toggle the following preferences to their corresponding values:

|Preference Name|Value|
|--|--|
|`devtools.debugger.remote-enabled`|`true`|
|`devtools.chrome.enabled`|`true`|
|`devtools.debugger.prompt-connection`|`false`|
6) Close, and then open Firefox Nightly (like in step 3)
7) Give it a few seconds for the Nightly tab to show up in launchpad

### Starting Chrome

There are two ways to run Chrome for the purposes of remote debugging with the debugger:

The easy way:

```bash
yarn run chrome
```

And the slightly harder way:

```bash
 /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --user-data-dir=/tmp/chrome-dev-profile
```

### Starting Node

It's easy to start Node in a mode where DevTools will find it:

- _--inspect_ - tells Node to open a debugger server.
- _--inspect=9223_ - tells Node to open a debugger server on 9223 instead of 9229.
- _--debug-brk_ - tells Node to pause on the first statement.

```bash
node --inspect --debug-brk ./node_modules/.bin/webpack
```

**Note:** _./node_modules/.bin/webpack_ could be anything. We're often debugging Webpack these days, so it's often appropriate.

**Note:** Currently, Node.js debugging is limited in some ways. For example, there isn't support for seeing variables or the console, but you can manage breakpoints and navigate code execution (pause, step-in, step-over, etc.) in the debugger across various sources.

### Windows + Linux Setup

Windows and Linux should _just work_ most of the time. However, there are several edge cases.

If you find any issues on these two platforms, please leave a comment on these issues:

- [Windows][windows-issue]
- [Linux][linux-issue]

**Firefox Windows Command**

```
C:\Program Files (x86)\Mozilla Firefox\firefox.exe -start-debugger-server 6080 -P development
```

[debugger-intro-gif]: http://g.recordit.co/WjHZaXKifZ.gif
[done-screenshot]: https://cloud.githubusercontent.com/assets/254562/20439409/55e3994a-ad89-11e6-8e76-55e18c7c0d75.png
[linux-issue]: https://github.com/firefox-devtools/debugger/issues/1082
[windows-issue]: https://github.com/firefox-devtools/debugger/issues/1248
[yarn-issue]: https://github.com/firefox-devtools/debugger/issues/1216
[yarn]: https://yarnpkg.com
[node]: https://nodejs.org/
