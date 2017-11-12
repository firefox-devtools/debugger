---
permalink: docs/updates
---

## Weekly Updates

### [October 31st](./updates-10-31-2017.md)

+ Wellington unified our search UX to create an editor style modal for searching for files, functions, variables, and jumping to a line. We now have helpful prefixes for changing modes: @, #, :.
+ Lots of great UI polish
+ Sped up stepping with large files


### [October 24th](./updates-10-24-2017.md)

This week we had 25 contributors and 30+ PRs.

* Andrew helped us upgrade to flow 53
* Jiel helped us convert SVGs to background images
* Tohm blackboxed sources are now identified in the source tree
* Sneha Aligned the first tab with wide gutters
* Bomsy and James got jump to line to support scrolling to columns.

### [October 17th](./updates-10-17-2017.md)

* New Go to line Modal, allowing users to go to a specific line in an open file
* Showing react classes in preview
* Improvements to the source tree panel including
  * Setting a root folder
  * Collapsing all nodes
* we managed a substantial refactoring of our editor, making it more modular and easy to work with for developers
* new docs were added regarding triaging and merge conflicts


### [September 26th](./updates-9-26-2017.md)

* UCOSP Students
* UX/UI
* Shortcuts
* Preview
* Outline View
* Photon
* Project Search
* Watch Expressions
* Context Menu
* Map Minified variables
* List Workers
* Accessibility
* Breakpoints
* Infrastructure
* Performance

### [September 5th](./updates-9-5-2017.md)


* **AST Breakpoints** landed the final changes for finding a breakpoint ast location and setting an ast location when a breakpoint is created.  We should be able to land AST Breakpoints this week!
* **Async Stepping** landed the utilities for identifying async expressions, and the logical "next" statement to step to. Async Stepping will land in the next release.
* **WASM** We enabled wasm debugging in the new UI and it is now turned on in nightly. Debugging WASM source code in the native language (C, C++) is a blast.
* **Worker List** added a new Workers right sidebar pane and populating the pane with debuggee workers. The next step is to add the about:debugging util for launching a new toolbox.
* **Mapping minified variables** started working on mapping minified variables, which will show the the "original" variable name in the scopes pane, and enable preview, watch expressions and the console to work with original * expressions.
* **Project Search** continued to polish project search. This week we fixed keyboard navigation of streaming results, and made result orders deterministic.
* **Syncing CSS** removed the theme's CSS class namespace, which will make it easy to sync themes with m-c.
* **Accidental Breakpoints** fixed and uplifted a bug to 56, where the debugger created new breakpoints when the user changed original code and reloaded.
* **File Search** improved file search performance and fixed a bug where the debugger would crash on large files.
* **Empty Lines** landed disabled empty lines where the debugger disables lines that do not have any executable code.
* **Photon** started styling the debugger for the new photon design. It is looking great!
* **Welcome Box** styled the welcome box and added some additional shortcuts.
* **Release** released a new version of the debugger to nightly, which included the last month of work. We'll start getting feedback on it now that it's in nightly.


### [August 29nd](./updates-8-29-2017.md)

* Finished move to JSX for all of our components
* Improved testing of intermittents, we now have a script that finds them
* Progress on the AST breakpoints -- we have added a util and tests for finding ast locations. Next step, add to breakpoint syncing
* Improved breakpoints syncing -- we can now delete breakpoints that move outside of a source

#### User Visible
* the search combination keys for text are now displayed and style
* Added copy functionality to the context menu of the editor

### [August 22nd](./updates-8-22-2017.md)

* new release this week will include project search and outline view
* empty line gutters are no longer going to be clickable: PR
* Async/await stepping is in progress. Jaideep did a lot of great work.
* Improved development experience for windows users
* Source tree now handles files and folders with the same name in a reasonable manner
* Source tree has also been generally cleaned up
* Debugger uses the Object Inspector from Core (same as the console)

### [August 15th](./updates-8-15-2017.md)

* We're switching to JSX
* Project Search is getting close
* Lots of test and code quality fixes
* Lots of small paper cut fixes

### [August 1st](./updates-8-1-2017.md)

* UI Polish
* Bug Fixes
* Project Search

### [July 25th](./updates-7-25-2017.md)

* lots of polish as we prepare for releasing in 56
* breakpoints are more stable
* project text search is getting closer
* wasm support is coming to the debugger

### [July 11th](./updates-7-11-2017.md)
lots happened since the last update:

* Edge Cases: pretty print, symmetric breakpoints, …
* Performance: stepping, preview
* UI: New symbol modal, full project text search
* Experiments: Call Site Breakpoints, Async stepping

### Types and Tests Review

* [Flow Review](./5-1-2017-flow.md)
* [Tests Review](./5-1-2017-tests.md)

### [June 20th](./updates-6-20-2017.md)
It's been a quieter week than last week. This weeks highlights include:

