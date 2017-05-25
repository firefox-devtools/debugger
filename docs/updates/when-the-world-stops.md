### When the world stops


One of the most interesting questions is what happens when the debugger stops? Basically, what happens when the world pauses?

Here is a quick run-through that will help give you some context so that you can dig in and answer your own questions.

There are three characters in the story: the client, server, and engine.
When the page pauses, the engine pauses the page, tells the server,
and the server tells the client.

This post is going to focus on the work the server does when the page pauses. The code included has been simplified a bit to remove some of the incidental complexity.

---

The [server][script.js] has several page lifecycle hooks that are called when
something happens. `onDebuggerStatement` is one of these hooks!

```js
onDebuggerStatement: function (frame) {
  return this._pauseAndRespond(frame, { type: "debuggerStatement" });
}
```

The [server][script.js]'s main job is to tell the client that the page is paused.
You can see below, that the `_paused` function is building a `packet`, this packet
has all of the data the client needs to inform the programmer about the pause state.
The `_paused` function also does one other interesting thing here as well. When the function is triggered, it registers all of the relevant actors in the story and adds them to various "actor pools".
The server registers all of the actors so that if the client has any follow up questions,
the server will know who to follow up with.

The server is like a detective, it wants to know who all the major witnesses are!


```js
_paused: function (frame) {
  this._state = "paused";


  this._pausePool = new ActorPool(this.conn);
  this.conn.addActorPool(this._pausePool);

  // Give children of the pause pool a quick link back to the
  // thread...
  this._pausePool.threadActor = this;
  this._pauseActor = new PauseActor(this._pausePool);
  this._pausePool.addActor(this._pauseActor);

  // Update the list of frames.
  let poppedFrames = this._updateFrames();

  // Send off the paused packet and spin an event loop.
  let packet = { from: this.actorID,
                 type: "paused",
                 actor: this._pauseActor.actorID };
  if (frame) {
    packet.frame = this._createFrameActor(frame).form();
  }

  if (poppedFrames) {
    packet.poppedFrames = poppedFrames;
  }

  return packet;
}
```

Lets continue digging into how the server builds the pause packet for the client.
We already know quite a bit already. We know the `type` is "paused", it has a `from` and an `actor` field which is used as a return address :). We also know that there are two types of frame fields: `frame` and `poppedFrames`. Lets focus on the `frame` field because it is simpler.

We get the `frame` packet data by asking for the frame actor's `form`.
The form function is defined in the Frame actor [class][frame.js].
Lets slow down and take a look at the data the frame actor puts in its form.
It's fascinating!

It starts with the `actor` and `type` field for record keeping. It then sets up `callee`, `environment`, `arguments`, `where`, and `oldest` fields. Oldest, what's that? :) It's neat to think of a frame as potentially a function frame, at which point we care about the callee and arguments data.
That's cool, but where's the good stuff? Where are the variables and scope data kept? All of that is kept in an environment actor and fetched through a similar `form` function. Lets keep on digging!

```js
form: function () {
  let threadActor = this.threadActor;
  let form = { actor: this.actorID,
               type: this.frame.type };

  if (this.frame.type === "call") {
    form.callee = createValueGrip(this.frame.callee);
  }

  if (this.frame.environment) {
    form.environment = threadActor.createEnvironmentActor(this.frame.environment).form()
  }

  form.arguments = this._args();

  let location = this.threadActor.sources.getFrameLocation(this.frame);
  form.where = {
    source: location.generatedSourceActor.form(),
    line: location.generatedLine,
    column: location.generatedColumn
  };

  if (!this.frame.older) {
    form.oldest = true;
  }

  return form;
}
```

Alright, we've arrived at a frame environment and we're asking it for its form.
Environment is just a fancy word for a scope, so all that's happening is the frame is saying, "yo scope, whatcha got for me"? Our main goal here is to see where the variables are documented.
So lets walk through what it's doing. First the environment notes its type. Then it does some sneaky recursion to inquire into its parent scope's data. Let's not get nerd sniped! Then it gets object and function data, remember we could be in a function or object scope, right?!?!
Then we get bindings... Bindings are exactly what we want here. A good way to think of bindings are: variables are bound to scopes in JS, ergo variables are in the bindings thing! Lets go a bit deeper!

```js
form: function () {
  let form = { actor: this.actorID };

  // What is this environment's type?
  if (this.obj.type == "declarative") {
    form.type = this.obj.callee ? "function" : "block";
  } else {
    form.type = this.obj.type;
  }

  // Does this environment have a parent?
  if (this.obj.parent) {
    form.parent = this.threadActor.createEnvironmentActor(this.obj.parent).form();
  }

  // Does this environment reflect the properties of an object as variables?
  if (this.obj.type == "object" || this.obj.type == "with") {
    form.object = createValueGrip(this.obj.object);
  }

  // Is this the environment created for a function call?
  if (this.obj.callee) {
    form.function = createValueGrip(this.obj.callee);
  }

  // Shall we list this environment's bindings?
  if (this.obj.type == "declarative") {
    form.bindings = this.bindings();
  }

  return form;
}
```

We've landed in the Environment's bindings function and it's glorious. We're
finally looking for variables, and not just variables but Arguments as well. It
doesn't get much better than this! I think the coolest thing about this code is
we've reached a local floor for the server where we can go no deeper.
At the very bottom of this descent, script, frame, environment (scope), bindings,
we have a call for the variable `getVariable(name)`. This is a [call][var] that makes the leap back into the engine and out of the server!

```js
bindings: function () {
  let bindings = { arguments: [], variables: {} };

  const parameterNames = this.obj.callee ? this.obj.callee.parameterNames : [];

  for (let name of parameterNames) {
    let arg = {};
    let value = this.obj.getVariable(name);

    let desc = {
      value: value,
      configurable: false,
      enumerable: true
    };

    let descForm = {
      enumerable: true,
      configurable: desc.configurable
    };
    descForm.value = createValueGrip(desc.value);
    arg[name] = descForm;
    bindings.arguments.push(arg);
  }

  for (let name of this.obj.names()) {
    let value = this.obj.getVariable(name);

    let desc = {
      value: value,
      configurable: false,
      enumerable: true
    };

    let descForm = {
      enumerable: true,
      configurable: desc.configurable
    };

    descForm.value = createValueGrip(desc.value);
    bindings.variables[name] = descForm;
  }

  return bindings;
}
```

---

We have gone as deep as we care to for the time being. We started at a humble lifecycle hook `onDebuggerStatement` and ended with a call for variable data in a scope. I hope you enjoyed this story and are curious to do your own digging. We're always available in [slack] and would love to hear from you.


[Debugger.cpp]:https://github.com/mozilla/gecko-dev/blob/master/js/src/vm/Debugger.cpp
[script.js]:https://github.com/mozilla/gecko-dev/blob/master/devtools/server/actors/script.js
[frame.js]:https://github.com/mozilla/gecko-dev/blob/master/devtools/server/actors/frame.js
[environment.js]:https://github.com/mozilla/gecko-dev/blob/master/devtools/server/actors/environment.js
[var]:http://searchfox.org/mozilla-central/source/js/src/vm/Debugger.cpp#11528
[slack]:https://devtools-html.slack.com
