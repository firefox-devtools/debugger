## Talks

### [Tomorrow's Debugger][amit-v]

These days, Mozilla is rewriting Firefox’s devtools using a new and shiny technology stack. Anyone can join easily – the code is on Github, and it’s just a matter of 2 commands in your terminal to get a local debugger running!

The debugger is universal – it can debug any browser, node and mobile. The feature list is innovative and aimed to be the best debugging experience for React, Angular, Ember, RxJS and more types of apps. In addition, making contribution to the debugger together with top notch developers from all around the world is an amazing experience!

By the end of this talk you will have the tools to get into hacking on Firefox’s debugger. I will introduce architecture and process of development, and make you feel comfortable to approach a world class open source project, and become a contributor to tomorrow’s JavaScript debugger.


[amit-v]: https://www.youtube.com/watch?v=Rop3EgPvBMw&feature=youtu.be

<img src="https://shipusercontent.com/623b948e321f025e283ed11e27668901/Screen%20Shot%202017-11-14%20at%209.01.23%20PM.png" width="450" >

### [Do this, not that! Side-effect Management in UIs][yulia-side]

Functional programming has become popular for building robust, complex UIs. Using React and Redux, for example, alleviates many of the issues commonly found in UI programming. In particular, making changes in state clear and predictable rather than the mess found in earlier solutions. However, there are some problems which continue to be painful. Asynchronicity is one such example, since changes to state which are asynchronous are difficult to predict and reason about. In the Firefox debugger, we have explored two options within the react ecosystem for dealing with this: thunk args and sagas. They take two different approaches to the problem of communicating with an async resource and updating the state. Using a recent refactoring of debugger breakpoints as a case study, we will explore the strengths and weaknesses of each. In the process, we will clarify the rationale behind the patterns and show how we came to our chosen solution. While the talk will be focused on the issue from a front-end/UI perspective, it might prove an interesting inspiration for similar problems in other places!

[yulia-side]: https://www.youtube.com/watch?v=gE96v-O5cjo

<img src="https://shipusercontent.com/fd4ae35ddac8e073a437548a83457795/Screen%20Shot%202017-11-14%20at%209.05.18%20PM.png" width="450" >

### [Debugging Your Debugger][jlongster-talk]

[jlast-talk]:https://www.youtube.com/watch?v=O_xViL2TGrU

### [Enter Inspector Inception: Let's See How Browser Developer Tools Work!][jlast-talk]

 As developers, we use browser developer tools every day, but how often do we stop and think about how they work?

The secret is that browser developer tools are built with HTML, CSS, and JS and that any web developer can contribute to them. In this talk, we'll enter inspector inception and see how developer tools work from the inside out. In the process, we'll get a better understanding of how the tools we use every day work.

[jlongster-talk]:https://www.youtube.com/watch?v=gvVpSezT5_M
