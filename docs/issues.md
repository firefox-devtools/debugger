## Issues

The Firefox Debugger is constantly evolving. Our community team is regularly **fixing bugs**, **adding features**, **improving documentation**, and **coming up with ideas for future versions**. 

You, too, can be a part of this process by **creating an issue** in this repository. 

Do this whenever you'd like to suggest a fix or make a change.

To learn how to create an issue on GitHub, [click here][issue-docs].

### Table of Contents

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

To keep our issues organized, we like to categorize them according to which [component][component-docs] they fix or modify.

The first step in this categorization process is the **issue title**, which you create when opening an issue for the first time.

Here are examples of what we consider to be *good* and *bad* issue titles.

* Bad: `Fix input field padding of search bar`
* Good: `[SearchBar] Fix input field padding`

* Bad: `Add information about titles to documentation`
* Good: `[Docs] Add information about titles`

Did you spot the differences?

When you submit an issue, **the title of the issue should begin with a tag**, placed within brackets (\[ \]). The tag should reference the most relevant component for the code change you suggest.

Some common tags include:

|Editor|SecondaryPanes|UI|Other|
|----------|------|-----|----|
|Editor|CommandBar|SourceTree|Accessibility|
|SourceTabs|WatchExpressions|TextSearch|Theme|
|SearchBar|Breakpoints|WelcomeBox|Reducer|
|SourceFooter|CallStack||Action|
||Scopes||Docs|RTL|

**User Perspective**

There's more to an issue title than just the component tag, of course.

Once you've written out your tag, you need to write a few words to explain: 
* The bug you've discovered
* The feature you're recommending
* The change you would like to see made to the project

The best issue titles take the above details and frame them in terms of their **impact on the user**. 

For example:

* `[Editor] Search skips odd matches`
* `[WatchExpressions] Can't remove an expression after it's been edited`

In addition to including the above details (i.e. component tag, user impact), the best issues also **exclude information that is unhelpful or irrelevant to contributors** that are reading the issue list.

Here is a list of a few **things you should avoid** in your issue titles: 
* Implementation details, where possible. Refactoring is an exception where this is permitted.
* Vague language (e.g. "debugger crashes", "can't install").
* Negative language (e.g. "Search is terrible").


### Issue Descriptions

**Steps to Reproduce** **(STR)**

Before an issue can be resolved, other contributors must first be able to reproduce it accurately.

When you file an issue, be sure to **include a list of all of the steps necessary to reproduce the bug** or problem that you have found. Try to be as specific as possible. 

**System Details**

All bugs are not reproducible in all environments. If you experience a bug, please include a list of your specific system details in the issue. This can help others reproduce the bug, and help them check if it can be reproduced on other systems, as well.

Include system details such as: 

* Which **browser** (and browser version) you were using when the bug occurred
* What **platform** (Windows, Mac, Linux) you were using to run the browser
* Which **version of Node** you have installed.

**Note:** You don't need to mention system details that are irrelevant to the bug you have found. For example, if you're filing an issue about a bug in the UI, there's no need to include which version of Node you're using.

**Screenshots**

Whenever possible, please **include screenshots and/or animated GIFs** in the issues you open.

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

There are many **free tools** available that will allow you to record a GIF of the problem or bug you are referencing in your issue.

