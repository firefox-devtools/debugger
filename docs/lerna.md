## Lerna

The debugger uses [Lerna](https://github.com/lerna/lerna) to manage setting up
the Debugger and its packages.

### How does it work?

Lerna does two things to help setup the Debugger. First it links the Debugger's internal packages, then it installs the external dependencies.
During the linking phase, lerna figures out which packages depend on each other and installs symlinks in each packages' node_modules directory.
This setup has several benefits:

* Packages can easily require one another
* It is easy to work on the entire project without worrying about re-installing different packages

### Why is lerna forked?

Lerna is forked so that the top-level package (`debugger`) can be linked with the sub-packages. This feature will hopefully be merged into Lerna soon.
