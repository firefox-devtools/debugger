# Contributing to *debugger*

As an example of *open source software (OSS)*, the Firefox Debugger is dependent not only on Mozilla, but on the hard work and contributions of developers like you. 

To learn more about *contributing on GitHub*, [click here][gh-contrib-docs].

As a contributor, the code you write and the decisions you make can have a huge impact on the development of this project. 

We've written this document to help streamline the contribution process, so you can more easily find all of the information you need.

Lastly, thanks for contributing! We know your time is valuable, so we appreciate that you've chosen to spend it here with us, working on the Firefox Debugger together!

## Table of Contents

* [How Can I Contribute?](#how-can-i-contribute)
  * [Report Bugs](#report-bugs-bug)
  * [Suggest Enhancements](#suggest-enhancements-new)
  * [Write and Proofread Documentation](#write-and-proofread-documentation-book)
  * [Give a Talk](#give-a-talk-speech_balloon)
  * [Write a Blog Post](#write-a-blog-post-pencil2)
  * [Organize a Meetup](#organize-a-meetup-beer)
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
  * [Pro Tips for Contributors](#pro-tips-for-contributors)
 * [Project Overview](#project-overview)
  * [debugger](#debugger)
  * [Firefox DevTools](#firefox-devtools)
  * [Get Involved with Firefox DevTools](#get-involved-with-firefox-devtools)
* [About Us](#about-us)
  * [Mozilla Team](#mozilla-team)
  * [Joining Mozilla](#joining-mozilla)

## What is the Firefox Debugger?

The Firefox Debugger is a web application interface for JavaScript debugging, designed for browsers and JS environments. It is built using React and Redux, and designed to work with Firefox and Chrome debugging protocols. 

## About Us

*debugger* is an open source [Mozilla][mozilla] [Firefox][mozilla-firefox] Developer Tools project.
Our goal is to work with the community to build a universal JavaScript debugger for modern times.

We strive for collaboration with [mutual respect for each other](../CODE_OF_CONDUCT.md). Mozilla also has a set of [participation guidelines][moz-participation] which goes into greater detail specific to Mozilla employees and contributors.

### Mozilla Team

| Jason | Harald | Yulia | Victoria | David |
| ---------- | ------ | ------ | ------ | ---- |
| ![][jasonlaster] <br/> [@jasonlaster][@jasonlaster] | ![][digitarald] <br/> [@digitarald][@digitarald] | ![][codehag] <br/> [@codehag][@codehag] | ![][violasong] <br/> [@violasong][@violasong] | ![][darkwing] <br />[@darkwing][@darkwing] |

### :heart: Community Team :heart:

Our Community Team is a group of dedicated and talented people who contribute much-needed maintainer and leadership skills to the *debugger* project. They care deeply about the success of everyone who gets involved. To learn more about the roles of the Community Team members, and the ways they can support your success, checkout our [Community Team Page](../docs/community-team.md)!

You can also find them on the [#community-team][slack-community-team] Slack channel.

## How Can I Contribute?

There are lots of ways to contribute to *debugger*!

### Report Bugs :bug:

If you find an issue with the code, please [file an issue][debugger-issues]. We'll do our best to review the issue and respond in a timely manner.

Issues related to bugs will be tagged with the [bug][labels-bugs] label.

### Suggest Enhancements :new:

We are actively investigating ways of supporting enhancement requests in the project, so these instructions are subject to change. For now, please create an issue, and we will attempt to respond as quickly as possible.

Issues related to enhancements will be tagged with the [enhancement][labels-enhancement] label.

### Write and Proofread Documentation :book:

Documentation is as important as code. As such, we need your help to maintain clear and usable documentation throughout the repository. If you find an error in this document, or in other project documentation, please [file an issue][debugger-issues].

Issues related to documentation will be tagged with the [docs][labels-docs] label. 

### Give a Talk :speech_balloon:

If you're into public speaking, you can also choose to give a talk or speech about the Firefox debugger, or on related topics.

In our opinion, the best thing about giving a talk on *debugger* is that you
can demo debugging the debugger and watch a roomful of minds explode!

The best talks can be as simple as walking through how the debugger works
and how to add a small feature. For the audience in the room, this will likely be
the first time they've seen the internals of a developer tool.

Of course, feel free to ask questions in [Slack][slack] or share talk slides or videos in our `#talks` channel.

### Write a Blog Post :pencil2:

Another way to contribute to debugger is to write about it online, either on your own blog or on publishing platforms like [Medium][medium].

Writing about DevTools is the best way to dispel the myth that what we do here is magic. Additionally, it's a great way to share what you learn and articulate your passion for DevTools or *debugger*.

Good writing builds understanding, which fits our primary goal: to help developers understand that they can improve their own development environments. 

The blog posts you write can either be *technical* ("How x works") or *narrative* ("How we built x") in scope.

Whichever you choose, it is important that your article helps people feel welcome to join and contribute to *debugger*.

If you would like to write a post, and have relevant questions for the team, feel free to ask one of us in [Slack][slack].

Don't forget to share what you've written in Slack, as well!

Here are some example blog posts about *debugger*: 
* *[Search Boxes][search-boxes]*, by Jason Laster
* *[How the Debugger Got into the Flow][getting-into-the-flow]*, by Jason Laster
* *[On the Road to Better Sourcemaps in the Firefox Developer Tools][better-sourcemaps]*, by James Long
* *[Implementing a Stepping Debugger in JavaScript][stepping-debugger]*, by James Long

### Organize a Meetup :beer:

Open source workshops are a great way to bring people together and contribute.
The best thing about workshops is that they are a great way for newcomers to make their first pull request. They're also a lot of fun!

There have been four workshops so far. Two in New York, USA; one in Tel Aviv, Israel; and one in Vancouver, Canada.

The workshops have helped close to a hundred people get started working on *debugger*. In all cases, the workshops were organized
in collaboration with a local meetup group that was interested in promoting open source software.

Feel free to reach out to us on [Slack][slack] if you're interested in organizing a meetup. Here is a [guide][meetup-guide], and an [example][meetup-example] document. Amit Zur's *[Goodness Squad][goodness-squad]* is also a must-read on the subject of coding meetups.

Give a talk or write a blog post, and help others get started in open source. Very few developers know that the Firefox Debugger is a web application. It's a lot of fun to hear the amazing tools others want to build once they learn that they can!

### Getting Started :runner:

Getting started on an open source project is like starting a new job.
Expect to spend the first days or weeks learning the codebase and meeting
the team.

The best thing to do first is to answer specific questions like,
"How are sources shown on the left?" Here is [a guided activity][first-activity]
to help you get started.

It's also helpful to think about who is working on the
debugger, and what team members you might want to ask for help early on.
We are lucky to have a great number of [dedicated, friendly contributors][getting-help] here.

#### Your First Code Contribution

If you're looking for a good issue to begin working on, you can look through
the [:wave: good first issue][labels-good-first-issue] and [:wave: help wanted][labels-help-wanted-available] issues.

These issues should be well documented.

To begin your work, make sure you follow these steps:

* [Fork this project][debugger-fork]
* Create a branch to start your work, using `git checkout -b your-feature-name`
* Make your changes (either on GitHub or in your chosen code editor) 
* Stage your commit, using `git add your-modified-file`
* Commit your work, using `git commit -m 'your commit message'`
* Start a [pull request](#pull-requests) on GitHub

#### Coding Standards

When making code contributions, there is **one golden rule** you should follow: 

*Be consistent with the rest of the code in the file*

As *debugger* is part of FireFox DevTools, our code follows Mozilla's DevTools coding standards for Javascript. 

You can earn more about these coding standards at the following links:

* [JavaScript Coding Style][moz-js-code-style]
* [Rules for Formatting Comments][moz-js-formatting-comments]

### Development Guide :computer:

Go to [Local Development](../docs/local-development.md) to learn about:

* [Configs](../docs/local-development.md#configs)
* [Themes](../docs/local-development.md#themes)
* [Internationalization](../docs/local-development.md#internationalization)
* [Prefs](../docs/local-development.md#prefs)
* [Flow](../docs/local-development.md#flow)
* [Logging](../docs/local-development.md#logging)
* [Testing](../docs/local-development.md#testing)
* [Linting](../docs/local-development.md#linting)

### Terminology

* [Generated / Original](../docs/terminology.md#generated--original)

### Debugging Firefox

At some point, you'll want to debug Firefox to see your changes in the DevTools Panel or inspect the debugger server.

Here's a [guide](../docs/debugging-firefox.md) to help you get started. 

### Issues

* [Issue Titles](../docs/issues.md#issue-titles)
* [Issue Descriptions](../docs/issues.md#issue-descriptions)
* [Claiming Issues](../docs/issues.md#claiming-issues)
* [Labels](../docs/issues.md#labels)
* [Available Issues](../docs/issues.md#available-issues)
* [Triaging](../docs/issues.md#triaging)
* [Issue Organization](../docs/issues.md#issue-organization)
* [Community Friendly](../docs/issues.md#community-friendly)

### Pull Requests

 **Working on your first Pull Request?** You can learn how from this *free series* [How to Contribute to an Open Source Project on GitHub][egghead-contrib-oss].

Go to [Pull Requests](../docs/pull-requests.md) to learn about:

* [Screenshots](../docs/pull-requests.md#screenshots)
* [Test Steps](../docs/pull-requests.md#test-steps)
* [Testing](../docs/pull-requests.md#testing)
* [Reviews](../docs/pull-requests.md#reviews)
* [Updates](../docs/pull-requests.md#updates)



### Maintainer Tips

Helping maintain a project is the best way to contribute to its overall health.
Here are some [notes](../docs/maintainer.md) on how we work.

+ [Triaging Issues](../docs/maintainer.md#triaging-issues)
+ [Making Bugs Actionable](../docs/maintainer.md#making-bugs-actionable)
+ [Closing Stale Issues](../docs/maintainer.md#reviewing-stale-issues)
+ [Making Issues Available](../docs/maintainer.md#making-issues-available)
+ [Following up on In Progress work](../docs/maintainer.md#following-up-on-in-progress-work)
+ [Adding a Patch](../docs/maintainer.md#adding-a-patch)
+ [Pushing to a Branch](../docs/maintainer.md#pushing-to-a-branch)

### Debugging Tips

+ [Components](../docs/debugging.md#components)
+ [Actions](../docs/debugging.md#actions)
+ [Reducers](../docs/debugging.md#reducers)
+ [Client](../docs/debugging.md#client)

### Pro Tips for Contributors

Here are some tips from our contributors that you may find useful:

* **Manage your time wisely** - It's easy to get overwhelmed by a million tasks at once. Avoid this by only `/claim`ing one issue at a time, and working on that issue until it is completed. There will always be more available issues in the future.

* **Communicate early and often** - If you have questions, *ask them*. If you have comments, *make them*. Share your work and your progress often, and our team of contributors will operate much more smoothly as a result. 

* **Set Realistic Goals** - It takes time, effort, and energy to write good code. It takes even more of all that to properly research bugs, plan new product features, and test the code you've written. As such, it's important that you *don't take on more work than you can handle*. Instead, focus on landing the smallest possible contributions, piece by piece.

* **Advocate for Open Source at Work** - Though you can certainly contribute to open source software (OSS) for fun, you may be able to benefit from it professionally, as well. Consider talking with your manager about open source time at work. 

There are several reasons why this makes sense for your employer:
  * **Expertise** - Teams benefit from having a resident expert on debugging or other developer tools.
  * **Marketing** - Your manager can market their team as OSS-friendly to candidates and other employees.
  * **Career Development** - The skills you learn in OSS translate to your own growth as a developer.
  * **Sponsoring** - Your team benefits from having quality OSS tools. Sponsoring your OSS time is a great way to give back to the community.

## Project Overview

### debugger

The *debugger* project is a JavaScript debugger built from the ground up using modern web application technologies. It is designed primarily for debugging Firefox but also for debugging in other environments like Chrome, or Node.

### Firefox Devtools

*Firefox Devtools* is the larger umbrella initiative that encompasses *debugger* and several other DevTools projects. The Firefox DevTools project claims its origin from a demo for a Mozilla work week in Orlando, FL, USA (December 2015), where the team worked under a tight deadline to provide a proof of concept of the Firefox developer tools running in pure HTML, even outside of Firefox. The code for that demo can be found on GitHub under [@joewalker/devtools.html][joe-walker-devtools-demo].

Since that original demo, the Firefox Devtools project has progressed quite a bit. To learn more about it, please read the [devtools.html proposal document][devtools-proposal] and take a look at the [devtools.html meta bug][devtools-meta-bug] for tracking progress.

Currently, the DevTools project ships developer tools for both Firefox and Firefox Developer Edition. 

### Get Involved with Firefox Devtools

If you're looking to work directly on the DevTools project, you can find more information on the [Firefox Devtools' *Getting in Touch* page][devtools-getting-in-touch].

### Talks and Videos about *debugger*

* [Talks](../docs/talks.md)
* [Videos](../docs/videos.md)


### Joining Mozilla

Mozilla has hired (and continues to hire) many people from within the open source community, bringing contributors directly into the team; however, contribution is not necessarily a path to employment. Our internal hiring criteria are about more than just contributions; we are also looking at a number of other factors that create a diverse and healthy team.

**Ask**- Take a look at the current openings at [Mozilla Jobs][moz-careers] to see if there is a position that is a good fit for you. If you’re interested in a job with Mozilla, feel free to ask employees what it’s like to work here. However, employees can’t help you get hired outside of being a referral for you.

**Referrals**- If you’ve been making reasonable and regular contributions to the project, we’d be happy to be a reference for you. We can make internal referrals to Mozilla, or act as your reference to other companies. Please be considerate when making this request, we are happy to help you and want to see you find a job you want but can’t do this for everyone who contributes.

[getting-setup]:../docs/getting-setup.md
[labels-help-wanted-available]:https://github.com/firefox-devtools/debugger/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22+-label%3A%22in+progress%22
[labels-bugs]: https://github.com/firefox-devtools/debugger/labels/bug
[labels-docs]: https://github.com/firefox-devtools/debugger/labels/docs
[labels-enhancement]:https://github.com/firefox-devtools/debugger/labels/enhancement
[labels-good-first-issue]: https://github.com/firefox-devtools/debugger/labels/%3Awave%3A%20%20good%20first%20issue

[@jasonlaster]:https://github.com/jasonlaster
[@digitarald]:https://github.com/digitarald
[@codehag]:https://github.com/codehag
[@violasong]:https://github.com/violasong
[@darkwing]:https://github.com/darkwing

[jasonlaster]:https://avatars.githubusercontent.com/jasonlaster?size=56
[digitarald]:https://avatars.githubusercontent.com/digitarald?size=56
[codehag]:https://avatars.githubusercontent.com/codehag?size=56
[violasong]:https://avatars.githubusercontent.com/violasong?size=56
[darkwing]:https://avatars.githubusercontent.com/darkwing?size=56

[mozilla]:https://www.mozilla.org/
[mozilla-firefox]:https://www.mozilla.org/firefox/

[meetup-example]:https://docs.google.com/document/d/1jJ27v-qnVtFrAmrJ8tWAOHOXvrQ7RN8oID44VPYXWrM/edit?usp=sharing
[meetup-guide]:https://docs.google.com/document/d/1SMbF2IEkTsQAd28-Xzhn7HS7yAORmxCVktlRkSdwmpQ/edit#heading=h.qqrdmxv84ec2

[medium]: https://medium.com/
[search-boxes]:http://jasonlaster.github.io/devtools/js/2017/01/05/searching.html
[getting-into-the-flow]:http://jasonlaster.github.io/devtools/js/2017/01/20/typing-the-debugger.html
[better-sourcemaps]:http://jlongster.com/On-the-Road-to-Better-Sourcemaps-in-the-Firefox-Developer-Tools
[stepping-debugger]:http://jlongster.com/Implementing-Stepping-Debugger-JavaScript


[getting-help]:../docs/local-development.md#getting-help
[first-activity]:../docs/debugging-the-debugger.md
[goodness-squad]:https://hackernoon.com/goodness-squad-a8704d594a7a#.qllq19koq
[slack]:https://devtools-html-slack.herokuapp.com/

[moz-careers]: https://careers.mozilla.org/
[moz-participation]: https://www.mozilla.org/en-US/about/governance/policies/participation/
[gh-contrib-docs]: https://guides.github.com/activities/contributing-to-open-source/
[debugger-issues]: https://github.com/firefox-devtools/debugger/issues/
[debugger-fork]: https://github.com/firefox-devtools/debugger#fork-destination-box
[slack-community-team]: https://devtools-html-slack.herokuapp.com/
[moz-js-code-style]: https://wiki.mozilla.org/DevTools/CodingStandards#Code_style
[moz-js-formatting-comments]: https://wiki.mozilla.org/DevTools/CodingStandards#Comments
[egghead-contrib-oss]: https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github

[joe-walker-devtools-demo]: https://github.com/joewalker/devtools.html
[devtools-proposal]: https://docs.google.com/document/d/1_5aerWTN_GVofr6YQVjmJlaGfZ4nv5YKZmdGHewfTpE/edit#heading=h.dw3amfbdp0lh
[devtools-meta-bug]: https://bugzilla.mozilla.org/show_bug.cgi?id=1263750
[devtools-getting-in-touch]: http://firefox-dev.tools/#getting-in-touch
