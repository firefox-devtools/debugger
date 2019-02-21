### September 5th

This past week was one of the more impressive weeks in the project:

* **AST Breakpoints** [@codehag] landed the final changes for finding a breakpoint ast location and setting an ast location when a breakpoint is created.  We should be able to land AST Breakpoints this week!
* **Async Stepping** [@jbhoosreddy] landed the utilities for identifying async expressions, and the logical "next" statement to step to. Async Stepping will land in the next release.
* **WASM** We enabled wasm debugging in the new UI and it is now turned on in nightly. Debugging WASM source code in the native language (C, C++) is a blast.
* **Worker List** [@nyrosmith] added a new Workers right sidebar pane and populating the pane with debuggee workers. The next step is to add the about:debugging util for launching a new toolbox.
* **Mapping minified variables** [@yurydelendik] started working on mapping minified variables, which will show the the "original" variable name in the scopes pane, and enable preview, watch expressions and the console to work * with original expressions.
* **Project Search** [@bomsy] continued to polish project search. This week he fixed keyboard navigation of streaming results, and made result orders deterministic.
* **Syncing CSS** [@jasonLaster] removed the theme's CSS class namespace, which will make it easy to sync themes with m-c.
* **Accidental Breakpoints** [@jasonLaster] and [@codehag] fixed and uplifted a bug to 56, where the debugger created new breakpoints when the user changed original code and reloaded.
* **File Search** [@codehag] improved file search performance and fixed a bug where the debugger would crash on large files.
* **Empty Lines** [@darkwing] landed disabled empty lines where the debugger disables lines that do not have any executable code.
* **Photon** [@gabrielluong] started styling the debugger for the new photon design. It is looking great!
* **Welcome Box** [@pradeepgangwar] styled the welcome box and added some additional shortcuts.
* **Release**  [@jasonLaster] released a new version of the debugger to nightly, which included the last month of work. We'll start getting feedback on it now that it's in nightly.

[@codehag], [@darkwing], [@rohanprasad], [@pradeepgangwar], [@jasonLaster], [@nyrosmith], [@bomsy], [@gabrielluong], [@yurydelendik], [@wldcordeiro]

#### UX/UI:

