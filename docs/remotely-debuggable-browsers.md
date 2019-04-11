## Remotely debuggable browsers

#### Table Of Contents

* [Firefox](#firefox)
  * [MacOS](#macos)
    * [Firefox](#firefox-release)
    * [Firefox Nightly](#firefox-nightly)
  * [Windows](#windows)
    * [Firefox (all versions)](#firefox-all-versions)
    * [Firefox (64 bit)](#firefox-64-bit)
  * [Android](#android)

* [Chrome](#chrome)
  * [MacOS](#macos-1)
    * [Chrome (release)](#chrome-release)
    * [Chrome Canary](#chrome-canary)
  * [Windows](#windows-1)
    * [Chrome (all versions)](#chrome-all-versions)
    * [Chrome (64 bit)](#chrome-64-bit)

* [Safari](#safari)
  * [iOS Simulator](#ios-simulator-mac-only)

Here are quick instructions for getting the Firefox and Chrome web browsers running in a remotely debuggable state.

On the Mac all instructions assume you've opened a window in the Terminal application.  On Windows all instructions assume you've opened the `cmd` application.

### Firefox

Here are the instructions for starting a new profile of Firefox on MacOS and Windows.  Please file issues or make pull requests for any errors you encounter.

**Required Flags**

Running the Firefox profile you intended to debug navigate to `about:config` and use the search to find the following preferences.  Double clicking the boolean preferences is the fastest way to toggle them.  **You must restart Firefox** once you've made these changes.

* `devtools.debugger.remote-enabled` to `true`
* `devtools.chrome.enabled` to `true`
* `devtools.debugger.prompt-connection` to `false`

> **Already running Firefox?** If you would like to make your current Firefox remotely debuggable; press `shift+F2` and type `listen` in the command bar.  Make sure you have enabled the required preferences above.

#### MacOS

On the Mac Firefox installs different application names for each release channel (release, beta, aurora, nightly) instead of overwriting the existing application.

**Flags**

These are the flags necessary to start the remote debug server and use an alternate profile.

* debug server `--start-debugger-server 6080`
* temporary profile `--profile $TMPDIR/fx-dev-profile`

##### Firefox (release)

```
$ /Applications/Firefox.app/Contents/MacOS/firefox-bin --start-debugger-server 6080 --profile $TMPDIR/fx-dev-profile
```

> For Firefox Beta or Developer Edition (Aurora) replace the `Firefox.app` from the command above with the following app names
> * FirefoxBeta.app
> * FirefoxDeveloperEdition.app

##### Firefox Nightly

```
$ /Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin --start-debugger-server 6080 --profile $TMPDIR/fx-dev-profile
```

#### Windows

**Flags**

* debug server `-start-debugger-server 6080`
* temporary profile `-profile %TEMP%\fx-dev-profile`

**64 bit Windows**

For users with a 64 bit machine Firefox may have installed in the: `C:\Program Files (x86)` folder.

##### Firefox (all versions)

```
$ "C:\Program Files\Mozilla Firefox\firefox.exe" -start-debugger-server 6080 -profile %TEMP%\fx-dev-profile
```

##### Firefox (64 bit)

```
$ "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" -start-debugger-server 6080 -profile %TEMP%\fx-dev-profile
```

#### Android

Firefox for Android creates a Unix socket and listens there for debugger connections. To connect to it, use the [adb](https://developer.android.com/studio/command-line/adb.html) tool's port forwarding feature:

```
adb forward tcp:6080 localfilesystem:/data/data/org.mozilla.fennec/firefox-debugger-socket
```

The exact path to the socket differs based on release channel. You can find the right value in Firefox on Android by loading about:config and checking the value of the preference ``devtools.debugger.unix-domain-socket``.

### Chrome

Here are the instructions for starting a new temporary profile of Chrome on MacOS and Windows.  Please file issues or make pull requests for any errors you encounter.

#### MacOS

**Flags**

* debug server `--remote-debugging-port=9222`
* ignore first run setup `--no-first-run`
* temporary profile `--user-data-dir=$TMPDIR/chrome-dev-profile`

##### Chrome (release)

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --user-data-dir=$TMPDIR/chrome-dev-profile
```

##### Chrome Canary

```
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary --remote-debugging-port=9222 --no-first-run --user-data-dir=$TMPDIR/chrome-dev-profile
```

#### Windows

**Flags**

* debug server `--remote-debugging-port=9222`
* ignore first run setup `--no-first-run`
* temporary profile `--user-data-dir=%TEMP%\chrome-dev-profile`

##### Chrome (all versions)

```
$ "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --no-first-run --user-data-dir=%TEMP%\chrome-dev-profile
```

##### Chrome (64 bit)

```
$ "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --no-first-run --user-data-dir=%TEMP%\chrome-dev-profile
```

### Safari

These are the instructions for getting the *debugger* project to connect to and debug Safari on various platforms. Please file issues or make pull requests for any errors you encounter.

#### iOS Simulator (Mac only)

**Requirements**

* Xcode
  * Download and install [Xcode](https://developer.apple.com/xcode/) from Apple
* [ios-webkit-debug-proxy](https://github.com/google/ios-webkit-debug-proxy)
  * `brew install ios-webkit-debug-proxy`

##### Safari

* Start the iOS Simulator
  * Launch Xcode and then launch the simulator using the following instructions

![xcode-start-simulator](https://cloud.githubusercontent.com/assets/2134/18512759/debce848-7a8a-11e6-981f-1a0017eb098e.png)


* Run the proxy in a terminal

```shell
ios_webkit_debug_proxy
```

* Run the [debugger](https://github.com/firefox-devtools/debugger)
  * `npm start`
* Connect using the following URL
  * [http://localhost:8000/?ws=localhost:9222/devtools/page/1](http://localhost:8000/?ws=localhost:9222/devtools/page/1)