* new UI improvements to search (thankyou to [@ruturajv]!
* some new documentation
* WTR runner

### [June 13th](./updates-6-13-2017.md)

We focused this week on getting lots of bugfixes and community prs in

* Nightly is up to date with the latest debugger updates
* new styling for the Outline View, big thanks to [@amelzer]
* searchbar had a lot of improvements
* lots of dependancies were updated, thanks to [@zaggy]
* further work on getting more frameworks included on our framework frames. Thanks to
  [@andreicristianpetcu]

### [June 6th](./updates-6-6-2017.md)

This was a really great week for QA improvements as the debugger is getting more stable each week.

* We now disable out of scope lines when the debugger pauses.
* We have huge updates to preview - it's faster, more consistent, and works for HTML elements
* Breakpoints are kept in sync as code changes. Big thanks to [codehag][@codehag]
* We're chipping away at two new features: Outline View and Project Search

### [May 23rd](./updates-5-23-2017.md)

We focused this week on UI polish, bug fixing, and performance as we focus on getting ready for the June 15th Firefox 55 release.

* Intelligently place preview popups and tooltips
* Add an option for disabling Framework Frames
* Polish the search bar
* Speed up stepping performance

### [May 16th](./updates-5-16-2017.md)

Here are some highlights from the week:

* :yellow_heart: Function highlighting
* :police_car: License checking for our dependencies
* :nail_care: Lots of UI polish

### [When the World Stops](./when-the-world-stops.md)

One of the most interesting debugger questions is what happens when the debugger stops? This post is a quick run-through that will give you some context so that you can dig in and answer your own questions.

### [May 9th](./updates-5-9-2017.md)

* [Adam][@asolove] dramatically improved our startup performance. [pr][pr-6]
* [Ryan][@ryanjduffy] completed the heroic and insane project of getting babel working with HTML inline JS. [pr][pr-23]
* [Diéssica][@diessica] jumped in and polished our Tabs UI
* We started converting our Prop Types to Flow Props. Thanks [Mateusz][@Andarist] and others for the help kicking this off!
* We added several new Jest component tests. Big thanks to [Andrei][@andreicristianpetcu] for tackling async component updates. It was not an easy task!
* We re-added storybook this week and wrote our first stories for Frames and Tabs! The stories are also being tested on CI with the great [percy.io](http://percy.io).

### [May 2nd](./updates-5-2-2017.md)

* :bullettrain_front: Column Breakpoints
* :spaghetti: Framework Frames
* :speech_balloon: Watch Expressions
* :spaghetti: Copy Call Stack

### [April 25th](./updates-4-25-2017.md)

* :corn: We started working on proper code folding
* :mag: landed support for getter values

### [April 18th](./updates-4-18-2017.md)

* :orange_book: Framework Frames
* :mag: Previewing Windows
* :ant: Component + Integration Tests

#### [April 11th](./updates-4-11-2017.md)

* :ant: Bucket Window Properties
* :eyes: Display popover intelligently
* :baby: Formatting Functions

#### [April 10th - Call Stack Plans](./call-stack-4-10-2017.md)

* :diamond_shape_with_a_dot_inside: Highlighting libraries
* :envelope: Simplifying Function Names
* :spaghetti: Collapsing Libarary frames
* :baby: Naming Library frames
* :black_medium_small_square: Blackboxing libraries

#### [April 4th - Weekly Update](./updates-4-4-2017.md)

* :black_medium_small_square: Blackboxing
* :kissing_heart: ES6
* :eyes: Preview
* :phone: client

#### [March 28th - Weekly Update](./updates-3-28-2017.md)

* :mag: Function Search
* :traffic_light: Code Coverage

#### [March 21st - Weekly Update](./updates-3-21-2017.md)

* :nail_care: Prettier
* :red_circle: Persisted Breakpoints

#### [March 14th - Weekly Update](./updates-3-14-2017.md)

* :smiling_imp: Jest
* :mag: File Search
* :eyes: Preview

#### [March 7th - Weekly Update](./updates-3-7-2017.md)

* :mag: Function Search
* :waning_gibbous_moon: Dark Theme Polish

#### [February 28th - Weekly Update](./updates-2-28-2017.md)

* :red_circle: Testing Improvements
* :ant: Lots of bug squashing


[@asolove]:http://github.com/asolove
[@ryanjduffy]:http://github.com/ryanjduffy
[@diessica]:http://github.com/diessica
[@codehag]:http://github.com/codehag
[@andreicristianpetcu]:http://github.com/andreicristianpetcu
[@Andarist]:http://github.com/Andarist
[pr-6]:https://github.com/devtools-html/debugger.html/pull/2784
[pr-23]:https://github.com/devtools-html/debugger.html/pull/2810
[@zaggy]:http://github.com/zaggy
[@amelzer]:http://github.com/amelzer
[@ruturajv]:http://github.com/ruturajv
