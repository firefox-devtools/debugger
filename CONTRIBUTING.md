---
---
# Contributing to debugger.html

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

We respect your time and want to help you make the most of it as you learn more about this project.

* [How Can I Contribute?](#how-can-i-contribute)
  * [Reporting Bugs](#reporting-bugs-bug)
  * [Suggesting Enhancements](#suggesting-enhancements-new)
  * [Writing Documentation](#writing-documentation-book)
  * [Give a talk](#give-a-talk-speech_balloon)
  * [Write a blog post](#write-a-blog-post-pencil2)
  * [Organize a meetup](#organize-a-meetup-beer)
* [Getting Started](#getting-started-runner)
  * [Your First Code Contribution](#your-first-code-contribution)
  * [Coding Standards](#coding-standards)
  * [Development Guide](#development-guide-computer)
  * [Terminology](#terminology)
  * [Debugging Firefox](#debugging-firefox)
  * [Issues](#issues)
  * [Pull Requests](#pull-requests)
  * [Maintainer Tips](#maintainer-tips)
  * [Debugging Tips](#debugging-tips)
  * [Pro Tips](#pro-tips)
* [Project Overview](#project-overview)
  * [debugger.html](#debuggerhtml)
  * [devtools.html](#devtoolshtml)
  * [Firefox Developer Tools](#firefox-developer-tools)
* [About Us](#about-us)
  * [Team Members](#team-members)
  * [Joining Mozilla](#joining-mozilla)

## Getting Started

The developer tools in most major browsers are just web applications.  They are HTML & JS rendered by the browser and talk to the browser itself through an API that gives access to the page internals.  This project is a brand new web application interface for JavaScript debugging designed for browsers and JS environments.

We strive for collaboration with [mutual respect for each other](./CODE_OF_CONDUCT.md).   Mozilla also has a set of [participation guidelines](https://www.mozilla.org/en-US/about/governance/policies/participation/) which goes into greater detail specific to Mozilla employees and contributors.

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

### Give a Talk :speech_balloon:

The best thing about giving a talk on the debugger is that you
can demo debugging the debugger and watch a roomful of minds explode.

The best talks can be as simple as walking through how the debugger works
and adding a small feature. For the audience in the room, this will likely be
the first time they've seen the internals of a developer tool.

Of course, feel free to ask questions in [slack][slack] or share talk slides or videos in channel our `#talks` channel.

### Write a Blog Post :pencil2:

Our primary goal is to help developers understand they have the skills
to improve their environment. Writing about DevTools is the best way
to dispel the myth that what we do is magic.

Writing is a great way to share what you learn and articulate your passion.
Blog posts can either be technical "how x works" or narrative "how we built x".
The most important piece is that it helps people feel welcome.

If you would like to write a post and have questions ask one of us in [slack][slack].
Also, of course share what you've written in [slack][slack]!
Here are some examples [search boxes][search-boxes], [getting into the flow][getting-into-the-flow], [better source maps][better-sourcemaps], [stepping debugger][stepping-debugger].

### Organize a meetup :beer:

Open source workshops are a great way to bring people together and contribute.
The best thing about workshops is that it's the best way for newcomers to make their first PR.
It's also a lot of fun!

There's been four workshops so far. Two in New York, one in Tel Aviv, and one in Vancouver.
The workshops have helped close to 100 people get started. In all of the cases, the workshop was organized
in collaboration with a local meetup group that was interested in promoting open source.

Feel free to reach out to us on [slack][slack] if you're interested in organizing one. Here is a [guide][meetup-guide] and [example][meetup-example] document. Amit's [goodness squad][goodness-squad] is a must read.

Give a talk or write a blog post and help others get started. Very few developers know that the debugger is a web app. It's a lot of fun to hear the amazing tools others want to build once they learn that they can!

### Getting Started :runner:

Getting started on an open source project is like starting a new job.
Expect to spend the first day learning the codebase and meeting
the team.

The best thing to do first is to answer specific questions like:
"how are sources shown on the left?". Here is a guided [activity][first-activity]
to help you get started.

It's also helpful to think about *who* is working on the
Debugger and people you might want to ask for help early on.
We are lucky to have lots of [nice people][getting-help] here.

#### Your First Code Contribution

If you're looking for a good issue, you can look through
the [available][labels-available] issues.

These issues should be well documented.

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

### Development Guide :computer:

Go to [local Development](./docs/local-development.md) to learn about:

* [Configs](./docs/local-development.md#configs)
* [Hot Reloading](./docs/local-development.md#hot-reloading-fire)
* [Themes](./docs/local-development.md#themes)
* [Internationalization](./docs/local-development.md#internationalization)
* [Prefs](./docs/local-development.md#prefs)
* [Flow](./docs/local-development.md#flow)
* [Logging](./docs/local-development.md#logging)
* [Testing](./docs/local-development.md#testing)
* [Linting](./docs/local-development.md#linting)

### Terminology

* [Generated / Original](./docs/terminology.md#generated--original)

### Debugging Firefox

At some point, you'll want to debug firefox to see your changes in the devtools panel or inspect the debugger server.

Here's a guide to help you get started [guide](./docs/debugging-firefox.md)

### Issues

* [Issue Titles](./docs/issues.md#issue-titles)
* [Issue Descriptions](./docs/issues.md#issue-descriptions)
* [Claiming Issues](./docs/issues.md#claiming-issues)
* [Labels](./docs/issues.md#labels)
* [Available Issues](./docs/issues.md#available-issues)
* [Triaging](./docs/issues.md#triaging)
* [Issue Organization](./docs/issues.md#issue-organization)
* [Community Friendly](./docs/issues.md#community-friendly)

### Pull Requests

Go to [Pull Requests](./docs/pull-requests.md) to learn about:

* [Screenshots](./docs/pull-requests.md#screenshots)
* [Test Steps](./docs/pull-requests.md#test-steps)
* [Testing](./docs/pull-requests.md#testing)
* [Reviews](./docs/pull-requests.md#reviews)
* [Updates](./docs/pull-requests.md#updates)

> **Working on your first Pull Request?** You can learn how from this *free* series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

### Maintainer Tips

Helping maintain a project is the best way to contribute to its overall health.
Here are some [notes][mdoc] on how we work.

+ [Triaging Issues](./docs/maintainer.md#triaging-issues)
+ [Making Bugs Actionable](./docs/maintainer.md#making-bugs-actionable)
+ [Closing Stale Issues](./docs/maintainer.md#reviewing-stale-issues)
+ [Making Issues available](./docs/maintainer.md#making-issues-available)
+ [Following up on In Progress work](./docs/maintainer.md#following-up-on-in-progress-work)
+ [Adding a Patch](./docs/maintainer.md#adding-a-patch)
+ [Pushing to a branch](./docs/maintainer.md#pushing-to-a-branch)

[mdoc]: ./docs/maintainer.md

### Debugging Tips

+ [Components](./docs/debugging.md#components)
+ [Actions](./docs/debugging.md#actions)
+ [Reducers](./docs/debugging.md#reducers)
+ [Client](./docs/debugging.md#client)

### Pro Tips

Here are some tips from our contributors.

* **Time management** is really important. Try your best to balance obligations.
* **Communicate** Communicate early and often. Share your work often and try to land the smallest possible pieces.
* **Goals** It's helpful to set realistic goals.
* **Work** Consider talking with your manager about OSS time at work. There are several reasons why this makes sense for your employer:
  * **expertise** teams benefit from having a resident expert on debugging or other tools
  * **marketing** your manager can market their team as OSS friendly to candidates and other employees.
  * **career development** the skills you learn in OSS translate to your own growth.
  * **sponsoring** your team benefits from having quality OSS tools. Sponsoring your OSS time is a great way to give back.

## Project Overview

### debugger.html

The debugger.html project is a JavaScript debugger built from the ground up using modern web application technologies.  It is designed first for debugging Firefox but also for working with projects like Chrome and Node.  The name debugger.html was chosen because this debugger interface is being written using modern web technologies where as the previous Firefox debugger was written in [XUL](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL).

### devtools.html

devtools.html is the larger umbrella initiative that encompasses the debugger.html and several other devtools projects.  The devtools.html project claims its origin from a demo for a Mozilla (Dec 2015) work week in Orlando, FL USA where the team worked under a tight deadline to provide a proof of concept of the Firefox developer tools running in pure HTML; even outside of Firefox. The code for that demo can be found on GitHub under [@joewalker/devtools.html](https://github.com/joewalker/devtools.html).

From that original demo the devtools.html project has progressed quite a bit.  To learn more about it please read the [devtools.html proposal document](https://docs.google.com/document/d/1_5aerWTN_GVofr6YQVjmJlaGfZ4nv5YKZmdGHewfTpE/edit#heading=h.dw3amfbdp0lh) and take a look at the [devtools.html meta bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1263750) for tracking progress.

### Firefox Developer Tools

The debugger.html project is targeted to land in Firefox for Firefox 52.  However if you're looking to work directly on the DevTools project which ships developer tools for Firefox and Firefox Developer Edition right now you can find more information on the Mozilla wiki [DevTools / Get Involved](https://wiki.mozilla.org/DevTools/GetInvolved).

### Talks, Videos, Blog posts

+ [Talks](./docs/talks.md)
+ [Videos](./docs/videos.md)


## About Us

debugger.html is an Open Source [Mozilla][mozilla] [Firefox][mozilla-firefox] Developer Tools project.
Our goal is to work with the community to build a universal JS debugger for modern times.

| Jason | Harald | Yulia | Victoria | David |
| ---------- | ------ | ------ | ------ | ---- |
| ![][jasonlaster] <br/> [@jasonlaster][@jasonlaster] | ![][digitarald] <br/> [@digitarald][@digitarald] | ![][codehag] <br/> [@codehag][@codehag]  | ![][violasong] <br/> [@violasong][@violasong] | ![][darkwing] <br />[@darkwing][@darkwing] |

### Team Members

debugger.html community team members help shepherd the community.
They are here to help mentor new comers, review pull requests, and facilitate issue discussions.
They are a fantastic resource and genuinely friendly human beings.

| Hubert | Jaideep | Wellington | Irfan | Martin | Lukas | Anshul |
| ---------- | ------ | ----- | ---- | ----   |   ---- | ---- |
| ![][bomsy] <br /> [@bomsy][@bomsy] | ![][jbhoosreddy] <br /> [@jbhoosreddy][@jbhoosreddy] | ![][wldcordeiro] <br />[@wldcordeiro][@wldcordeiro] | ![][irfanhudda] <br />[@irfanhudda][@irfanhudda] | ![][nyrosmith] <br />[@nyrosmith][@nyrosmith] | ![][lukaszsobek] <br />[@lukaszsobek][@lukaszsobek] | ![][anshulmalik] <br />[@anshulmalik][@anshulmalik] |

### Joining Mozilla

Mozilla has and continues to hire many people from within the Open Source Software community, bringing contributors directly into the team; however contribution is not necessarily a path to employment.  Our internal hiring criteria is about more than contributions, we are also looking at a number of other factors that create a diverse and healthy team.

**Ask**. Take a look at the current openings in [https://careers.mozilla.org/](https://careers.mozilla.org/) to see if there is a good fit for you.  If you’re interested in a job with Mozilla feel free to ask employees what it’s like to work here.  However employees can’t help you get hired outside of being a referral for you.

**Referrals**. If you’ve been making reasonable and regular contributions to the project we’d be happy to be a reference for you.  We can make internal referrals to Mozilla or act as your reference to other companies.  Please be considerate when making this request, we are happy to help you and want to see you find a job you want but can’t do this for everyone who contributes.

[getting-setup]:./docs/getting-setup.md
[labels-available]:https://github.com/devtools-html/debugger.html/labels/available
[labels-first-timers-only]:https://github.com/devtools-html/debugger.html/labels/first-timers-only
[labels-difficulty-easy]:https://github.com/devtools-html/debugger.html/labels/difficulty%3A%20easy
[labels-difficulty-medium]:https://github.com/devtools-html/debugger.html/labels/difficulty%3A%medium
[labels-difficulty-hard]:https://github.com/devtools-html/debugger.html/labels/difficulty%3A%hard
[labels-enhancement]:https://devtools-html.github.io/debugger.html/CONTRIBUTING.html#suggesting-enhancements-new

[@jasonlaster]:https://github.com/jasonlaster
[@bomsy]:https://github.com/bomsy
[@wldcordeiro]:https://github.com/wldcordeiro
[@digitarald]:https://github.com/digitarald
[@jbhoosreddy]:https://github.com/jbhoosreddy
[@irfanhudda]:https://github.com/irfanhudda
[@codehag]:https://github.com/codehag
[@violasong]:https://github.com/violasong
[@darkwing]:https://github.com/darkwing
[@nyrosmith]:https://github.com/nyrosmith
[@lukaszsobek]:https://github.com/lukaszsobek
[@anshulmalik]:https://github.com/anshulmalik

[jasonlaster]:https://avatars.githubusercontent.com/jasonlaster?size=56
[bomsy]:https://avatars.githubusercontent.com/bomsy?size=56
[wldcordeiro]:https://avatars.githubusercontent.com/wldcordeiro?size=56
[digitarald]:https://avatars.githubusercontent.com/digitarald?size=56
[jbhoosreddy]:https://avatars.githubusercontent.com/jbhoosreddy?size=56
[irfanhudda]:https://avatars.githubusercontent.com/irfanhudda?size=56
[codehag]:https://avatars.githubusercontent.com/codehag?size=56
[violasong]:https://avatars.githubusercontent.com/violasong?size=56
[darkwing]:https://avatars.githubusercontent.com/darkwing?size=56
[nyrosmith]:https://avatars.githubusercontent.com/nyrosmith?size=56
[anshulmalik]:https://avatars.githubusercontent.com/anshulmalik?size=56
[lukaszsobek]:https://avatars.githubusercontent.com/lukaszsobek?size=56

[mozilla]:https://www.mozilla.org/
[mozilla-firefox]:https://www.mozilla.org/firefox/

[meetup-example]:https://docs.google.com/document/d/1jJ27v-qnVtFrAmrJ8tWAOHOXvrQ7RN8oID44VPYXWrM/edit?usp=sharing
[meetup-guide]:https://docs.google.com/document/d/1SMbF2IEkTsQAd28-Xzhn7HS7yAORmxCVktlRkSdwmpQ/edit#heading=h.qqrdmxv84ec2


[search-boxes]:http://jasonlaster.github.io/devtools/js/2017/01/05/searching.html
[getting-into-the-flow]:http://jasonlaster.github.io/devtools/js/2017/01/20/typing-the-debugger.html
[better-sourcemaps]:http://jlongster.com/On-the-Road-to-Better-Sourcemaps-in-the-Firefox-Developer-Tools
[stepping-debugger]:http://jlongster.com/Implementing-Stepping-Debugger-JavaScript


[jlongster-talk]:https://www.youtube.com/watch?v=gvVpSezT5_M
[jlast-talk]:https://www.youtube.com/watch?v=O_xViL2TGrU
[getting-help]:./docs/local-development.md#getting-help
[first-activity]:./docs/debugging-the-debugger.md
[goodness-squad]:https://hackernoon.com/goodness-squad-a8704d594a7a#.qllq19koq
[slack]:https://devtools-html-slack.herokuapp.com/
