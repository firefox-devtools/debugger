## Remotely debuggable browsers

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
* separate profile `-P development` (not required)
 * **Note**: if you are prompted with the profile manager you will need to create a profile named `development`

##### Firefox (release)

```
$ /Applications/Firefox.app/Contents/MacOS/firefox-bin --start-debugger-server 6080 -P development
```

##### Firefox Beta

```
$ /Applications/FirefoxBeta.app/Contents/MacOS/firefox-bin --start-debugger-server 6080 -P development
```

##### Firefox Developer Edition (Aurora)

```
$ /Applications/FirefoxDeveloperEdition.app/Contents/MacOS/firefox-bin --start-debugger-server 6080 -P development
```

##### Firefox Nightly

```
$ /Applications/FirefoxNightly.app/Contents/MacOS/firefox-bin --start-debugger-server 6080 -P development
```

#### Windows

**Flags**

* debug server `-start-debugger-server 6080`
* separate profile `-P development`

**64 bit Windows**

For users with a 64 bit machine Firefox may have installed in the: `C:\Program Files (x86)` folder.

##### Firefox (all versions)

```
$ "C:\Program Files\Mozilla Firefox\firefox.exe" -start-debugger-server 6080 -P development
```

##### Firefox (64 bit)

```
$ "C:\Program Files (x86)\Mozilla Firefox\firefox.exe" -start-debugger-server 6080 -P development
```


### Chrome

Here are the instructions for starting a new temporary profile of Chrome on MacOS and Windows.  Please file issues or make pull requests for any errors you encounter.

#### MacOS

**Flags**

* debug server `--remote-debugging-port=9222`
* ignore first run setup `--no-first-run`
* use temporary profile `--user-data-dir=/tmp/chrome-dev-profile`

##### Chrome (release)

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --user-data-dir=/tmp/chrome-dev-profile
```

##### Chrome Canary

```
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --user-data-dir=/tmp/chrome-dev-profile
```

#### Windows

**Flags**

* debug server `--remote-debugging-port=9222`
* ignore first run setup `--no-first-run`
* use temporary profile `--user-data-dir=%TEMP%\chrome-dev-profile`

##### Chrome (all versions)

```
$ "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --no-first-run --user-data-dir=%TEMP%\chrome-dev-profile
```

##### Chrome (64 bit)

```
$ "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --no-first-run --user-data-dir=%TEMP%\chrome-dev-profile
```
