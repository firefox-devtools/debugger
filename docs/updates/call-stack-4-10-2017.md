
### The Evolution of the Call Stack

Call Stacks are one of the most important tools in the debugger. They help answer the questions:

1. how did we get here?
2. what happened over there?

Unfortunately, call stacks have become increasingly confusing over time to the point
that they have become a feature that only the most advanced users take advantage of.

We have five features that will make the Call Stack a lot more usable:

* :diamond_shape_with_a_dot_inside: Highlighting libraries
* :envelope: Simplifying Function Names
* :spaghetti: Collapsing Libarary frames
* :baby: Naming Library frames
* :black_medium_small_square: Blackboxing libraries


#### Highlighting libraries

We're going to start highlighting library frames in the call stack. We'll do this by replacing the file URL and line location with the library name and logo.

This will help users differentiate between application and library frames.

![highlighting]

#### Simplifying Anonymous Function Names

The call stack currently gives verbose function names to anonymous functions in the call stack.
In practice, the function `success` could be named `app.AppView<.success`.

It's important to be able to scan the call stack. So in this context, it's helpful to see the simplest name possible.


![simplifying]

#### Collapsing Libarary frames

We're going to experiment with collapsing library frames by default. This will shrink framework call stacks dramatically and reduce a lot of the visual noise.

![collapsing]


#### Naming Library frames

One of the benefits of collapsing the library frames is that it gives an opportunity to
describe what the library is doing. For example, instead of showing two frames for jQuery [`elemData.handle`, `event.dispatch`], we can simply show `event`.

Describing the libary functions will help make it clear when a framework is rendering, routing, or doing any other task.

![naming]

#### Blackboxing libraries

Sometimes you want to ignore a library completely. When this is the case you'll can blackbox the library and it will not show up in the call stack. We've always had this feature, but today it is more discoverable.

![blackboxing]

### Conclusion

We're really excited about how these features will help users think about their applications in the future. This is also just the beginning, we hope to introduce more visualization improvements in the near future!

Here's a summarized evolution of the call stack.

![evolution]



[blackboxing]: https://cloud.githubusercontent.com/assets/254562/24866183/69b74f70-1dd7-11e7-83bf-373333699539.jpg
[naming]: https://cloud.githubusercontent.com/assets/254562/24866184/69c74b50-1dd7-11e7-94d7-371c5e00a526.jpg
[collapse]: https://cloud.githubusercontent.com/assets/254562/24866185/69c7ba40-1dd7-11e7-940d-9bf0f4f02046.jpg
[simplify]: https://cloud.githubusercontent.com/assets/254562/24866186/69c7dd4a-1dd7-11e7-907c-fcbafa2319b4.jpg
[highlight]: https://cloud.githubusercontent.com/assets/254562/24866188/69ce3848-1dd7-11e7-8c27-c4e1d0e0da9e.jpg
[original]: https://cloud.githubusercontent.com/assets/254562/24866189/69ce5d32-1dd7-11e7-8252-c3e33f2b7d15.jpg
[evolution]: https://cloud.githubusercontent.com/assets/254562/24866748/19d640fe-1dd9-11e7-86d9-b30c8cec7b7e.jpg
