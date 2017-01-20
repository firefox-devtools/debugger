## Getting Setup

![][debugger-intro-gif]

### Step 1. Install Yarn

See the [Yarn install][yarn-install] instructions for steps for your OS. Make sure to install the correct version of Yarn.

<details>
<summary>macOS</summary>
```bash
brew install yarn
```
</details>

<details>
<summary>Windows</summary>
[Download Installer](https://yarnpkg.com/latest.msi)
</details>

```bash
yarn --version
0.19.1
```

*Why Yarn and not NPM?*
NPM installs the latest versions. We use [Yarn][yarn] because we want to make sure everyone is using the same libraries.

*Why not the latest version of Yarn?*
Yarn ensures we all have the same version of the packages but to make sure that is true we need to ensure everyone has the same version of Yarn.  We try to update Yarn to the latest version assuming it doesn't break anything.  Feel free to submit a pull request updating us to the latest Yarn, like [this one][yarn-update].

### Step 2. Install dependencies

```bash
git clone git@github.com:devtools-html/debugger.html.git
cd debugger.html
yarn install
```

*What should I do if I get an error?*
Yarn is still new, please comment on this [issue][yarn-issue] if you see anything weird.

### Step 3. Open Firefox

In this step, we'll open Firefox. [Chrome](#starting-chrome) and [Node](#starting-node) are also available in the Appendix. It's not required, but it's generally nice to close other browsers first.

```bash
yarn run firefox
```

With Firefox open, you should be seeing a bunch of [debugger examples][debugger-examples], these are the test pages we use when working on features and bugs.

*Why am I opening Firefox from the terminal?*
The firefox command opens firefox with special permissions that enable remote debugging.

*What should I see?*
Here's a [screenshot](https://cloud.githubusercontent.com/assets/2134/22162568/141de234-df04-11e6-9b86-77dd25822750.png)

*What should I do if this doesn't work?*
You can either try to run it [manually](#starting-firefox) or comment on the [issue][yarn-run-firefox-fails].

### Step 4. Start the Debugger

Now that Firefox is open, lets start the [development server][dev-server]. In a new terminal tab, run these commands:

```bash
cd debugger.html
yarn start
```

*What does this do?*
This command starts a [development server][dev-server].

### Step 5. Open the Debugger

Go to http://localhost:8000 in any browser to view the Debugger. If everything worked successfully, you should see something like this [screenshot](https://cloud.githubusercontent.com/assets/2134/22162697/913777b2-df04-11e6-9150-f6ad676c31ef.png) :sweat_smile:

### Next Steps

Try this [first activity][first-activity] if you want to start debugging the debugger! :clap:

## Appendix

### Quick Setup

This setup is for people on the DevTools team and DevTools wizards.

```bash
curl -o- -L https://yarnpkg.com/install.sh | bash -s -- --version 0.19.1
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

If you're looking for an alternative to `yarn run firefox`, you have two options: cli, gcli.

**Firefox CLI**

1. Run `firefox-bin` from the command line
```bash
/Applications/Firefox.app/Contents/MacOS/firefox-bin --start-debugger-server 6080 -P development
```

You'll be shown a prompt to create a new "development" profile. The development profile is where your remote development user settings will be kept. *It's a good thing :)*

1. Go to `about:config` and set these configs

Navigate to `about:config` and accept any warning message. Then search for the following preferences and double click them to toggle their values to the following. [example](http://g.recordit.co/3VsHIooZ9q.gif)

* `devtools.debugger.remote-enabled` to `true`
* `devtools.chrome.enabled` to `true`
* `devtools.debugger.prompt-connection` to `false`

1. Restart Firefox

Close firefox and re-open it with the `firefox-bin` command.

**Firefox GCLI**

* Open Firefox
* *<kbd>shift</kbd>+<kbd>F2</kbd>* Open GCLI
* Type `listen 6080` into the GCLI

NOTE: this assumes that you've set the other appropriate `about:configs`

### Starting Chrome

There are two ways to run chrome. Here's the easy way to run chrome

```bash
yarn run chrome
```

Here's the slightly harder way.

```bash
 /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --user-data-dir=/tmp/chrome-dev-profile
```

Note that the [script](../bin/chrome-driver) just automates the command :)

### Starting Node

It's easy to start Node in a mode where DevTools will find it:

* `--inspect` - tells node to open a debugger server
* `--inspect=9223` - tells node to open a debugger server on 9223 instead of 9229.
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

[debugger-intro-gif]:http://g.recordit.co/WjHZaXKifZ.gif
[debugger-examples]:https://devtools-html.github.io/debugger-examples/
[yarn-run-firefox-fails]:https://github.com/devtools-html/debugger.html/issues/1341
[linux-issue]:https://github.com/devtools-html/debugger.html/issues/1082
[windows-issue]:https://github.com/devtools-html/debugger.html/issues/1248
[yarn-issue]:https://github.com/devtools-html/debugger.html/issues/1216
[yarn-update]:https://github.com/devtools-html/debugger.html/pull/1483
[yarn]:https://yarnpkg.com
[yarn-install]:https://yarnpkg.com/en/docs/install
[dev-server]:https://github.com/devtools-html/devtools-core/blob/master/packages/devtools-launchpad/README.md#dev-server
[first-activity]:./debugging-the-debugger.md
