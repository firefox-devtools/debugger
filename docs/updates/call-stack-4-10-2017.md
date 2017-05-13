
### The Evolution of the Call Stack

Call Stacks are one of the most important tools in the debugger. They help answer the questions:

1. how did we get here?
2. what happened over there?

Unfortunately, call stacks have become increasingly confusing over time to the point
that they have become a feature that only the most advanced users take advantage of.

We have five features that will make the Call Stack a lot more usable:

* :diamond_shape_with_a_dot_inside: Highlighting libraries
* :envelope: Simplifying Function Names
* :spaghetti: Collapsing Library frames
* :baby: Naming Library frames
* :black_medium_small_square: Blackboxing libraries

![evolution]

Lets look at each feature in depth and see how we can improve a pretty simple Backbone call stack.

![original]

#### :diamond_shape_with_a_dot_inside: Highlighting libraries

We're going to start highlighting library frames in the call stack. We'll do this by replacing the file URL and line location with the library name and logo.

This will help users differentiate between application and library frames.

![highlight]

#### :envelope: Simplifying Anonymous Function Names

The call stack currently gives verbose function names to anonymous functions in the call stack.
In practice, the function `success` could be named `app.AppView<.success`.

It's important to be able to scan the call stack. So in this context, it's helpful to see the simplest name possible.


![simplify]

#### :spaghetti: Collapsing Library frames

We're going to experiment with collapsing library frames by default. This will shrink framework call stacks dramatically and reduce a lot of the visual noise.

![collapse]


#### :baby: Naming Library frames

One of the benefits of collapsing the library frames is that it gives an opportunity to
describe what the library is doing. For example, instead of showing two frames for jQuery \[`elemData.handle`, `event.dispatch`], we can simply show `event`.

Describing the libary functions will help make it clear when a framework is rendering, routing, or doing any other task.

![naming]

#### :black_medium_small_square: Blackboxing libraries

Sometimes you want to ignore a library completely. When this is the case you'll can blackbox the library and it will not show up in the call stack. We've always had this feature, but today it is more discoverable.

![blackbox]


#### React Case Study

We wanted to see what the new Call Stack would look like in a real world React application
so we took a look at the Debugger while it was rendering the Call Stack.

![inception]

When you compare what the call stack that you see when you're paused in a render cycle,
the difference is striking. Here is what the call stack looked like before and after the change.

![react]

#### Conclusion

We're really excited about how the new call stack will help users think about their applications in the future. This is just the beginning, we hope to introduce more framework improvements in the near future!

[inception]: https://cloud.githubusercontent.com/assets/254562/25029800/ab35cea4-208e-11e7-8ba2-71ba8b8c240c.jpg
[react]: https://cloud.githubusercontent.com/assets/254562/25029620/14e2205c-208d-11e7-8177-cc5baeb8d53c.jpg
[blackbox]: https://cloud.githubusercontent.com/assets/254562/25029619/14e1ffc8-208d-11e7-8393-fd08ebe00847.jpg
[collapse]: https://cloud.githubusercontent.com/assets/254562/25029623/14eb47a4-208d-11e7-9b74-1f41de0aeb5f.jpg
[simplify]: https://cloud.githubusercontent.com/assets/254562/25029624/14ee346e-208d-11e7-89ec-cd0385f3d69f.jpg
[highlight]: https://cloud.githubusercontent.com/assets/254562/25029622/14ea24fa-208d-11e7-9c12-824879f64bb5.jpg

[naming]: https://cloud.githubusercontent.com/assets/254562/25029999/ff7e7fd2-208f-11e7-925d-66449a19c213.jpg

[original]: https://cloud.githubusercontent.com/assets/254562/24866189/69ce5d32-1dd7-11e7-8252-c3e33f2b7d15.jpg
[evolution]: https://cloud.githubusercontent.com/assets/254562/24866748/19d640fe-1dd9-11e7-86d9-b30c8cec7b7e.jpg
