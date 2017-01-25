### Pull Requests

* [Screenshots](#screenshots)
* [Test Steps](#test-steps)
* [Testing](#testing)
* [Reviews](#reviews)
* [Updates](#updates)

#### Screenshots

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

#### Test Steps

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


#### Testing

We use [husky](https://github.com/typicode/husky) to check the PR before it is pushed.

Here are docs on [tests][test-docs] and [linting][linting-docs], which you can run locally.

The integration tests will be run automatically by the CI. Our integration tests are run with [mochitest][mochitest]. The local setup process is documented [here][mochitest-docs], but the process is a bit cumbersome, so reviewers will generally help debug.

#### Reviews

Once the tests have passed in the PR you must receive a review using the GitHub review system

We have a number of contributors reviewing PRs fairly quickly, if you feel yours has been neglected please mention the team name **@devtools-html/debugger** in the PR

#### Updates

We value landing PRs smoothly. One way we minimize back and forth, is by pushing updates directly to PR branches.

There are a couple times when we do this:
* it's a small syntax or style change that's blocking a merge
* we want to suggest a refactor. At this point, feel free to offer your opinion.

**For Team Members**

Here are the steps for pushing to a PR branch:

1. **http remote** [github help][github-remote]
2. **2fa** [github help][github-2fa]
3. **personal access tokens** [github help][github-pat]


[github-tables]:https://help.github.com/articles/organizing-information-with-tables/
[github-remote]:https://help.github.com/articles/which-remote-url-should-i-use/
[github-2fa]:https://help.github.com/articles/providing-your-2fa-authentication-code/
[github-pat]:https://help.github.com/articles/creating-an-access-token-for-command-line-use

[mochitest]:https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest
[mochitest-docs]:./mochitests.md
[test-docs]:./local-development.md#unit-tests
[linting-docs]:./local-development.md#linting
