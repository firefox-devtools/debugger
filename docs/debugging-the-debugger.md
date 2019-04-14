# Debugging the Debugger

Debugging the debugger is one of the highest levels of inception. Before you begin, prepare yourself for a mind-bending trip of self-discovery.

## Playing with the Debugger

Set up the debugger so that your environment looks like this [gif][debugger-intro-gif]. If you have any questions, go back to the [_Getting Set Up_][getting-setup] instructions.

Now that you have the debugger ready, play around with it.

- Use the debugger and get comfortable with how it works (from a user perspective).
- Identify the different components and panes (e.g. the sources pane, editor, right sidebar, etc.).
- Review the code and identify the presentation layer with React, the interaction with Redux, and the client's data.

## Design a New Theme :snowflake:

Let's design a new theme for the debugger—don't worry, it's not so hard!

**Goals**

- Style the source tree, the editor, and some other UI components.

**Hints**

- Don't forget to read about the [themes](local-development.md#themes).
- Remember that each component has its own CSS.
- Keep in mind that there is a CSS file for variables: 
  ~/debugger/node_modules/devtools-mc-assets/assets/devtools/client/themes/variables.css  
- Take a look at the "reps"— a set of rules for the debugger!

**Next Steps**

Share a screenshot of your theme!

Here's an example: 

* [Camo theme][camo-theme] designed by [@jasonlaster](https://github.com/jasonlaster).


## Make Your Breakpoints Dance :dancers:

Adding a breakpoint is a critical piece in the inception game.

**Goals**
- Make the debugger do something special whenever a breakpoint is added.

**Hints**

You can find the file that handles breakpoints here: `/debugger/src/components/Editor/Breakpoint.js`. 

Once you have the file open in your editor,  go ahead and find (Ctrl-F) "addBreakpoint". This should pull up the `addBreakpoint` function, which (surprise!) adds a breakpoint. 

Next we are going to add an alert, so that we can see that we're triggering the right code:

```javascript
addBreakpoint() {
    const { breakpoint, editor, selectedSource } = this.props;

    // Hidden Breakpoints are never rendered on the client
    if (breakpoint.hidden) {
      return;
    }

	//Add the code below
	alert("Your first breakpoint! Congratulations!");


    // NOTE: we need to wait for the breakpoint to be loaded
    // to get the generated location
    if (!selectedSource || breakpoint.loading) {
      return;
    }
```

This will cause a popup to appear whenever we create a breakpoint.

**Next Steps**

Use your imagination! 

What should your version of the debugger do whenever a breakpoint is added?


## Pausing FTW :red_circle:

When the debugger pauses, the fun begins! Here's a [gif](http://g.recordit.co/qutDioRQvy.gif) of what the debugger does normally when it pauses.

**Goals**
- Add logic on the pausing event.

**Hints**

Here's some example code that can help you get started:

The file `debugger/src/components/SecondaryPanes/Frames/WhyPaused.js` renders the reason for the pause in the sidebar, and the file `/debugger/src/utils/pause/why.js` is used in several places to expose the current paused state.

**WhyPaused.js** (Starts at line 42):

```javascript
export default function renderWhyPaused({ pause }: { pause: Pause }) {
  const reason = getPauseReason(pause);

  if (!reason) {
    return null;
  }
  //Add the code below:
  console.log("Hello from src/components/SecondaryPanes/Frames/WhyPaused.js!");

  return (
    <div className={"pane why-paused"}>
      <div>{L10N.getStr(reason)}</div>
      {renderMessage(pause)}
    </div>
  );
}
renderWhyPaused.displayName = "whyPaused";
```

Then in **why.js** (which starts at line 31):

```javascript
export function getPauseReason(why?: Why): string | null {
  if (!why) {
    return null;
  }
  //Add the code below:
  console.log("hello from src/utils/pause/why.js!");

  const reasonType = get(pauseInfo, "why.type", null);
  if (!reasons[reasonType]) {
    console.log("Please file an issue: reasonType=", reasonType);
  }
  return reasons[reasonType];
}
```

**Next Steps**

Your mission, if you choose to accept it, is to make the pausing do something truly weird.

Go crazy! The only limits here are those in your imagination. 

Once you've have some cool ideas in mind, see if you can implement them successfully.

## The Debugger Philosophy

Here's the **debugger philosophy** in a nutshell.

1.  When you inspect the running debugger app, you're debugging a web app.
2.  The debugger, like other applications, has an API for communication with the browser.
3.  There's no magic here! If you can build a web app, you can hack on the debugger.
4.  You are the debugger's principal customer. Remember, the customer is always right!

Please let us know if we're missing something zen [here][getting-started-issue].

### Next Steps

Now that you've internalized the debugger philosophy, it's time to start putting this wisdom to good use.

Here are a few useful ways you can **share what you've learned** from using and contributing to the Firefox Debugger:

* **Give a talk** at your school, at work, or at a local meetup. We're willing to bet that your audience won't know the debugger is actually a web app! 
* **Write a blog post.** We'd be happy to link to your post here, and it could go a long way towards helping a newcomer grok our philosophy.

**Talks**

* Here are Firefox Devtools contributor Amit Zur's (@amitzur) [slides][amit-slides] from his _JavaScript Israel_ [talk][amit-tweet] about the debugger, titled _A New Way for OSS @ Mozilla_. 

## Contribute to the Debugger

Take a look at how you can start [contributing][contributing]. We would love the help!

[contributing]: https://github.com/firefox-devtools/debugger/blob/master/.github/CONTRIBUTING.md
[getting-setup]: ./getting-setup.md
[getting-started-issue]: https://github.com/firefox-devtools/debugger/issues/1247
[debugger-intro-gif]: http://g.recordit.co/WjHZaXKifZ.gif
[amit-slides]: https://docs.google.com/presentation/d/1jdnvL-BwwxEuFbb9tiRxcT6UT-Ua0jGhy9FKBT4b43E/edit
[amit-tweet]: https://twitter.com/amitzur/status/790153843946426369
[camo-theme]: https://cloud.githubusercontent.com/assets/254562/20683683/ec030354-b57a-11e6-98bc-c8da75721e78.png
