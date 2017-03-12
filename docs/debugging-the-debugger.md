# Debugging the Debugger

Debugging the Debugger is one of the highest levels of inception. Before you begin, prepare yourself for a mind-bending trip of self discovery.

### Playing with the debugger

Setup the Debugger so that your environment looks like this [gif][debugger-intro-gif].

If you have any questions, go back to the [getting setup][getting-setup]
instructions.


### Design a new theme :snowflake:

Lets design a new theme for the debugger, it's not too hard! Our goal here is to style the source tree, editor, and other UI components.

Share your a screenshot of your theme [here][getting-started-issue]! Here's an example camo [theme][camo-theme] that I designed the other day.


### Make breakpoints dance :dancers:

Adding a breakpoint is a critical piece in the inception game...
Lets make the debugger do something special when a breakpoint is added.

```diff
diff --git a/src/components/Editor.js b/src/components/Editor.js
index ae71d2d..66e0c04 100644
--- a/src/components/Editor.js
+++ b/src/components/Editor.js
@@ -78,11 +78,14 @@ const Editor = React.createClass({
       return this.closeConditionalPanel(line);
     }

+    // => hamster dance
+
     this.toggleBreakpoint(line);
   },
```

We currently don't have anything awesome as a demo. If you come up with something cool, feel free to share it  [here][getting-started-issue] and we can add it to the doc!

### Pausing FTW :red_circle:

When the debugger pauses, the fun begins. Here's a [gif](http://g.recordit.co/qutDioRQvy.gif) of what the debugger does normally when it pauses. Your mission if you choose to accept it, is to make it do something truly weird.

Here's a patch to get you started where we check in the Editor to see if we're paused in a re-render.

```diff
diff --git a/src/components/Editor.js b/src/components/Editor.js
index ae71d2d..6690d05 100644
--- a/src/components/Editor.js
+++ b/src/components/Editor.js
@@ -78,11 +78,14 @@ const Editor = React.createClass({
       return this.closeConditionalPanel(line);
     }

     const line = this.editor.codeMirror.lineAtHeight(event.clientY);
     const bp = breakpointAtLine(this.props.breakpoints, line);
     this.showGutterMenu(event, line, bp);
@@ -329,6 +332,11 @@ const Editor = React.createClass({
       this.showSourceText(sourceText, selectedLocation);
     }

+    // the debugger is paused
+    if (nextProps.selectedFrame) {
+      // do something really cool here
+    }
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

**Contribute back** take a look at how you can [contributing][contributing]. We would love the help!



[contributing]: ../CONTRIBUTING.md
[getting-setup]: ./getting-setup.md
[getting-started-issue]:https://github.com/devtools-html/debugger.html/issues/1247

[debugger-intro-gif]:http://g.recordit.co/WjHZaXKifZ.gif
[amit-slides]:https://docs.google.com/presentation/d/1jdnvL-BwwxEuFbb9tiRxcT6UT-Ua0jGhy9FKBT4b43E/edit
[amit-tweet]:https://twitter.com/amitzur/status/790153843946426369
[camo-theme]:https://cloud.githubusercontent.com/assets/254562/20683683/ec030354-b57a-11e6-98bc-c8da75721e78.png
