# Contributing to debugger.html

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

We respect your time and want to help you make the most of it as you learn more about this project.

[Getting Started](#getting-started)

* [How Can I Contribute?](#how-can-i-contribute)
  * [Reporting Bugs](#reporting-bugs-bug)
  * [Suggesting Enhancements](#suggesting-enhancements-new)
  * [Writing Documentation](#writing-documentation-book)
  * [Share what you know](#share-what-you-know)
* [Writing Code](#writing-code-computer)
  * [Your First Code Contribution](#your-first-code-contribution)
  * [Coding Standards](#coding-standards)
  * [Local Development](#local-development-computer)
  * [Issues](#issues)
  * [Pull Requests](#pull-requests)
  * [Issues and Pull Request labels](#issues-and-pull-requests)
* [Project Overview](#project-overview)
  * [debugger.html](#debuggerhtml)
  * [devtools.html](#devtoolshtml)
  * [Firefox Developer Tools](#firefox-developer-tools)
* [About Us][#about-us]
  * [Team Members](#team-members)
  * [Joining Mozilla](#joining-mozilla)

## Getting Started

The developer tools in most major browsers are just web applications.  They are HTML & JS rendered by the browser and talk to the browser itself through an API that gives access to the page internals.  This project is a brand new web application interface for JavaScript debugging designed for browsers and JS environments.

We strive for collaboration with [mutual respect for each other](./CODE_OF_CONDUCT.md).   Mozilla also has a set of [participation guidelines](https://www.mozilla.org/en-US/about/governance/policies/participation/) which goes into greater detail specific to Mozilla employees and contributors.

[Getting Started][getting-setup]

## How Can I Contribute?

Here is a great GitHub guide on [contributing to Open Source](https://guides.github.com/activities/contributing-to-open-source/) to help you get started.

### Reporting Bugs :bug:

If you find an issue with the code, please do [file an issue](https://github.com/devtools-html/debugger.html/issues/new).  We'll do our best to review the issue in a timely manner and respond.

We will also tag it with the label [bug](https://github.com/devtools-html/debugger.html/labels/bug).

### Suggesting Enhancements :new:

We are actively investigating ways of support enhancement requests in the project, so these instructions are subject to change. For now please create an issue, and we will attempt to respond.

We will also tag it with the label [enhancement][labels-enhancement].

### Writing Documentation :book:

Documentation is as important as code and we need your help to maintain clear and usable documentation.  If you find an error in here or other project documentation, please [file an issue](https://github.com/devtools-html/debugger.html/issues/new).

We will tag it with the label [docs](https://github.com/devtools-html/debugger.html/labels/docs).

### Share what you know

Give a talk or write a blog post and help others get started. Very few developers know that the debugger is a web app. It's a lot of fun to hear the amazing tools others want to build once they learn that they can!

We'd be happy to link to it here. It could go a long way towards helping a newcomer get started!


### Writing Code :computer:

We have a number of tools to help you with your code contributions, the following describes them all and how you can make use of them.

If you've contributed to an open source project before and would like to help this one please take a look through the `up for grabs` issues:

#### Your First Code Contribution

If you're looking for a good issue, you can look through the `up-for-grabs` issues. These issues should be actionable and well documented.

There are several difficulty levels, *easy*, *medium*, *hard*. We recommend grabbing an *easy* issue, but it's up to you.

* [up-for-grabs][labels-up-for-grabs] - issues that are not assigned to anyone and are available to be worked on.
* [difficulty:easy][labels-difficulty-easy] - clear expectations and a mentor to help you through.
* [difficulty:medium][labels-difficulty-medium] - more complex and may not have as clear expectations.
* [difficulty:hard][labels-difficulty-hard] - complex and has some open technical questions.

To begin your work make sure you follow these steps:

* [Fork this project](https://github.com/devtools-html/debugger.html#fork-destination-box)
* Create a branch to start your work `git checkout -b your-feature-name`
* Commit your work
* Create a [pull request](#pull-requests)

#### Coding Standards

> Be consistent with the rest of the code in the file

Here are pointers to the DevTools general coding style and formatting guidelines.

* [JS Coding Style](https://wiki.mozilla.org/DevTools/CodingStandards#Code_style)
* [Formatting Comments](https://wiki.mozilla.org/DevTools/CodingStandards#Comments)

#### Issues

* [Issue Titles](./docs/issuess.md#issue-titles)
* [Issue Descriptions](./docs/issuess.md#issue-descriptions)
* [Claiming Issues](./docs/issuess.md#claiming-issues)
* [Labels](./docs/issuess.md#labels)
* [Up For Grab Issues](./docs/issuess.md#up-for-grab-issues)
* [Triaging](./docs/issuess.md#triaging)
* [Issue Organization](./docs/issuess.md#issue-organization)
* [Community Friendly](./docs/issuess.md#community-friendly)

#### Pull Requests

Go to [Pull Requests](./docs/pull-requests.md) to learn about:

* [Screenshots](./docs/pull-requests.md#screenshots)
* [Test Steps](./docs/pull-requests.md#test-steps)
* [Testing](./docs/pull-requests.md#testing)
* [Reviews](./docs/pull-requests.md#reviews)
* [Updates](./docs/pull-requests.md#updates)

> **Working on your first Pull Request?** You can learn how from this *free* series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

### Local Development :computer:

Go to [local Development](./docs/local-development.md) to learn about:

* [Configs](./docs/local-development.md#configs)
* [Hot Reloading](./docs/local-development.md#hot-reloading)
* [Themes](./docs/local-development.md#themes)
* [Internationalization](./docs/local-development.md#internationalization)
* [Prefs](./docs/local-development.md#prefs)
* [Flow](./docs/local-development.md#flow)
* [Logging](./docs/local-development.md#logging)
* [Testing](./docs/local-development.md#testing)
* [Linting](./docs/local-development.md#linting)


[GitHub Desktop]:https://desktop.github.com/

## Project Overview

### debugger.html

The debugger.html project is a JavaScript debugger built from the ground up using modern web application technologies.  It is designed first for debugging Firefox but also for working with projects like Chrome and Node.  The name debugger.html was chosen because this debugger interface is being written using modern web technologies where as the previous Firefox debugger was written in [XUL](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL).

### devtools.html

devtools.html is the larger umbrella initiative that encompasses the debugger.html and several other devtools projects.  The devtools.html project claims its origin from a demo for a Mozilla (Dec 2015) work week in Orlando, FL USA where the team worked under a tight deadline to provide a proof of concept of the Firefox developer tools running in pure HTML; even outside of Firefox. The code for that demo can be found on GitHub under [@joewalker/devtools.html](https://github.com/joewalker/devtools.html).

From that original demo the devtools.html project has progressed quite a bit.  To learn more about it please read the [devtools.html proposal document](https://docs.google.com/document/d/1_5aerWTN_GVofr6YQVjmJlaGfZ4nv5YKZmdGHewfTpE/edit#heading=h.dw3amfbdp0lh) and take a look at the [devtools.html meta bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1263750) for tracking progress.

### Firefox Developer Tools

The debugger.html project is targeted to land in Firefox for Firefox 52.  However if you're looking to work directly on the DevTools project which ships developer tools for Firefox and Firefox Developer Edition right now you can find more information on the Mozilla wiki [DevTools / Get Involved](https://wiki.mozilla.org/DevTools/GetInvolved).

## About Us

debugger.html is an Open Source [Mozilla][mozilla] [Firefox][mozilla-firefox] Developer Tools project.
Our goal is to work with the community to build a universal JS debugger for modern times.

|||
|----------|------|
|![][jasonlaster] <br/> [@jasonlaster][@jasonlaster]|![][clarkbw] <br/> [@clarkbw][@clarkbw]|

### Team Members

debugger.html community team members help shephard the community.
They are here to help mentor new comers, review pull requests, and facilitate issue discussions.
They are a fantastic resource and genuinely friendly human beings.

||||
|----------|------|-----|
|![][bomsy] <br /> [@bomsy][@bomsy]|![][jbhoosreddy] <br /> [@jbhoosreddy][@jbhoosreddy]|![][wldcordeiro] <br />[@wldcordeiro][@wldcordeiro]|

### Joining Mozilla

Mozilla has and continues to hire many people from within the Open Source Software community, bringing contributors directly into the team; however contribution is not necessarily a path to employment.  Our internal hiring criteria is about more than contributions, we are also looking at a number of other factors that create a diverse and healthy team.

**Ask**. Take a look at the current openings in [https://careers.mozilla.org/](https://careers.mozilla.org/) to see if there is a good fit for you.  If you’re interested in a job with Mozilla feel free to ask employees what it’s like to work here.  However employees can’t help you get hired outside of being a referral for you.

**Referrals**. If you’ve been making reasonable and regular contributions to the project we’d be happy to be a reference for you.  We can make internal referrals to Mozilla or act as your reference to other companies.  Please be considerate when making this request, we are happy to help you and want to see you find a job you want but can’t do this for everyone who contributes.

[getting-setup]:./docs/getting-setup.md
[labels-up-for-grabs]:https://github.com/devtools-html/debugger.html/labels/up%20for%20grabs
[labels-first-timers-only]:https://github.com/devtools-html/debugger.html/labels/first-timers-only
[labels-difficulty-easy]:https://github.com/devtools-html/debugger.html/labels/difficulty%3A%20easy
[labels-difficulty-medium]:https://github.com/devtools-html/debugger.html/labels/difficulty%3A%medium
[labels-difficulty-hard]:https://github.com/devtools-html/debugger.html/labels/difficulty%3A%hard

[@jasonlaster]:https://github.com/jasonlaster
[@bomsy]:https://github.com/bomsy
[@wldcordeiro]:https://github.com/wldcordeiro
[@clarkbw]:https://github.com/clarkbw
[@jbhoosreddy]:https://github.com/jbhoosreddy
[jasonlaster]:https://avatars.githubusercontent.com/jasonlaster?size=56
[bomsy]:https://avatars.githubusercontent.com/bomsy?size=56
[wldcordeiro]:https://avatars.githubusercontent.com/wldcordeiro?size=56
[clarkbw]:https://avatars.githubusercontent.com/clarkbw?size=56
[jbhoosreddy]:https://avatars.githubusercontent.com/jbhoosreddy?size=56

[mozilla]:https://www.mozilla.org/
[mozilla-firefox]:https://www.mozilla.org/firefox/
