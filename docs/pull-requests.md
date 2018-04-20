## Pull Requests

* [Screenshots](#screenshots)
* [Test Steps](#test-steps)
* [Testing](#testing)
* [Reviews](#reviews)
* [Spell Checking](#spell-checking)
* [Git Workflow](#git-workflow)
* [Updates](#updates)
* [CI](#ci)

### Screenshots

Include screenshots and animated GIFs in your pull request whenever possible.

**Recording GIFs** There are many great tools for recording a GIF. On a mac, we recommend [recordit](http://recordit.co/), which is a free lightweight app. If you are using Ubuntu, you can also try using [Peek](https://github.com/phw/peek).

<details>
<summary>
  GIF Example
</summary>

![](http://g.recordit.co/6dE0EmM29Z.gif)

```
![](http://g.recordit.co/6dE0EmM29Z.gif)
```

</details>

**Tables**: When there are multiple screenshots, such as a style change that affects different themes or rtl, it can be nice to use a table for the screenshots [docs][github-tables]

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

List any steps necessary to trigger the feature you've created or bug you are fixing

Often it's helpful to list the different scenarios that you tested as well.

<details>
<summary>
  Test Steps Example
</summary>

If you're working on style change to the close button you could say:

- [x] Works in tabs
- [x] Works in breakpoints pane
- [x] Works in autocomplete

</details>


### Testing

We use [husky](https://github.com/typicode/husky) to check the PR before it is pushed.

Here are docs on [tests][test-docs] and [linting][linting-docs], which you can run locally.

The integration tests will be run automatically by the CI. Our integration tests are run with [mochitest][mochitest]. The local setup process is documented [here][mochitest-docs], but the process is a bit cumbersome, so reviewers will generally help debug.

### Reviews
#### Receiving Reviews

Once the tests have passed in the PR you must receive a review using the GitHub review system

We have a number of contributors reviewing PRs fairly quickly, if you feel yours has been neglected please mention the team name **@devtools-html/debugger** in the PR

#### Reviewing a PR

Giving valuable feedback is one of the best ways to contribute.

Tips:

1. It's not reserved to project maintainers. In fact, it's a great way to learn about the project and pick up on conventions
2. Don't be afraid to ask a question or comment on style inconsistencies.
3. Ask for screenshots and steps to reproduce. Often if it's not clear to you, it's not clear to others :)

**Testing locally**

Testing locally is the best way to pick up on inconsistencies.
Many times you'll find small things like console warnings or small visual regressions.

Steps:

1. Find the username and branch name in the PR
2. Add the user's remote: `git remote add <usenamer> <user's fork>` this is the URL you'd use to clone the user's fork.
3. Fetch the user's branches `git fetch <username>`
4. checkout the user's branch `git checkout --track <username>/<pr-branch>`. `--track` is helpful if you later want to pull down subsequent changes to the PR.

### Spell Checking

We use the fabulous [retext] project for spell checking and other grammatical checks. If you see a spell checking error in your markdown, you can add some of the misspelled words to our dictionary in [`assets/dictionary.txt`](../assets/dictionary.txt)

![][sc]

[retext]: https://unifiedjs.github.io/
[sc]: https://user-images.githubusercontent.com/254562/32508090-342a0d62-c3b7-11e7-80aa-17b430a675fd.png

### Git Workflow

Working on OSS will test your git game! No matter how well you know
git you're going to learn something new. Here are some links we've found useful:

* [Learn git branching][git-tutorial] - an interactive environment for learning how git commands work
* [Git Forking][forking] - Overview of creating a feature branch, keeping it up-to-date, and publishing it
* [Flight Rules][flight-rules] - A guide about what to do when things go wrong

[forking]: https://gist.github.com/Chaser324/ce0505fbed06b947d962#file-github-forking-md
[git-tutorial]: https://learngitbranching.js.org/
[flight-rules]:https://github.com/k88hudson/git-flight-rules

#### Merge Conflicts

It's common to create a PR and a couple days later see that it has a conflict.
There are two approaches: the github ui, update your branch locally.

If the problem is simple, you can use the ui. Generally, you'll want to update your branch locally.
The first thing to do is to clean up your unstaged work by either committing it, stashing it, or checking it out.
Once your branch is clean, you should update your local master branch. It's a good rule of thumb that master should
point to [origin][orig], but often the `master` branch points to
your fork. If this is the case, then you'll need to add `origin` as a [remote][rdoc].

Once master is up-to-date, you can go back to your feature branch and update it.
Generally the best thing to do is to rebase it against master: `git rebase master`,
but rebases are complicated so checkout the [servo], [edx], and [docs][rebase-docs].

In some cases, where your feature branch has some nasty conflicts you can cherry pick your
work on top of master. There are three steps:

1. squash your new commits into one commit. (save the commit sha)
2. reset your branch against master (temporarily wiping everything) `git reset --hard master`
3. cherry-pick your commit. `git cherry-pick 2bc3D`

![rebase-screen]

[orig]: https://github.com/devtools-html/debugger.html
[edx]: https://github.com/edx/edx-platform/wiki/How-to-Rebase-a-Pull-Request
[servo]: https://github.com/servo/servo/wiki/Beginner%27s-guide-to-rebasing-and-squashing
[rebase-docs]: https://help.github.com/articles/about-git-rebase/
[rebase-screen]: https://shipusercontent.com/351d31ccee0a1ba552b56627a35d7118/Screen%20Shot%202017-10-12%20at%206.29.49%20PM.png
[rdoc]: https://help.github.com/articles/adding-a-remote/

### Updates

We value landing PRs smoothly. One way we minimize back and forth is by pushing updates directly to PR branches.

There are a couple times when we do this:
* it's a small syntax or style change that's blocking a merge
* we want to suggest a refactor. At this point, feel free to offer your opinion.

Here are the steps for [pushing to a branch].

### CI

We use [Circle] for CI, which is generally pretty great. Our test run is defined in [circle.yml].

#### Testing on CI

If a test is failing on CI and you're not sure why, it can be helpful to SSH in and debug
it locally. There are three steps:

1. Rebuild with SSH
2. copy the SSH command
3. `cd debugger.html`
4. `jest src`

##### Rebuild with SSH

![](https://shipusercontent.com/c9c0c7b79785237686a784fae7d710b2/ssh%20button.png)

##### SSH Command

![](https://shipusercontent.com/34e3daec48feed0eba96059d42829e84/ssh%20URL.png)

##### SSH from the terminal

![](https://shipusercontent.com/5b5a98a8f42f537b754540dd9f80c2d1/terminal.png)



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
[circle.yml]: ../circle.yml
