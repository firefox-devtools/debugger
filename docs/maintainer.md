## Maintainer Tips

Helping to maintain a project is the best way to contribute to its overall health.

* [Triaging Issues](#triaging-issues)
* [Making Bugs Actionable](#making-bugs-actionable)
* [Reviewing Stale Issues](#reviewing-stale-issues)
* [Making Issues Available](#making-issues-available)
* [Following up on In-Progress Work](#following-up-on-in-progress-work)
* [Adding a Patch](#adding-a-patch)
* [Pushing to a Branch](#pushing-to-a-branch)

### Triaging Issues

We encourage the community to help make bugs actionable, make features available,
and close stale issues. Triaging is one of the most important contributions a
community member can make for a project's health. [Steve Klabnik's article][gardening] on how to be an "open source gardener" reflects our values here at _debugger_.

#### Making Bugs Actionable

When bugs are filed, they are immediately labeled _[`not-actionable`][na]_. Before they can be appropriately addressed by our contributors, bugs need to be made _actionable_. 

You can help us make bugs actionable by following these steps:

1. Check for duplicate bugs.
2. Verify that the bug is reproducible.
3. Define steps to reproduce the bug, with expected and actual results.
4. Create a small test case. We have a [glitch] template for sharing examples.
5. Add [labels](./issues.md#labels).

#### Reviewing Stale Issues

We define _stale_ as issues that are 30 days or older. If an issue is stale, it is often an indicator that the issue is problematic in one or more ways. 

Typically, a stale issue can be:

* _Unnecessary_: It does not signal a problem that needs to be solved. 
* _Vague_: It doesn't explain the problem well. 
* _Broad_: It signals too many problems at once.
* _Low priority_: It signals a problem that could be solved, but is not urgent.

Here's how you can help review each of these types of issues:

* _Unnecessary issues_ - Close them.
* _Vague issues_ - Clarify these issues with the contributor(s) who opened them, and try to pinpoint the problems that need solving.
* _Broad issues_ - Divide larger issues into several smaller, more focused issues. 
* _Low priority issues_ - Close them and tag them with the  _icebox_ label.

### Prioritizing Issues

_debugger_ is a highly active repository. There are too many issues open in the project at any one time for us to be able to complete them all in a timely manner.

We try to prioritize the issues into three buckets: **current milestone**, **backlog**, and **icebox**.

* We add the **current milestone** label to issues that we expect to accomplish within the next two weeks. 
* We add the **backlog** label to issues that we would like to accomplish in the next four to six weeks.
* We add the **icebox** label to issues that we would like to get to in the future. However, to keep these issues from flooding the issue page on the repository, we close them temporarily until they can be dealt with. We commit to reviewing the icebox issues every six weeks, and reopening the issues that fit the _current milestone_ or _backlog_ labels.

In addition to the above, there will always be some issues that do not fall into the above buckets: 

* Issues that have not been investigated by a maintainer.
* Issues that we believe realistically could be handled by a community member (e.g. UI polishing, code health, etc.).

### Icebox Issues

#### Making Issues Available

In order for an issue to be marked _available_, it must meet two requirements. 

Available issues must have:

1. A clearly defined specification (end-state).
2. A clear implementation plan.

Our goal is to have 100% of our issues either available or blocked by another available ticket.

If you find an issue that is not available, you can:

1. Investigate the issue, and brainstorm solutions to any problems you may find.
2. Share questions, or offer reasonable solutions that can be implemented.
3. [Add a patch](#adding-a-patch) that will help anyone who picks up the issue in the future.

#### Following up on In-Progress work

Following up on in-progress work is a delicate, but tremendously important task.

When done well, the person whom you follow up on feels appreciated and supported. When you check in with them, they will often feel comfortable asking questions that could be blocking their work. If you, the contributor, and any other community members can find answers to these questions, the work can move forward, and the debugger can improve.

When done poorly, the person whom you follow up on feels rushed, micromanaged and second-guessed. Contributors made to feel this way will often struggle to complete their work, and they will be reluctant to ask for help. 

Here at _debugger_, it is important that follow-ups go smoothly, and that all contributors involved feel appreciated and well-supported. 

Here are a few good rules of thumb that will help you follow up on in-progress work in a structured, respectful way: 

1. Ask the contributor what the timeline is for completing their task(s).
2. Ask the contributor if any part of the task(s) has them feeling stuck.
3. Offer to pair up and work together, or to discuss the task(s) via Slack or voice chat. 
4. Work together to break down each task into small pieces, so that things can be merged gradually, instead of all at once. 

### Adding a Patch

Patches are a great way to clarify what work needs to be done.

Patches on `available` issues help clarify where the necessary code should eventually go. Also, they are often clearer than English.

Here are a few ways you can add a patch:

* Write some pseudocode, or add comments where you think new code should go.
* Add a diff, using diff code blocks.
* Use the \[gist] cli to make diffs. Use a shortcut for `git diff | gist --type diff`.
* When gists are long, leave a comment on the issue with a link to a gist, along with this snippet: `curl <raw-gist-url> | git apply`.

### Pushing to a Branch

Here are the steps for getting a PR branch and then updating it:

Getting Set Up:

1. **HTTP Remote** [github help][github-remote]
2. **Two-factor Authentication (2FA)** [github help][github-2fa]
3. **Personal Access Tokens** [github help][github-pat]

Steps:

```bash
git remote add <username> https://github.com/<username>/debugger.git
git fetch <username>
git checkout --track <username>/<pr-branch>
git pull --rebase # if you want to get new changes
git push <username> <pr-branch>
git push -f <username> <pr-branch>  # sadly, you often need to push force
```

#### Notes:

* Don't worry about including `--force`, it's often inevitable if you're helping with a rebase.
* It's best to include your work as a separate commit, so that the contributor can easily see the patch.

[enhancements board]: https://github.com/firefox-devtools/debugger/projects/5
[ship]: https://www.realartists.com
[ship-screenshot]: https://cloud.githubusercontent.com/assets/254562/23369201/8fe98b82-fcde-11e6-9dac-3e40547f29ad.png
[github-2fa]: https://help.github.com/articles/securing-your-account-with-two-factor-authentication-2fa/
[github-pat]: https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/
[github-remote]: https://help.github.com/articles/adding-a-remote/
[gardening]: http://words.steveklabnik.com/how-to-be-an-open-source-gardener
[glitch]: https://fabulous-umbrella.glitch.me/
[na]: https://github.com/firefox-devtools/debugger/labels/not-actionable
