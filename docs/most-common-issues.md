## Common Issues

* [Node](#node)
* [Yarn](#yarn)
* [Repo](#repo)
* [babel cache](#babel)
* [global node packages](#global-packages)
* [firefox plugin](#firefox-plugin)
* [windows / linux](#windows--linux)
* [Competing scripts](#competing-scripts)

We do our best to have a 3 step / 1 minute install process,
but we use bleeding edge technology and problems do arise. Here are our
most seen issues. Please stop by and ask us a question in [slack],
that's what we're here for!

### Node

#### Version

We recommend using the latest node, but either Node 7x or 8x will work.
If you're worried you are using a later node, you can check with `node -v`.

If you want to upgrade, we advise using [nvm], which will make it easier to
stay up to date.

#### Global Packages

It's possible that you're unintentionally using a globally installed package.
This can happen if you have `jest`, `webpack`, or other packages installed globally.
You can view your global packages here `npm ls -g`. If you're having issues that you
suspect are due to global packages, you can use [nvm] to install a new version of node
which wont have any packages.

### Yarn

We use [Yarn][yarn] to install our packages. Yarn however is still new technology and can
mess up where it installs things, which can affect how scripts are run (jest, flow)...

The latest version of Yarn is 1x, but we recommend using `0.28.4`. You can ironically re-install yarn with
npm globally: `npm i -g yarn@0.28.4`. and check the version with `which yarn` and `yarn --version`.


### Repo

The most common issue is an out of date repo. The first thing to check is if your master branch is uptodate:
`git log`. Once your branch is up to date, it is still possible that your packages are out of date.
It is always a good practice to run `yarn nom` when something goes wrong.
The script will rm your `yarn.lock` file and `node_modules` directory.

If that fails you can re-clone the repo:

```bash
rm -rf [yourpath]/debugger.html
git clone https://github.com/devtools-html/debugger.html
cd debugger.html
yarn install
yarn start
```

### Babel

Babel creates a global cache file that is share between all programs (what could go wrong).
If you suspect that babel is having issues or that a file is not being transpiled, you can always
update the `~/.babel` file.

The first step is to see if you can un-hide the file by toggling the `hidden` checkbox.
The second step is to make sure that you have write permission to the file.
The third step is to nuke the file with a good old fashioned `rm -rf ~/.babel`

```
error: Error: EPERM: operation not permitted, open 'C:\Users\<username>\.babel.json'
```

### Firefox Plugin

If the Launchpad is not loading or showing a white-screen, but everything else seems fine
it's possible that a browser plugin is interfering. If you suspect this is a problem,
try running the launchpad in Chrome. If that works you have a plugin problem :)

Try disabling your plugins in firefox and see if that helps.

### Windows / Linux

We try our best to provide a consistent cross-platform experience, but there are still
issues that come up w/ with Windows or Linux. If that happens for you, find us in [slack]
and someone will help you out :)

[slack]:https://devtools-html-slack.herokuapp.com/
[nvm]:https://github.com/creationix/nvm
[yarn]:https://yarnpkg.com/en/

### Competing Scripts

If you are reloading the launchpad and not seeing the bundle change, it's possible that you are running `yarn start` and `yarn copy-assets-watch` at the same time. The best thing to do is to `<ctrl>-c` and close all the running programs, and run `ps` to make sure everything has stopped. At that point, try running `yarn start`, making a change in a src file and checking `localhost:8000/assets/build/debugger.js`.
