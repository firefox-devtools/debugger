## Debugger Screencasts

**Goals:**

* Help newcomers get started
* Give a visual flavor of how the Debugger works
* Show how some of the React + Redux concepts come together to create the Debugger
* Introduce you to the team. The Debugger is a fun project and we don't take ourselves too seriously!

### Getting Started

This [video](https://youtu.be/9bQ0a3pnBZk) walks through the [getting setup][getting-setup] steps:

1.  starting the [dev server][dev-server]
2.  starting chrome and firefox
3.  launching the debugger
4.  and then jumps in to [debugger inception][first-activity] because it's too cool not to!

<img src="https://cloud.githubusercontent.com/assets/254562/21625473/dd39c576-d1d9-11e6-965f-7b91758497db.png" width="450" >

### Event Listeners part 1

This [video](https://youtu.be/VOwn1U7K2qg) gives an overview of [event listeners][event-listeners], a new feature we're working on that lists the event handlers on the page. After that, we jump in and make each event listener link to where the handler is defined.

<img src="https://cloud.githubusercontent.com/assets/254562/21625474/dd3aba3a-d1d9-11e6-8dc9-3e9beccd4b55.png" width="450" >

### Event Listeners part 2

This [video](https://youtu.be/NoMryxkNPk0) adds additional functionality to event listeners, such as a checkbox that enables and disables breakpoints for that listener and a close button that removes the breakpoint entirely. Along the way, fetch breakpoints, refactor the component, and squash lots of bugs as they emerge.

<img src="https://cloud.githubusercontent.com/assets/254562/21625474/dd3aba3a-d1d9-11e6-8dc9-3e9beccd4b55.png" width="450" >

[getting-setup]: ./getting-setup.md
[dev-server]: https://github.com/firefox-devtools/devtools-core/blob/master/packages/devtools-launchpad/README.md#dev-server
[first-activity]: ./debugging-the-debugger.md
[event-listeners]: http://github.com/firefox-devtools/debugger/issues/1232

### Testing the Debugger

The Debugger is a complex React + Redux app used by millions of crazy people called developers all over the world.

This [video][testing] covers fixing a small bug and adding a new integration test. It reviews some of the techniques we use to make sure the debugger works the way we expect it to.

Topics include:

* writing an integration test that acts like a user and interacts w/ the dom
* writing assertions and actions that take advantage of redux's Action and State APIs

[testing]: https://www.youtube.com/watch?v=5K9Sx5529JE&t=547s

<img src="https://shipusercontent.com/f3848fe2e9767891f45fabf4d7384816/Screen%20Shot%202017-11-14%20at%208.57.45%20PM.png" width="450" >

### Testing the Debugger (Pause on Next)

This [video][testing2] shows how you can debug a mochitest.

[testing2]: https://www.youtube.com/watch?v=E3QIwrcKnwg

<img src="https://shipusercontent.com/63992125cfb44a76ef6b305f2c2247ed/Screen%20Shot%202018-05-09%20at%201.28.59%20PM.png" width="450">

### How the Firefox Debugger uses Babel to Know What's Up?

In this [video][babel], we'll look at how the Firefox Debugger uses Babel to parse the code that's run in the browser and know what's going on.

[babel]: https://www.youtube.com/watch?v=9z3jf69MVsU&t=17s

<img src="https://shipusercontent.com/1a60560df7eacbb89e147507cc3e608e/Screen%20Shot%202017-11-14%20at%208.59.15%20PM.png" width="450" >
