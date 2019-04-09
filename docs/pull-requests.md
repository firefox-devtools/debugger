## Pull Requests

Once you have code or documentation changes ready to submit to the _debugger_ repository, it's time to **[open a pull request (PR)][pr-docs]**. 

In this document, we share our **recommended methods and strategies for submitting clear, high-quality, pull requests** that can quickly be merged into the codebase.

## Table of Contents

* [Screenshots](#screenshots)
* [Test Steps](#test-steps)
* [Testing](#testing)
* [Reviews](#reviews)
* [Spell Checking](#spell-checking)
* [Git Workflow](#git-workflow)
* [Updates](#updates)
* [Continuous Integration](#continuous-integration)

### Screenshots

Whenever possible, please **include screenshots and/or animated GIFs** in your pull requests.

Click the dropdown arrow below to see an example of such a GIF: 

<details>
<summary>
  GIF Example
</summary>

![](http://g.recordit.co/6dE0EmM29Z.gif)

```
![](http://g.recordit.co/6dE0EmM29Z.gif)
```
</details>

#### Tools for Recording GIFs

There are many **free tools** available that will allow you to record a GIF of the functionality that has been added or changed in your pull request. 

For **Mac** and **Windows** users, we recommend [recordit](http://recordit.co/).

For **Linux** users, we recommend [Peek](https://github.com/phw/peek).

#### Tables

In cases where multiple screenshots are necessary to demonstrate a change (e.g. style changes that affect multiple themes, rtl vs. ltr comparisons, etc.), we recommend that you **use a table in your PR to keep everything organized**. 

[Click here][github-tables] to learn more about organizing information with tables on GitHub.

<details>
<summary>
  Table Example
</summary>

|Firebug|Light|
|----------|------|
|![firebug](https://cloud.githubusercontent.com/assets/1755089/22209733/94970458-e1ad-11e6-83d4-8b082217b989.png)|![light](https://cloud.githubusercontent.com/assets/1755089/22209736/9b194f2a-e1ad-11e6-9de0-561dd529d5f0.png)|


```
|Firebug|Light|
|----------|------|
|![firebug](https://cloud.githubusercontent.com/assets/1755089/22209733/94970458-e1ad-11e6-83d4-8b082217b989.png)|![light](https://cloud.githubusercontent.com/assets/1755089/22209736/9b194f2a-e1ad-11e6-9de0-561dd529d5f0.png)|
```

</details>

### Test Steps

When submitting a pull request, it is important that anyone reviewing your code be able to trigger the feature you have created, or the bug you are fixing. 

In the text description of your PR, please **list any and all steps that are necessary to test your new feature or fix**. We also recommend that you list all of the scenarios where you tested your change. 

Click the dropdown arrow below to view example test steps for a hypothetical change to the _close_ button.

<details>
<summary>
  Test Steps Example
</summary>

- [x] Works in tabs
- [x] Works in breakpoints pane
- [x] Works in autocomplete

</details>


### Testing

We use a tool called [Husky](https://github.com/typicode/husky) to check open PRs before they are merged into the codebase.

If you wish, you can also **run our [unit tests][test-docs] and [linters][linting-docs] locally**, so you can see if everything passes prior to submitting your PR.

Our integration tests are run with [Mochitest][mochitest]. These tests will be run automatically by the CI once you submit your PR. 

You can also [set up Mochitest locally][mochitest-docs], but the process tends to be cumbersome. If you run into errors with the integration tests, our reviewers will generally assist with debugging.

### Reviews
#### Receiving Reviews

Once the code changes in your pull request have successfully passed all CI checks, **your contribution must be reviewed using the GitHub review system**.

While any contributor may leave a review on a PR (by clicking the "Add Your Review" link on the specific PR page), **merging with the master branch requires at least one (1) approving review by a contributor with write access**. 

We have a number of these contributors (usually project maintainers) reviewing pull requests regularly, and we strive to review them as fast as we can. However, if you believe your PR has been neglected, please mention the team name **@devtools-html/debugger** in a comment on the PR page. 

#### Reviewing a Pull Request

If you're looking to contribute to the growth of the repository, one of the best ways to do so is not only to submit pull requests, but also to **review pull requests made by other contributors**. 

Here are some tips for reviewing a pull request:

* **Jump right in!** The task of leaving reviews isn't just for maintainers; if you have valuable feedback to give on a PR, you can (and should do so).
* **Ask questions!** If you're unsure about something you see in the PR code, ask the contributor to clarify, or provide more context.
* **Leave comments!** If you see something that needs fixing (e.g. errors, or style inconsistencies), point them out in a polite and respectful way.
* **Aim for clarity!** If you read through a PR and find it unclear, ask the contributor to add screenshots, an example GIF, or a list of steps to reproduce the issue or feature. 

##### Testing Locally

When reviewing a pull request, **testing locally is the best way to pick up on inconsistencies in the code**.
Many times, you'll find small things like console warnings or small visual regressions that can be fixed before the PR is merged.

Steps:

1. Find the username and branch name in the PR.
2. Add the user's remote: `git remote add <usenamer> <user's fork>`. This is the URL you'll use to clone the user's fork.
3. Fetch the user's branches with `git fetch <username>`.
4. Checkout the user's branch with `git checkout --track <username>/<pr-branch>`. `--track` is helpful if you later want to pull down subsequent changes to the PR.

### Spell Checking

We use the fabulous [retext] project to check spelling and grammar in our documentation.

If you are contributing changes to documentation (typically any Markdown or '.md' file), **any spelling errors detected by _retext_ will show up as a failing test in _CircleCI_**, which you can run locally using `yarn lint`.

These errors will appear like so:

![][sc]

To fix these errors, you have two options:

1. In case of an actual typo or spelling error, submit a new commit to your original PR that fixes the error. 
2. In case _retext_ is falsely detecting a misspelled word (for example, you used a word that doesn't yet appear in our dictionary), simply submit a commit to our dictionary file [`assets/dictionary.txt`](../assets/dictionary.txt) with the new words added to the list. 

[retext]: https://github.com/retextjs/retext
[sc]: https://user-images.githubusercontent.com/254562/32508090-342a0d62-c3b7-11e7-80aa-17b430a675fd.png

### Git Workflow

Working on open source software will test your Git game! No matter how well you know
Git, you're going to learn something new while working on this project. 

Here are some links we've found useful:

* [Learn Git Branching][git-tutorial] - An interactive environment for learning how Git commands work
* [Git Forking][forking] - An overview of creating and publishing a feature branch, and keeping it up-to-date
* [Flight Rules][flight-rules] - A guide for what to do when things go wrong when working with Git

[forking]: https://gist.github.com/Chaser324/ce0505fbed06b947d962#file-github-forking-md
[git-tutorial]: https://learngitbranching.js.org/
[flight-rules]:https://github.com/k88hudson/git-flight-rules

#### Merge Conflicts

It's common to create a PR, only to find out a couple of days later that it has a merge conflict. **Before your code can be successfully merged, the merge conflict must be resolved**.

There are two main approaches for resolving merge conflicts: 

1. Using the GitHub UI
2. Updating your branch locally.

##### Resolving a Merge Conflict on GitHub

If the conflict can be resolved through a small change, you can use the GitHub UI to take care of it. 

[Click here][merge-docs] to learn how to resolve a merge conflict through the GitHub UI.  

However, in most cases, you'll want to update your branch locally to resolve the conflict.

##### Resolving a Merge Conflict Locally

First, **clean up your unstaged work** by either committing it, stashing it, or checking it out.

Once your branch is clean, you should **update your local master branch**. It's a good rule of thumb that master should
point to [origin][orig], but often the `master` branch points to
your fork. If this is the case, then you'll need to add `origin` as a [remote][rdoc].

Once master is up to date, you can **go back to your feature branch and update it**.
Generally the best thing to do is to rebase it against master: `git rebase master`; however, rebasing can be complicated, so check out the [servo], [edx], and [docs][rebase-docs] if you're having trouble.

In cases where your feature branch has some nasty conflicts, you can **cherry pick your
work on top of master**. 

There are three steps involved in cherry-picking a commit:

1. Squash your new commits into one commit. Save the commit SHA.
2. Reset your branch against master (temporarily wiping everything), using `git reset --hard master`
3. Cherry-pick your commit, with `git cherry-pick 2bc3D`

![rebase-screen]

[orig]: https://github.com/firefox-devtools/debugger
[edx]: https://github.com/edx/edx-platform/wiki/How-to-Rebase-a-Pull-Request
[servo]: https://github.com/servo/servo/wiki/Beginner%27s-guide-to-rebasing-and-squashing
[rebase-docs]: https://help.github.com/articles/about-git-rebase/
[rebase-screen]: https://shipusercontent.com/351d31ccee0a1ba552b56627a35d7118/Screen%20Shot%202017-10-12%20at%206.29.49%20PM.png
[rdoc]: https://help.github.com/articles/adding-a-remote/
[merge-docs]: https://help.github.com/en/articles/resolving-a-merge-conflict-on-github

### Updates

We value landing PRs smoothly. One way we minimize back and forth is by **pushing updates directly to PR branches**.

There are a couple times when we do this:

* There's a small syntax or style change that's blocking a merge.
* We want to suggest a refactor. At this point, feel free to offer your opinion.

Here are the steps for [pushing to a branch].

### Continuous Integration

For continuous integration (CI) testing, we use [Circle] and [Travis CI]. Our test run is defined in [config.yml] for Circle, and [.travis.yml] for Travis.

#### Testing on CI

If a test is failing on CI and you're not sure why, it can be helpful to **SSH in and debug
it locally**. 

There are three steps you need to follow in order to do this:

1. Rebuild with SSH
2. Copy the SSH command
3. `cd debugger`
4. `jest src`

##### Rebuild with SSH

![](https://shipusercontent.com/c9c0c7b79785237686a784fae7d710b2/ssh%20button.png)

##### SSH Command

![](https://shipusercontent.com/34e3daec48feed0eba96059d42829e84/ssh%20URL.png)

##### SSH from the Terminal

![](https://shipusercontent.com/5b5a98a8f42f537b754540dd9f80c2d1/terminal.png)

[pr-docs]: https://help.github.com/en/articles/creating-a-pull-request
[github-tables]:https://help.github.com/articles/organizing-information-with-tables/
[github-remote]:https://help.github.com/articles/which-remote-url-should-i-use/
[github-2fa]:https://help.github.com/articles/providing-your-2fa-authentication-code/
[github-pat]:https://help.github.com/articles/creating-an-access-token-for-command-line-use

[mochitest]:https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest
[mochitest-docs]: ./mochitests.md
[test-docs]: ./local-development.md#unit-tests
[linting-docs]: ./local-development.md#linting
[pushing to a branch]: ./maintainer.md#pushing-to-a-branch

[Circle]: https://circleci.com/
[config.yml]: ../.circleci/config.yml
[Travis CI]: https://travis-ci.org/
[.travis.yml]: ../.travis.yml
      
