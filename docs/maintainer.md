## Maintainer Tips

Helping maintain a project is the best way to contribute to its overall health.

+ [Pushing to a branch](#pushing-to-a-branch)
+ [Triaging issues](#triaging-issues)
+ [Adding a Patch](#adding-a-patch)

### Triaging Issues

#### Closing Stale Issues

We define *stale* as issues that are 30 days or older. Stale is often an indicator of another issue: it is unecessary, too vague, too broad, or a low priority.

* *unecessary* - close it
* *vague* - clarify the issue and make it more actionable
* *broad* - create more focused issues, such as "add flow types to `WhyPaused` component"
* *low priority* - close it and add it to the [enhancements board]

#### Making Issues Actionable a.k.a "Up for Grabs"

Actionable is short for two things:

1. a clearly defined specification (end-state)
2. a clear implementation plan

Our goal is to have 100% of our issues actionable or blocked by another actionable ticket.
If you find an issue that is not actionable you can:

1. investigate the issue and answer questions that you have
2. share questions or offer reasonable solutions that can be implemented
3. [add a patch](#adding-a-patch) to help the person who picks up the issue

#### Following up on "In Progress" work

Folllowing up on in progress work is delicate, but tremendously important.
When done well, the recipient feels like his work is appreciated and feels comfortable asking questions that could be blocking the work.
When done poorly, the reicpient he's being rushed and is not sure how to complete it.

Some good rules of thumb are:

1. asking what his timeline is
2. asking if he is blocked or if you can help
3. offer to pair or talk on slack.
4. try to breakdown the work so small pieces can be merged

#### Ship

I recommend [ship] for tracking issues.

![][ship-screenshot]

### Adding a patch

Patches are a great way to clarify what work needs to be done.

Patches on "up for grabs" issues help clarify where the code should go and are often clearer than english.

Tips:

* write some pseudo-code or add comments where code should go
* add a diff with diff code blocks
* use the [gist] cli to make diffs. I have a shortcut for `git diff | gist --type diff`
* when gists are long you can include a link to a gist and this snippet in the issue `curl <raw-gist-url> | git apply`

### Pushing to a branch

Here are the steps for getting a PR branch and then updating it

Getting Setup:

1. **http remote** [github help][github-remote]
2. **2fa** [github help][github-2fa]
3. **personal access tokens** [github help][github-pat]

Steps:

```bash
git remote add username https://github.com/<username>/debugger.html.git
git fetch <username>
git checkout --track <username>/<pr-branch>
git pull --rebase # if you want to get new changes
git push <username> <pr-branch>
git push -f <username> <pr-branch>  # sadly you often need to push force
````

Notes:

* Don't worry about including `--force`, often it's inevitable if you're helping with a rebase.
* It's best to include your work as a separate commit so the contributor can easily see the patch.

[enhancements board]: https://github.com/devtools-html/debugger.html/projects/5
[ship]: https://www.realartists.com
[ship-screenshot]: https://cloud.githubusercontent.com/assets/254562/23369201/8fe98b82-fcde-11e6-9dac-3e40547f29ad.png