For **Mac** and **Windows** users, we recommend [recordit](http://recordit.co/).

For **Linux** users, we recommend [Peek](https://github.com/phw/peek).

#### Tables

In cases where multiple screenshots are necessary to demonstrate a bug (e.g. style issues that affect multiple themes, rtl vs. ltr errors, etc.), we recommend that you **use a table in your issue to keep everything organized**. 

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

### Claiming Issues

If you'd like to work on an issue, simply comment `/claim` on the issue thread. A bot will then mark the issue as `in-progress`, and you can begin your work.

When you claim an issue, keep the following in mind: 

* Don't hesitate to ask questions on the issue or in our Slack channel. Communication is the most important part of the development process, so don't worry about over-communicating!
* Don't feel bad about taking yourself off of an issue if you no longer have the time or interest necessary to tackle it.

Once you've claimed your issue, our maintainers will check up regularly to see how it's progressing. They'll offer help, too, if you need it.


![cl]

[cl]: https://shipusercontent.com/51cd3f15f1679d995cc20e3547827ea0/Screen%20Shot%202017-10-03%20at%209.47.25%20AM.png

### Labels

As an active repository, it is quite normal for _debugger_ to have a wide variety of issues open at any one time.

To keep things organized, our goal is to assign every issue a **label**.

These labels act as categorization tools. They help our contributors understand important details about an issue at a glance. These details include issue type (*bug*, *enhancement*, etc.) and issue status (*available*, *not-available*, etc.), along with other important information. 

To see the **current list of active labels** in the *debugger* repository, [click here][labels-list].

### Available Issues

[Available][labels-available] issues have clear requirements and a difficulty level.

They often have a patch, which should be a good starting off point.
Sometimes, the patches themselves are enough to fix the bug!

One reason we file `available` issues when the solution is somewhat simple, is because it's helpful to get a second set of eyes on them problem. Running the fix locally and QAing it thoroughly is a huge help. A lot of times, you'll discover things that we missed.

### Triaging

Triaging is the act of **reviewing open issues and making sure they're up to date**. Triaging issues is an extremely important task, and can contribute greatly to the overall health of the project.

Here are a few ways you can help triage our *Issues* list:

* Sort issues by *Oldest* first, and work through stale issues to make them `available`
* Ask questions and clarify issues in order to help make them `available` (i.e they have a clear plan of action)
* Close issues that are done, or stale
* Check new bugs to see if they can be reproduced
* Ask questions to bring attention to vague issues

#### Our Issue Resolution Process

1. Issues that are not likely to be worked on in the next six (6) weeks will be closed and documented in [bugs][bugs-board] or [enhancements][enhancements-board].
2. Issues will often be grouped in tracking issues around shippable goals.
3. Current work is included in two-week sprint milestones
4. The [roadmap] document is updated at the beginning of every sprint, along with our current progress and realistic expectations.

#### What is a Triaged Issue?

A *triaged issue* is:

* No more than six weeks old
* In line with the goals of *debugger*
* Labeled (see [Labels](#labels) for more info)
* Either:
  * A single bigger issue that is still manageable, *or* 
  * a set of smaller issues, organized around a shippable goal (for example, transitioning the code base to JSX from `dom.div` syntax)
* Either:
  * Ready to be worked on,
  *or* 
  * has a request for more information,
  *or*, 
  * has a clear next step

When triaging an issue, we recommend that you use the above description as a guide.

An issue that does not fulfill the traits listed above should generally be moved to one of the boards and
closed.

### Issue Organization

In addition to labels and components, we use a couple of boards to organize our work.

**[Features][features-board]** - A prioritized list of features that are either *planned* or *in progress*. The features are often tracking issues.

**[Bugs][bugs-board]** -  A prioritized list of reported bugs.

**[Enhancements][enhancements-board]** - A list of feature suggestions. We review this list twice every quarter (i.e. every three months, beginning in January). 

### Community Friendly

We focus on being community friendly for many reasons.

* There's an educational value in having a large community of engineers who understand DevTools.
* There's an incredible diversity of talent that can help us with topics ranging from testing to internationalization.
* Focusing on *contributor experience* helps us build the best development environment. For instance, if you find it's hard to describe how to make an accessibility change, maybe we should improve how we support tab navigation.

[labels-list]: https://github.com/firefox-devtools/debugger/labels
[labels-available]:https://github.com/firefox-devtools/debugger/labels/available
[github-tables]: ./pull-requests.md#screenshots

[enhancements-board]: https://github.com/firefox-devtools/debugger/projects/6
[bugs-board]: https://github.com/firefox-devtools/debugger/projects/11
[features-board]: https://github.com/firefox-devtools/debugger/projects/10
[roadmap]: ../ROADMAP.md

[issue-docs]: https://help.github.com/en/articles/creating-an-issue
[component-docs]: https://reactjs.org/docs/components-and-props.html