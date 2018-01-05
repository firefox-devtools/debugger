# Performance

## Tools
Performance is tricky, there is just so much data that needs to be considered in order to
determine a performance issue. To add to this, small processes that a computer is running can throw
off performance metrics and put you on the wrong track. This can be very frustrating! It is
important to treat performance work as setting up an experiment that is repeatable, this way one can
minimize the noise and better understand what is happening!

### Perf.html

Perf.html is a firefox devtools project that makes it easy to record and share profiles. It is one
of the most useful tools we have available to us when investigating performance issues.

Steps to get setup

1. go to [perf-html.io](https://perf-html.io/)
2. install the addon
3. close all tabs, but the one you want to measure
4. click the addon button in the top right and set interval to `1ms`, buffer to `630mb`, and threads to `GeckoMain,Worker`
5. start the recording
6. Do something
7. click capture recording

#### How to read Perf.html output

* determine which thread the debugger is running in
![]()

* filter the output in the dropdown to "js only"
![]()

* try inverting the callstack to see if something is really taking time
![]()

* add performance markers to your code (using performance.mark()), they will show up in the top and also in the marker table
![](https://shipusercontent.com/5296bfc98dea6acf9d222fa53fef4aea/Screen%20Shot%202017-11-16%20at%207.27.33%20PM.png)

Hints:

* you can share profiles by clicking the green share button in the perf app
* you can profile the debugger in the firefox panel
* you can hide processes in the app by right clicking in the top left and excluding some

![](https://shipusercontent.com/5296bfc98dea6acf9d222fa53fef4aea/Screen%20Shot%202017-11-16%20at%207.27.33%20PM.png)

![](https://shipusercontent.com/4e014fccaaea54e07ef451ce07fd3ce7/Screen%20Shot%202017-11-16%20at%207.44.26%20PM.png)

![](https://shipusercontent.com/317a8f83342728fa3cc9bb98406bbeb4/Screen%20Shot%202017-11-16%20at%207.50.17%20PM.png)

### Talos

Talos is the Firefox performance benchmarking tool. You can find more information on the [Talos
wiki](link). Talos is very similar to mochi tests, it runs an "end to end" (e2e) test which means
that it tests from the perspective of a user -- creating a firefox browser instance, opening the
panel, waiting for certain conditions, and then closing it again.

The devtools test suite in talos is called "DAMP" (devtools at maximum performance), and you can
find the test definitions inside of Mozilla-Central under
`testing/talos/talos/tests/devtools/addon/content/damp.js`. These are the tests for all of the
devtools tools, not just the debugger! The debugger has custom steps, but it also shares code
with the rest of the dev tools. We have a mirror of this file in `src/test/talos/damp`.

On the debugger we also have "experiments" -- these tests are not added to MC, instead they are for
us to use whenever we need to investigate a performance regression in a programmatic way.

Test results are depending on how the tests were run, inside of an `output` directory -- either
`talos_output` or `perf_output`. Tests are saved in directories that have the current branch name,
the list of tests run, and the results

#### Basic commands

If you have firefox built inside of your debugger directory, you can use yarn to run talos tests.

* `yarn talos` - run the DAMP tests.
* `yarn talos:subtest <name of test>` - run the DAMP test specific to a regex. (any flags that
  work with talos will work with `yarn talos`)
* `yarn talos:debugger` - run the DAMP tests specific *only* to the debugger.

For running experiments, a few other things are enabled. First of all, by default the experiments
are run only once and with a perf.html output, which is saved with the current time and a list of
the tests that were run.

* `yarn talos:experiment` - run the tests in the `test/talos/experiments` folder.

flags:
* `--cycles <number>` - run the tests in the `test/talos/experiments` folder WITHOUT
  perf.html, but with a given number of reruns, outputing the average and saving it with the
  timestamp and tests run.
* `--subtest <name of test>` - run a specific test from the experiments
  folder.

#### How to read Talos output

Talos output gives you the run times for each test, in the form of a json file. You can open the
file in your favorite json viewer (firefox has some extensions for this) and take a look at the
results for the test.

The most interesting number will be the average for each test. This is the number that you can
compare to other talos runs of other branches.

#### General Tests (DAMP)

You can further specify a subtest using `yarn talos:debugger --subtest <name of test>`.
The subtest flag (as well as any other flags) works the same way as described in the talos wiki.

All of the devtools are run against the following sites:

* simple.html - a simple web page without much javascript or css
* complicated - a clone of the webpage "das spiegal" loading a lot of assets and code

the debugger has a custom page found in the `custom` subdirectory:

* it consists of an application that is branched from "Create React App" but stripped down for our
  purposes
* to update this file you can clone the repo found
  [here](https://www.github.com/codehag/debugger-talos-example) and follow the instructions in the
  readme.

There are three steps that all devtools run through:
* opening the panel
* reloading the panel
* closing the panel

The debugger has a couple of extra steps:
* opening a file
* pausing and stepping through a few functions

#### Custom Tests (experiments)

Talos is a really powerful tool, you can run tests as many times as you like, and get the average
speed. this reduces the likelyhood that a performance regression is "just a fluke" and makes it
easier and more efficient to test performance fixes. However the DAMP tests are too general for
everyday use. We also do not want to over burden talos tests, since they need to be maintained
We can leverage the talos framework and get it to do what we want however, without adding overhead
by using custom tests to run experiments on specific behavior.

These tests can be written in the same way as a mochitest. In fact, you can even copy paste
mochitests into the experiments folder and run them!

#### Using Talos and Perf.html together!

Experiment tests by default combine talos and perf, but they by default only run once. Damp tests do not
run with the perf.html by default, but you can run them, and for multiple cycles. If you want to
run perf on multiple cycles (for example to track down an intermittent slowdown) you can add the
`--perf-record` flag, or using regular talos flags.

### Road Runner

The Road runner is a special tool that runs talos tests against multiple branches, and outputs a
graph showing how the performance changed between branches given a set of tests. Road runner can be
used to run either DAMP tests or experiment tests

#### Usage

make sure roadrunner is installed globally with `npm install rrunner -g`

to run DAMP tests: `yarn rrun:damp <commit list or branch name list>`
to run experiment tests: `yarn rrun:experiments <commit list or branch name list>`
to read a set of DAMP tests: `yarn rrun:damp --read <commit list or branch name list>`
to read a set of experiment tests: `yarn rrun:experiments --read <commit list or branch name list>`

rrunner can be used with any flags that you might use with yarn talos

results will be saved into a `rrun_output` directory


#### How to read roadRunner output

There are a number of graphs for road runner, the first on you will see is a composite graph, with
the tests on the x axis, and the times of each test on the y axis. the different branches are each
given a colour.

The following graphs break down the performance changes per test, with the branches on the x axis,
and the timing of the average test on the y axis. hovering the branch hash in this view will give a
summary of all the test values in a pop up.

### Chrome Performance

Sometimes, we need a bit more information regarding the performance of an application. The chrome
devtools team has put a lot of work into their tools as well, and we often use these when we need
more information about specific things, like markers. This can be used as a complement to perf.html.
Since the debugger will work in chrome, you can use chrome devtools to debug it.

Steps to get setup:

1. Open the launchpad in Chrome
2. Open devtools and go to Performance
3. Start a recording
4. Do something in the debugger
5. Stop the recording

![](https://shipusercontent.com/50ebe20248b6dd67ff85ebd1b8606057/Screen%20Shot%202017-11-16%20at%207.22.09%20PM.png)

## Performance Debugging

Looking into performance regressions is similar to investigating bugs, it's best to
start broad with few assumptions.

Questions to ask:

1. what are the steps to reproduce the regression?
2. is the issue with the client or the server?
3. is the issue a rendering issue or a data updating?

The easiest way to see what is going on at a high level is to look at the Debugger's
Redux and React user timings. The timings will show redux action dispatches
and component lifecycle events over time. It's amazing!

Lets look at a couple scenarios and steps to build a mental model:

#### Loading

When reloading the page, the debugger loads the sources and then tries to parse them.

- *Why does the debugger load a source?* the debugger will show the selected source
- *Why does it try to parse the source?* the debugger wants to show which lines are empty, let the user search for functions...

At this point, you can begin playing with some of the assumptions. For instance, what would happen if the
debugger did not immediately parse the source? What would need to change? Often, there is an easy solution
here that involves re-arranging the order of operations or adjusting a business rule.

#### Pausing

When pausing, the debugger loads a source and spends a lot of time updating codemirror!

- *Which Editor components are taking time?*
- *Are some components being rendered multiple times?*

At this point, it should be possible to narrow the problem down to a specific component that is either updating aggressively or spending time in a particular function.

### Optimizations

After you understand the performance regression and determined that it's impossible to avoid,
it makes sense to look for optimizations. The Perf.html tool is incredibly helpful here.

The first thing to look for, is what functions in aggregate are taking the most time.
Once you have a recording, you can go to the call tree, invert the call stack, and look for expensive functions.
Hint, as you hover over the functions you'll see where they're called in the timeline and if they're called multiple times or take a long time to complete.

Another thing to look for is what expensive things the platform is doing e.g (garbage collection, paints).
The best way to find these issues is to go the stack chart by looking at the leaves of the tree over time.