* [Make Expression line height equal to likewise labels][pr-10] - [@darkwing]
* [Fix #3860 - Disable the Copy context menu item if nothing is selected][pr-13] - [@darkwing]
* [Accordion header should have a height of 24px (#3868)][pr-14] - [@gabrielluong]
* [Fix Margin around view-source tab][pr-2a] - [@pradeepgangwar]
* [Add breakpoint or toggle enabled state on Shift+Click][pr-7a] - [@nyrosmith]
* [Make the source tab hover effects feel more responsive][pr-2] - [@darkwing]
* [Style Welcome Box][pr-4] - [@pradeepgangwar]
* [add marko syntax highlighting][pr-8] - [@nyrosmith]
* [Source header and Command bar should use the toolbar background color…][pr-12] - [@gabrielluong]
* [Make case consistent for search sources][pr-15] - [@darkwing]

#### Project Search

Project Search is one of those features, which is hard to get just right. This week, [@bomsy] fixed an issue which was breaking keyboard navigation when search results were streaming in. The basic problem was every time the results were updated, the UI needed to re-focus on the first item, this is easier said than done! We also added a lot of polish to the UI, [@zacck] is working on making sure our focus, hover, and select states are all correct!

* [Fix project search test](https://github.com/firefox-devtools/debugger/pull/3888) [@jasonLaster]
* [[WIP] Stealing Atom look and feel for the Search UI](https://github.com/firefox-devtools/debugger/pull/3823) [@zacck]
* [Fix focus issues][pr-11] - [@bomsy]

![project]

#### Empty lines:

We think the debugger is a great place to teach users about the semantics of JS. This is why, we've started marking lines of code that are in scope when paused. It is also, why we wanted to start disabling lines of code that are not executable. Another nice benefit is that the debugger will no longer try and guess where to "slide" a breakpoint to, which can create some weird interactions.

Huge thanks to [@darkwing] who added the parser utilities for finding empty lines, the reducer for storing empty lines, and the empty lines component.

* [Display empty lines UI][pr-11a] - [@darkwing]
* [Add empty line utils][pr-5a] - [@darkwing]
* [Add Empty Lines to AST reducer][pr-3a] - [@darkwing]


![empty]

#### Workers panel:

Firefox has great support for web workers and service workers. For instance, a worker can have a child worker. Unfortunately, the Firefox debugger has lagged behind Chrome's. We hope to catch up. This past week [@nyrosmith] started working on a workers right sidebar panel which will show a list of workers that can be debugged. The old UI had this, and we know it is important to surface. We hope to make it possible to debug workers in the same toolbox in Q1 of 2018.

* [Show workers][pr-7] - [@nyrosmith]
* [List workers](https://github.com/firefox-devtools/debugger/pull/3856) [@nyrosmith]

#### AST breakpoints:

AST breakpoints is perhaps the biggest upgrade to breakpoints that since source mapped breakpoints :) In July, we started checking the breakpoint's generated location on reload to see if it had moved away from the original location. If it had, we would remove it and create a new one. With AST breakpoints, we are now saving the breakpoints closest function and offset so that on reload we can see if the function moved, and if so move the breakpoint as well. We hope to add more AST specificity in the future so that breakpoints can be pinned to variable declarators, call expressions, and many other AST locations!

* [add astLocation to addBreakpoint][pr-1] - [@codehag]
* [clear ast tree on navigate][pr-5] - [@codehag]
* [Add astBreakpoint to syncBreakpoint](https://github.com/firefox-devtools/debugger/pull/3851) [@codehag]
* [refactor loadSourceText][pr-0] - [@codehag]

![ast]

#### Mapping Minified Variables

One of the biggest issues with debugging with source maps, is that while you get line-to-line mapping, you don't get variable-to-variable mapping. This means, that you can add a breakpoint and step easily with breakpoints, but you can't easily see or preview the variables when paused. There are three specific bugs here: the variables in the scope pane are from the "generated" scope and hovering on a variable or evaluating in the console is broken.

We hope to solve these problems by mapping generated and original variables. And we're starting with the minified case. This week, [@yurydelendik] created the initial PRs for doing the mapping and got a proof of concept of preview and scopes working!

* [Parse to extract all scopes and bindings.](https://github.com/firefox-devtools/debugger/pull/3852) [@yurydelendik]
* [Show mapped names in scopes bindings](https://github.com/firefox-devtools/debugger/pull/3817) [@yurydelendik]

![map]

#### Async Stepping:

Async stepping is a subtle feature, where when the user pauses on an async expression they expect to be able to step over it and land on the next statement.

This means that when the debugger pauses it needs to figure out if it is at an await expression and then where the next statement is.

```js
async function updateUser(name, email) {
  const realName = formatName(name)
  const updatedUser = await updateUserAPI(realName);
  return updatedUser;
}
```

[@jbhoosreddy] landed this feature last week. It's

* [Update async stepping][pr-9] - [@jbhoosreddy]

![async]

#### Bugs


* [Caches line formatter type; resizes gutter after the change.][pr-4a] - [@yurydelendik]
* [Searching across very long lines](https://github.com/firefox-devtools/debugger/pull/3885) [@codehag]
* [Remove old generated breakpoints][pr-1a] - [@jasonLaster]


#### Code Health

* [[flow] [WIP] update to v 53](https://github.com/firefox-devtools/debugger/pull/3710) [@arthur801031]
* [Add a wallaby config to the project.](https://github.com/firefox-devtools/debugger/pull/3613) [@wldcordeiro]

#### Documentation

* [document reducer best practices](https://github.com/firefox-devtools/debugger/pull/3874) [@jasonLaster]

#### Infrastructure:

* [bump pretty fast][pr-9a] - [@jasonLaster]
* [Modify the path to point to the local Jest installation.][pr-10a] - [@wldcordeiro]
* [Fix linting issues inside Storybook due to missing prop types][pr-6a] - [@darkwing]
* [Fix Editor spec proptypes][pr-8a] - [@nyrosmith]
* [Save source-search query in store][pr-3] - [@rohanprasad]
* [bump prettier based on updates][pr-6] - [@jasonLaster]


[map]:https://user-images.githubusercontent.com/254562/30071416-9cae4b00-9234-11e7-8cb9-6b13cc88ac48.png
[empty]:https://pbs.twimg.com/media/DIhLgM3XUAInt16.png:large
[ast]:https://user-images.githubusercontent.com/26968615/30036478-fa69727a-9170-11e7-880c-2ab85d8187d6.gif
[project]:https://user-images.githubusercontent.com/897731/29890029-79a3b068-8dc6-11e7-897e-dae8e5eeaf13.png
[async]:http://g.recordit.co/27QqcxkTTP.gif

[pr-0a]:https://github.com/firefox-devtools/debugger/pull/3812
[pr-1a]:https://github.com/firefox-devtools/debugger/pull/3790
[pr-2a]:https://github.com/firefox-devtools/debugger/pull/3810
[pr-3a]:https://github.com/firefox-devtools/debugger/pull/3818
[pr-4a]:https://github.com/firefox-devtools/debugger/pull/3764
[pr-5a]:https://github.com/firefox-devtools/debugger/pull/3811
[pr-6a]:https://github.com/firefox-devtools/debugger/pull/3825
[pr-7a]:https://github.com/firefox-devtools/debugger/pull/3808
[pr-8a]:https://github.com/firefox-devtools/debugger/pull/3839
[pr-9a]:https://github.com/firefox-devtools/debugger/pull/3836
[pr-10a]:https://github.com/firefox-devtools/debugger/pull/3843
[pr-11a]:https://github.com/firefox-devtools/debugger/pull/3821
[pr-0]:https://github.com/firefox-devtools/debugger/pull/3853
[pr-1]:https://github.com/firefox-devtools/debugger/pull/3848
[pr-2]:https://github.com/firefox-devtools/debugger/pull/3845
[pr-3]:https://github.com/firefox-devtools/debugger/pull/3809
[pr-4]:https://github.com/firefox-devtools/debugger/pull/3835
[pr-5]:https://github.com/firefox-devtools/debugger/pull/3849
[pr-6]:https://github.com/firefox-devtools/debugger/pull/3850
[pr-7]:https://github.com/firefox-devtools/debugger/pull/3806
[pr-8]:https://github.com/firefox-devtools/debugger/pull/3722
[pr-9]:https://github.com/firefox-devtools/debugger/pull/3840
[pr-10]:https://github.com/firefox-devtools/debugger/pull/3859
[pr-11]:https://github.com/firefox-devtools/debugger/pull/3841
[pr-12]:https://github.com/firefox-devtools/debugger/pull/3867
[pr-13]:https://github.com/firefox-devtools/debugger/pull/3861
[pr-14]:https://github.com/firefox-devtools/debugger/pull/3870
[pr-15]:https://github.com/firefox-devtools/debugger/pull/3857
[@codehag]:http://github.com/codehag
[@darkwing]:http://github.com/darkwing
[@rohanprasad]:http://github.com/rohanprasad
[@zacck]:http://github.com/zacck
[@pradeepgangwar]:http://github.com/pradeepgangwar
[@jasonLaster]:http://github.com/jasonLaster
[@nyrosmith]:http://github.com/nyrosmith
[@bomsy]:http://github.com/bomsy
[@gabrielluong]:http://github.com/gabrielluong
[@yurydelendik]:http://github.com/yurydelendik
[@wldcordeiro]:http://github.com/wldcordeiro
[@arthur801031]:http://github.com/wldcordeiro
[@jbhoosreddy]:http://github.com/jbhoosreddy
