### How to create a new Reps release for mozilla-central.

Before you get started, you will need clones of devtools-core and mozilla-central, as well as
a Bugzilla account.

1. **Prepare devtools-reps release**
   1. Create a release branch on github
   2. Update minor version in package.json, reset build version: devtools-reps-X.N.Y -> devtools-reps-X.N+1.0
   3. Commit `release: bump version to devtools-reps-X.N+1.0`
   4. Create a PR on Github for this release
   5. Make sure you have a `packages/devtools-reps/configs/local.json` file, with `firefox.mcPath` pointing to your mozilla-central clone

2. **Copy to mozilla central**
   1. Update your mozilla-central clone to the latest
   2. Create a new mercurial bookmark (or a local branch if you use git-cinnabar)
   3. Navigate to the reps folder: `cd packages/devtools-reps`
   4. And run `yarn copy-assets`
   5. Create a new bug in [Developer Tools: Shared Components](https://bugzilla.mozilla.org/enter_bug.cgi?product=Firefox&component=Developer%20Tools%3A%20Shared%20Components)
   6. Commit 'Bug XXX - devtools-reps v0.N+1.0: update reps bundle from GitHub;r=reviewer', where XXX is the number of the bug you created in `2.v.`.

3. **Validate & cleanup**
   1. Push to try, test locally, submit for review etc ...
   2. While try fails or some problem is detected, go back to devtools-reps, fix the issue, create a new bundle and go back to `2.i.`
   3. When everything is fine and the patch is r+, land on autoland/inbound
   4. Merge the PR on github
   5. Create a tag for devtools-reps-X.N+1.0 on github

After that any issue with the bundle should be addressed with a new build version.
Ideally, if the bundle has to be updated in mozilla-central for a bugfix, a corresponding
tag should be created on GitHub.

### How to publish a new Reps release to npm.

**Steps to publish to npm** :

1. Get new tags from remote: `git fetch --tags`
2. Checkout the tag created for the release: `git checkout tags/devtools-reps-X.N+1.0`
3. Navigate to the reps folder: `cd packages/devtools-reps`
4. Log in nom (Might ask your npm username and password): `npm login`
5. Publish the package: `npm publish`

To be able to publish a new version of the package on npm, you need to :

- have an npm account and
- be a collaborator on the package.

If you want to become a collaborator on the Reps package, please ask the other collaborators, either through IRC or Slack, or by filing an issue in this repo.
