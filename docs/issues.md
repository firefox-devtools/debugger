## Issues

* [Issue Titles](#issue-titles)
* [Issue Descriptions](#issue-descriptions)
* [Claiming Issues](#claiming-issues)
* [Labels](#labels)
* [Available Issues](#available-issues)
* [Triaging](#triaging)
* [Issue Organization](#issue-organization)
* [Community Friendly](#community-friendly)

### Issue Titles

**Components**

Issues are organized in terms of components.
Issue titles should include a component at the front e.g. `[Editor]`

|Editor|SecondaryPanes|UI|Other|
|----------|------|-----|----|
|Editor|CommandBar|SourceTree|Accessibility|
|SourceTabs|WatchExpressions|SourcesSearch|Theme|
|SearchBar|Breakpoints|WelcomePane|Reducer|
|SourceFooter|CallStack||Action|
||Scopes|||RTL|

**User Perspective**

The best issue titles are framed in terms of the impact on the user. i.e.

* `[Editor] search skips odd matches`
* `[WatchExpressions] can't remove an expression after it's been edited`

Things to try and avoid in the title
* implementation details where possible. Refactoring is an exception where it's okay
* vague language like e.g "debugger crashes", "can't install"
* inflammatory language "Search is terrible". Negative language has two effects, it can make someone feel guilty for breaking something. It can guilt trip someone into feeling like they *have* to fix it now.


### Issue Descriptions

**Steps to Reproduce** *STR*

Include the steps to reproduce what you found.

**System Details**

Often it is nice to know, which browser you were using, version of node, platform (windows, linux). You don't need to go over the top though, for instance if you're filing a UI bug then it doesn't matter which version of node you're using.

**Screenshots**

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

### Claiming Issues

If you'd like to work on an issue, `/claim` it in the issue and it'll be marked `in-progress`.

* We'll check up regularly to see how it's progressing and if we can help
* Don't hesitate to ask questions on the issue or in our slack channel. Communication is the most important part. Don't worry about over communicating!
* Don't feel bad taking yourself off the issue if you no longer have the time or interest in the issue.


![cl]

[cl]: https://shipusercontent.com/51cd3f15f1679d995cc20e3547827ea0/Screen%20Shot%202017-10-03%20at%209.47.25%20AM.png

### Labels


These are the [labels](https://github.com/devtools-html/debugger.html/labels) we use to help organize and communicate the state of issues and pull requests in the project.  If you find a label being used that isn't described here please file an issue to get it listed.

| Label name | query:mag_right: | Description |
| --- | --- | --- |
| `available` | [search][labels-available] | Good for contributors to work on |
| `difficulty:easy` | [search][labels-difficulty-easy] | Work that is small changes, updating tests, updating docs, expect very little review |
| `difficulty:medium` | [search][labels-difficulty-medium] | Work that adapts existing code, adapts existing tests, expect quick review |
| `difficulty:hard` | [search][labels-difficulty-hard] | Work that requires new tests, new code, and a good understanding of project; expect lots of review |
| `docs` | [search][labels-docs] | Issues with our documentation |
| `design` | [search][labels-design] | Issues that require design work |
| `enhancement` | [search][labels-enhancement] | [Requests](../CONTRIBUTING.md#suggesting-enhancements-new) for features |
| `bug` | [search][labels-bug] | [Reported Bugs](../CONTRIBUTING.md#reporting-bugs-bug) with the current code |
| `chrome` | [search][labels-chrome] | Chrome only issues |
| `firefox` | [search][labels-firefox] | Firefox only issues |
| `infrastructure` | [search][labels-infrastructure] | Issues with testing / build infrastructure |
| `discussion` | [search][labels-discussion] | Issues need clearer requirements before work can be started |
| `needs-description` | [search][labels-needs-description] | Issue needs a clear description and code sketch so a contributor can work on it |
| `needs-str` | [search][labels-needs-str] | Issue needs a clear STR so that others can reproduce |
| `needs-investigation` | [search][labels-needs-investigation] | Issue needs to be researched |



### Available Issues

[available][labels-available] issues have clear requirements and a difficulty level.

They often have a patch, which should be a good starting off point.
Sometimes the patches are enough to fix the bug!

One reason we file `available` issues when the solution is somewhat simple is that it's great to get a second set of eyes. Running the fix locally and QAing it thoroughly is a huge help. A lot of times you'll discover things that we missed.

### Triaging

Triaging is the act of reviewing the open issues and making sure they're up to date.
It's one of the most helpful ways to help a project.

There are a couple of ways to think about it:
* it's great to be able to close issues that are done or stale
* it's great to make issue descriptions as clear as possible. Our goal is for every issue to be `available` i.e. it's clear what needs to be done.
* it's really helpful to double check a new bug and see if you can reproduce it.
* it's great to ask questions that help make the issue available or call out vague issues.
* it's great to sort the issues by oldest first and help make stale issues available.

#### Process

1. Issues that are not likely to be worked on in the next 6 weeks will be closed and documented in the [bugs][bugs-board] or [enhancements][enhancements-board].
2. Issues will often be grouped in tracking issues around shippable goals.
3. Current work is included in 2 week sprint milestones
4. The [roadmap] document is updated at the beginning of every sprint, with our current progress and realistic expectations.

#### What is a triaged issue?

When triaging, you can think of the following description as a guide:
a triaged issue is:

* no more than 6 weeks old
* in line with the goals of the debugger
* a single bigger issue that is still manageable
  *or* a set of smaller issues around a shippable goal (for example, transition the code base to JSX from `dom.div` syntax)
* labeled (see [Labels](#labels) for more info)
* ready to be worked on,
  *or* has a request for more information
  *or* has a clear next step

An issue that does not fullfill those traits should probably be moved to one of the boards and
closed.

### Issue Organization

In addition to labels and components, we use a couple of boards to organize our work.

**Features** [features][features-board] a prioritized list of features that are planned or in progress. The features are often tracking issues.

**Bugs** [bugs][bugs-board] a prioritized list of reported bugs.

**Enhancements** [enhancements-board] a list of feature suggestions that are reviewed twice a quarter.

### Community Friendly

We focus on being community friendly for many reasons.

* There's an educational value in having a large community of engineers who understand DevTools.
* There's an incredible diversity of talent to help us with topics ranging from testing to internationalization.
* Focusing on *contributor experience* helps us build the best development environment. For instance, if you find it's hard to describe how to make an accessibility change, maybe we should improve how we support tab navigation.

[labels-available]:https://github.com/devtools-html/debugger.html/labels/available
[labels-first-timers-only]:https://github.com/devtools-html/debugger.html/labels/first-timers-only
[labels-difficulty-easy]:https://github.com/devtools-html/debugger.html/labels/difficulty%3A%20easy
[labels-difficulty-medium]:https://github.com/devtools-html/debugger.html/labels/difficulty%3A%medium
[labels-difficulty-hard]:https://github.com/devtools-html/debugger.html/labels/difficulty%3A%hard
[labels-docs]:https://github.com/devtools-html/debugger.html/labels/docs
[labels-design]:https://github.com/devtools-html/debugger.html/labels/design
[labels-enhancement]:https://github.com/devtools-html/debugger.html/labels/enhancement
[labels-bug]:https://github.com/devtools-html/debugger.html/labels/bug
[labels-chrome]:https://github.com/devtools-html/debugger.html/labels/chrome
[labels-firefox]:https://github.com/devtools-html/debugger.html/labels/firefox
[labels-infrastructure]:https://github.com/devtools-html/debugger.html/labels/infrastructure
[labels-discussion]:https://github.com/devtools-html/debugger.html/labels/discussion
[github-tables]: ./pull-requests.md#screenshots
[labels-needs-description]:https://github.com/devtools-html/debugger.html/labels/needs-description
[labels-needs-str]:https://github.com/devtools-html/debugger.html/labels/needs-str
[labels-needs-investigation]:https://github.com/devtools-html/debugger.html/labels/needs-investigation

[enhancements-board]: https://github.com/devtools-html/debugger.html/projects/6
[bugs-board]: https://github.com/devtools-html/debugger.html/projects/11
[features-board]: https://github.com/devtools-html/debugger.html/projects/10
[roadmap]: ../ROADMAP.md
