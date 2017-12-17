# Debugging the Debugger

Debugging the Debugger is one of the highest levels of inception. Before you begin, prepare yourself for a mind-bending trip of self discovery.

### Playing with the debugger

Setup the Debugger so that your environment looks like this [gif][debugger-intro-gif].

If you have any questions, go back to the [getting setup][getting-setup] instructions.


### Design a new theme :snowflake:

Lets design a new theme for the debugger, it's not too hard! Our goal here is to style the source tree, editor, and other UI components.

Share your a screenshot of your theme [here](./getting-setup.md) ! Here's an example camo [theme][camo-theme] that I designed the other day.


### Make breakpoints dance :dancers:

Adding a breakpoint is a critical piece in the inception game...
Lets make the debugger do something special when a breakpoint is added.

You can find the file that handles breakpoints here: `/debugger.html/src/components/Editor/Breakpoint.js`
Then go ahead and find (Cntrl-F) "addBreakpoint".  This should pull up the addBreakpoint function, which (surprise!) adds a breakpoint!
Then we are going to add an alert so can see something for our actions:

```javascript
addBreakpoint() {
    const { breakpoint, editor, selectedSource } = this.props;

    // Hidden Breakpoints are never rendered on the client
    if (breakpoint.hidden) {
      return;
    }
	
	//This our code we added
	alert("Your first breakpoint! Congratulations!");
	
	
    // NOTE: we need to wait for the breakpoint to be loaded
    // to get the generated location
    if (!selectedSource || breakpoint.loading) {
      return;
    }
```

This will show a popup when we create a breakpoint.

### Pausing FTW :red_circle:

When the debugger pauses, the fun begins. Here's a [gif](http://g.recordit.co/qutDioRQvy.gif) of what the debugger does normally when it pauses. Your mission if you choose to accept it, is to make it do something truly weird.

Here's a patch to get you started; `WhyPaused.js` renders the pause reason into the sidebar, and `/debugger.html/src/utils/pause.js` is used in several places to expose the current paused state.

```diff
diff --git a/src/components/SecondaryPanes/Frames/WhyPaused.js b/src/components/SecondaryPanes/Frames/WhyPaused.js
index 364a7c76..ee14b4e9 100644
--- a/src/components/SecondaryPanes/Frames/WhyPaused.js
+++ b/src/components/SecondaryPanes/Frames/WhyPaused.js
@@ -48,6 +48,8 @@ export default function renderWhyPaused({ pause }: { pause: Pause }) {
     return null;
   }

+  console.log("hello from src/components/SecondaryPanes/Frames/WhyPaused.js!");
+
   return (
     <div className={"pane why-paused"}>
       <div>{L10N.getStr(reason)}</div>
diff --git a/src/utils/pause.js b/src/utils/pause.js
index 2b11d247..c4778a36 100644
--- a/src/utils/pause.js
+++ b/src/utils/pause.js
@@ -85,6 +85,8 @@ export function getPauseReason(pauseInfo: Pause): string | null {
     return null;
   }

+  console.log("hello from src/utils/pause.js!");
+
   const reasonType = get(pauseInfo, "why.type", null);
   if (!reasons[reasonType]) {
     console.log("Please file an issue: reasonType=", reasonType);
```

### Debugger Philosophy

Here's the debugger philosophy in a nutshell.

1. When you inspect the running debugger app, you're debugging a web app
2. The Debugger like other applications has an API to communicate with the browser
3. There's no magic here. If you can build a web app, you can hack on the debugger!
4. You are the debugger's principal customer. Remember, the customer is always right!

Please let us know if we're missing something zen  [here][getting-started-issue].


### Next Steps

Now that you've internalized the debugger philosophy, it's time to start putting this wisdom to use.

**Share what you know** Give a talk in school, work, or a local meetup. I'm willing to bet your audience will not know the debugger is a web app! Write a blog post. We'd be happy to link to it here and it could go a really long way towards helping a newcomer grok the philosophy.

- here are @amitzur's [slides][amit-slides] from his [talk][amit-tweet]

**Contribute back** take a look at how you can start [contributing][contributing]. We would love the help!
---

[contributing]: ../CONTRIBUTING.md
[getting-setup]: ./getting-setup.md
[getting-started-issue]:https://github.com/devtools-html/debugger.html/issues/1247

[debugger-intro-gif]:http://g.recordit.co/WjHZaXKifZ.gif
[amit-slides]:https://docs.google.com/presentation/d/1jdnvL-BwwxEuFbb9tiRxcT6UT-Ua0jGhy9FKBT4b43E/edit
[amit-tweet]:https://twitter.com/amitzur/status/790153843946426369
[camo-theme]:https://cloud.githubusercontent.com/assets/254562/20683683/ec030354-b57a-11e6-98bc-c8da75721e78.png
