## Pull Requests

* [Screenshots](#screenshots)
* [Test Steps](#test-steps)
* [Testing](#testing)
* [Reviews](#reviews)
* [Updates](#updates)

### Screenshots

Include screenshots and animated GIFs in your pull request whenever possible.

**Recording GIFs** There are many great tools for recording a GIF. On a mac, we recommend [recordit](http://recordit.co/), which is a free lightweight app.

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


### Updates

We value landing PRs smoothly. One way we minimize back and forth is by pushing updates directly to PR branches.

There are a couple times when we do this:
* it's a small syntax or style change that's blocking a merge
* we want to suggest a refactor. At this point, feel free to offer your opinion.

Here are the steps for [pushing to a branch].

[github-tables]:https://help.github.com/articles/organizing-information-with-tables/
[github-remote]:https://help.github.com/articles/which-remote-url-should-i-use/
[github-2fa]:https://help.github.com/articles/providing-your-2fa-authentication-code/
[github-pat]:https://help.github.com/articles/creating-an-access-token-for-command-line-use

[mochitest]:https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest
[mochitest-docs]: ./mochitests.md
[test-docs]: ./local-development.md#unit-tests
[linting-docs]: ./local-development.md#linting
[pushing to a branch]: ./maintainer.md#pushing-to-a-branch
