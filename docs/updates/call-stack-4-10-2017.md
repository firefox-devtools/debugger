

### Call Stack Updates

We're currently working on improving the call stack in several major ways.

* :diamond_shape_with_a_dot_inside: Highlighting libraries
* :spaghetti: Collapsing Libarary frames
* :envelope: Simplifying Function Names
* :baby: Naming Library frames
* :black_medium_small_square: Blackboxing libraries

#### Highlighting libraries

We're going to start highlighting library frames in the call stack. We'll do this by replacing the file URL and line location with the library name and logo.

This will help users differentiate between application and library frames.

![](https://cloud.githubusercontent.com/assets/2481105/24832090/043aef7e-1c76-11e7-8914-20367328eae0.png)

#### Collapsing Libarary frames

We're going to experiment with collapsing library frames by default. This will shrink framework call stacks dramatically and reduce a lot of the visual noise.

![](https://cloud.githubusercontent.com/assets/2481105/24832090/043aef7e-1c76-11e7-8914-20367328eae0.png)


#### Simplifying Anonymous Function Names

The call stack currently gives verbose function names to anonymous functions in the call stack.
In practice, the function `success` could be named `app.AppView<.success`.

It's important to be able to scan the call stack. So in this context, it's helpful to see the simplest name possible.


![](https://cloud.githubusercontent.com/assets/254562/24863450/e1b3400a-1dce-11e7-9ed2-b55a2db95e03.png)

#### Naming Library frames

One of the benefits of collapsing the library frames is that it gives an opportunity to
describe what the library is doing. For example, instead of showing two frames for jQuery [`elemData.handle`, `event.dispatch`], we can simply show `event`.

Describing the libary functions will help make it clear when a framework is rendering, routing, or doing any other task.

![](https://cloud.githubusercontent.com/assets/254562/24863285/38f713f6-1dce-11e7-8a7c-849160559f4a.png)

#### Blackboxing libraries

Sometimes you want to ignore a library completely. When this is the case you'll be able to blackbox the library and will not show up in the call stack.

![](https://cloud.githubusercontent.com/assets/254562/24637275/db4d4394-18ad-11e7-9c60-9c62209c3e4e.png)
