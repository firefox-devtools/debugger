# Table of Contents
1. [Architecture](#architecture)
2. [Components](#components)
3. [Component Data](#component-data)
4. [Reducers](#reducers)
5. [Actions](#actions)



debugger.html
=============

Debugger.html is an open source project that is built on top of React and Redux that functions as a standalone debugger for Firefox, Chrome and Node. This project is being created to provide a debugger that is stand-alone and does not require a specific browser tool to do debugging.

This document gives a detailed view of the components, actions and reducers that make up the debugger.html project. Prior knowledge of React and Redux  is suggested.

React documentation can be found [here](https://facebook.github.io/react/docs/getting-started.html).
Redux documentation can be found [here](http://redux.js.org/).

As with most documentation related to code, this document may be out of date. The last edit date occurred on August 30, 2016. If you find issues in the documentation please file an issue as described in the [contributing](https://github.com/devtools-html/debugger.html/blob/master/CONTRIBUTING.md#writing-documentation-book) guide.

# Architecture


Debugger.html is a React-Redux based application — the UI is constructed using React Components. the follow illustration provides a simplistic high level view:

![](https://docs.google.com/drawings/d/1JTDI-62CG29M37rpTGIDh70rOTuCmJf1VqxCKPe9zxM/pub?w=960&h=720)
[Click here to Edit](https://docs.google.com/drawings/d/1JTDI-62CG29M37rpTGIDh70rOTuCmJf1VqxCKPe9zxM/edit?usp=sharing)

Application-critical objects are stored in one
global state object (housed in a Redux store) that some components have
access to. Many components are not aware of this state but are passed in
values to render using React properties.

In the Debugger.html project we
also often use React’s setState to manage component local state. For
example, storing the state of a tree in the sources view or using it in
the App component to remember if the file search box is being displayed
(cmd-&gt;p).

When a user
manipulates the UI, Redux Actions are fired to collect payload
data, which affects the state of the application for the given
operation. Actions set a specific type of operation for the store and
dispatch the event.

Reducers handle all actions and decide the new
application state based on the action type. You can think of a reducer
as a set of functions that take a specific action type and the current
state of the app as parameters and returns the new state of the
application.

The Store is a JavaScript object that contains and manages
the state of the application. After the Reducers create a new version
of the state, the store will fire a re-rendering of all the
components. Note that a new state is created every time — the old state
is not modified.

React uses a Virtual DOM; only required changes to the
actual DOM will be rendered.

# Components


debbuger.html uses React [Components](https://github.com/devtools-html/debugger.html/tree/master/src/components) to render portions of the
application. Each component’s source code is located under the
src/components folder. In this section we will cover how the
presentation pieces fit together; later we will discuss
how debugger.html uses Redux to wire up data to each of the components.

The top-level component is the App component; it encapsulates all
other components. Presented below is an overview of the component
architectural relationships:


![](https://docs.google.com/drawings/d/1cIa-Cf2pPi3vCKvsCrUSfC1_1LG3XDH7GpNKmWIIKWY/pub?w=960&h=720)
[Click here to Edit](https://docs.google.com/drawings/d/1cIa-Cf2pPi3vCKvsCrUSfC1_1LG3XDH7GpNKmWIIKWY/edit)


The App component uses two SplitBox components to separate the
presentation of the app into three different sections. Two Draggable
components are used to allow each of the sections to be expanded or
collapsed.

![](https://docs.google.com/drawings/d/1lAEyyci8SQZzh4Dk-EowX0wGnvyOISGO3sqdtzgQqoo/pub?w=960&h=720)
[Click here to Edit](https://docs.google.com/drawings/d/1lAEyyci8SQZzh4Dk-EowX0wGnvyOISGO3sqdtzgQqoo/edit?usp=sharing)
## Source tree view

The left-most section of the application displays the source tree for
the application being debugged. Three components are used to manage
the display of this data:

* The Sources component is
aware of the Redux state and the other components are not — it passes required properties to be rendered down to the other
two.

* The SourcesTree component is primarily responsible for rendering
the tree with a set of files/folders that are passed in as a property.

* The ManagedTree component uses React local State to track which nodes
have been expanded or collapsed and which node or leaf on the tree has
focus.

The Sources component encapsulates SourcesTree and
SourcesTree encapsulates ManagedTree.

![](https://docs.google.com/drawings/d/1dOCy4BePfX77ky3yUTlZRnAeeFIIi4UAJcYaYmYvUcY/pub?w=960&h=720)
[Click here to Edit](https://docs.google.com/drawings/d/1dOCy4BePfX77ky3yUTlZRnAeeFIIi4UAJcYaYmYvUcY/edit?usp=sharing)

## Source editor/file search

The center portion of the application displays either the source editor or a file search entry box. If the editor is displayed rendering is handled by three main components and one dynamic component.

* At the top of the editor is the SourceTabs component, which is responsible for rendering tabs for every open file and highlighting the tab of the file currently open.

* The Editor component is responsible for rendering the text, gutters and breakpoints for the currently selected file.  Debugger.html uses the CodeMirror npm package to do the actual rendering. The Editor component manages calls to CodeMirror.

* Any time a breakpoint is set, the Editor creates a dynamic component called Breakpoint. The Breakpoint component is contained in the EditorBreakpoint.js file. The BreakPoint component also makes calls to CodeMirror for actual rendering of the breakpoint within the editor.

* The last component on the page is the SourceFooter component. This component renders buttons for blackboxing and prettify source functions.

![](https://docs.google.com/drawings/d/1PC63VABa0x-W3hACi7ASXgawQeowbAvA_aqN_Z1wpRI/pub?w=960&h=720)
[Click here to Edit](https://docs.google.com/drawings/d/1PC63VABa0x-W3hACi7ASXgawQeowbAvA_aqN_Z1wpRI/edit?usp=sharing)

At any time a user can search the sources for a specific string by
pressing cmd-&gt;p. This will replace all of the components in the
center section with a search box. The search box is rendered using the
Autocomplete component.

![](images/search.png)

## Tools view

The farthest right section of the application is handled by many components. At the top of the component architecture is the RightSidebar component, which renders the play/pause command bar and encapsulates the Accordion component, responsible for formatting and rendering the layout including the arrow icons and headers. This component encapsulates the Breakpoints, Frames, and Scopes component:

* The Breakpoints component renders a list of all existing breakpoints.

* The Frames component is responsible for rendering the current call stack when a breakpoint is reached.

* The Scopes component is responsible for rendering the current variable scopes for the given breakpoint. It uses the ObjectInspector component to render the tree for all scopes and variables. The state of which nodes are collapsed/expanded are maintained using a ManagedTree component, in similar fashion to the SourcesTree component.

![](https://docs.google.com/drawings/d/1zHogPebNmOFT9Xx6cZsaA6R6cTQLUzBXePV9sf62chA/pub?w=960&h=720)
[Click here to Edit](https://docs.google.com/drawings/d/1zHogPebNmOFT9Xx6cZsaA6R6cTQLUzBXePV9sf62chA/edit?usp=sharing)

# Component Data

Some components in Debugger.html are aware of the Redux store; others are
not and are just rendering passed in properties. The Redux-aware
components are connected to the Redux store using the <code>connect()</code> method, as illustrated by the following code:

```javascript
const React = require("react");
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
.
.
const actions = require("../actions");
.
.
.

module.exports = connect(
 state => ({
  pauseInfo: getPause(state),
  expressions: getExpressions(state)
 }),
 dispatch => bindActionCreators(actions, dispatch)
)(Expressions);
```

This example shows the Expressions component, which should be aware of
the Redux state. We are using Redux’s <code>connect()</code> method to connect to the
Redux store. This example is pulling in <code>pauseInfo</code> and <code>Expressions</code> from
the Redux state. Finally, all of the actions in the actions folder are
combined and the contained <code>actionCreators</code> in each of the files are setup
so the actions can be called directly from the component.

# Reducers


The [Reducers](https://github.com/devtools-html/debugger.html/tree/master/src/reducers) are all located in the src/reducers folder and are
all combined using Redux’s <code>combineReducers()</code> function. This function is
executed in main.js as follows:

```javascript
const reducers = require("./reducers");

.

.

const store = createStore(combineReducers(reducers));
```

All of the reducers are combined using the index.js file in the
reducers folder. In the Debbuger.html project, each reducer has an
<code>update()</code> function to handle actions for its slice of state.

## Async-requests

The **async-requests** reducer creates an array that stores a unique
sequence number for every promise being executed from an action.
It removes the sequence number from the array when a specific promise
resolves or rejects. The following image shows a snapshot of the
debugger.html state with an active promise.

![](images/asynchreducer.png)

## Breakpoints

The **breakpoints reducer** is responsible for handling breakpoint
state. It adds an Immutable Map of breakpoint objects and a Boolean
value for whether breakpoints are disabled to the application state.

![](images/breakpoints1.png)

Each breakpoint object in the map contains information like the
location, the actual source file, whether the breakpoint is disabled,
a unique id, and the text for the breakpoint. The following is an example
of what the breakpoints state looks like for a selected breakpoint:

![](images/breakpoints2.png)

The breakpoints reducer handles several action types. The actions
handled by this reducer are all fired wrapped in a promise. The status
of the promise can be checked in the action object using code similar to
the following:

```javascript
if (action.status === "start") {
```

Valid values are <code>start</code>, <code>done</code> and <code>error</code>.

The following action types are handled:

-   <code>ADD\_BREAKPOINT</code> - This command adds breakpoints to the state as
    shown in the image above. While the promise is being fulfilled the
    loading attribute is set to <code>true</code> and a basic breakpoint object
    is created. If the promise is completed, the location is updated
    and the loading attribute is set to <code>false</code>. If the promise fails, the
    breakpoint is deleted from the state.

-   <code>TOGGLE\_BREAKPOINTS</code> - Sets the value of the <code>breakpointsDisabled</code>
    attribute and is used to disable or enable all breakpoints.

-   <code>SET\_BREAKPOINT\_CONDITION</code> - This action sets the condition
    attribute for a specific breakpoint. This functionality is currently not implemented in the UI.

-   <code>REMOVE\_BREAKPOINT</code> - This action actually handles disabling or
    removing a breakpoint. If the breakpoint is being disabled the
    disabled attribute of the breakpoint is set to <code>false</code>. If
    the breakpoint is removed it is deleted from the breakpoints state.


The breakpoints reducer additionally supplies functions to
retrieve information from the breakpoints state. For example the
<code>getBreakpointsForSource()</code> function returns all breakpoints for a given
source file. The editor component uses this to retrieve all the
breakpoints for the currently opened file.



## Events-listeners

The **events-listeners** reducer is responsible for managing the state
for the current list of DOM events that currently have listeners bound
in the web application being debugged. This reducer also stores the
current listeners selected for the debugger to break on. Additionally
this reducer manages state that keeps track of when the event listeners
are being fetched with the <code>fetchingListeners</code> flag.

\*\*As of this moment the UI for this feature is not implemented. I also
did not see gThreadClient created.

![](images/eventlisteners.png)

## Pause

The **pause** reducer is responsible for managing state variables needed
to primarily handle pause and resume conditions in the debugger. These
pause conditions can occur because of a set breakpoint in code being
debugged, an exception, or an event listener being
debugged.

![](images/pause.png)

* The <code>pause</code> object stores information like why the debugger paused, the
current call stack frame, the current source location, and the current
variable scope.

* The <code>frames</code> object stores all the frames for the current
call stack.

* The <code>selectedFrame</code> object stores the call stack frame
currently selected in the Debugger.html UI.

* The loadedObjects object
stores the currently selected and expanded variable in the scopes pane.

\*\*The expressions object stores all of the current watch expressions,
which is not implemented in the UI yet.

The pause reducer handles the following action types:

-   <code>PAUSE</code> – Handles loading and updating the state for all the variables
    described above.

-   <code>RESUME</code> – Clears all state variables associated with a pause.

-   <code>BRAKE\_ON\_NEXT</code> – This action type is triggered when a user presses
    the pause button and informs the JavaScript engine to break on the
    next JavaScript statement. Until the engine actually breaks, a flag that tracks the status is stored in state.

-   <code>LOADED\_FRAMES</code> – This action type occurs when all the frames for the
    call stack have been retrieved. As stated above these are stored in
    the application state.

-   <code>SELECT\_FRAME</code> - This action type occurs when a user is selecting
    different frames of the call stack while the debugger is paused.

-   <code>LOAD\_OBJECT\_PROPERTIES</code> – This action type occurs when a user is
    expanding the variable tree under the scope pane. The currently
    expanded variable is then stored in state.

-   <code>PAUSE\_ON\_EXCEPTIONS</code> – This action type occurs when the settings
    (pause on exceptions and ignore caught exceptions) for the debugger
    are changed. These values are then stored in state.

-   <code>ADD\_EXPRESSION</code> – This action type occurs when a new watch
    expression has been added.

-   <code>EVALUATE\_EXPRESSION</code> – This action type is triggered when a watch
    expression is being evaluated.

-   <code>UPDATE\_EXPRESSION</code> – This action type is triggered when updating a
    watch expression.

-   <code>DELETE\_EXPRESSION</code> – This action type is triggered when a watch
    expression is deleted.

The pause reducer also has many getter functions to retrieve portions of
state that are stored by this reducer.


## Sources

The **sources** reducer is responsible for maintaining state variables
that are used in the managing of opening and closing source files in the
debugger. The state variables for this reducer contain elements that
manage things like sources in the source tree, the currently open file, the
source text for all open files, source maps for source files, and open
tabs within the editor.

* The <code>sources</code> object contains an array of all the sources in the source
tree and is built when a project is loaded into the debugger. When the
prettify source button is selected a new source is added to the sources
object representing the new text prettified.

* The <code>selectedSource</code> object
contains information on the currently opened file in the editor and is
altered when new files are opened or tabs are switched.

* The <code>sourcesText</code>
state variable is an array of objects where each object contains the
source text for an open file in the debugger.

* The <code>sourceMaps</code> object is
similar to sourcesText but it contains the associated source map text.

* The <code>tabs</code> object manages how many tabs are opened and what file is
associated with each.

![](images/sources.png)

The sources reducer handles the following action types:

-   <code>ADD\_SOURCE</code> – This action type occurs when a project is loading and
    source files are being added to the source tree. Additionally
    prettify source will add additional files.

-   <code>ADD\_SOURCES</code> – This type is similar to ADD\_SOURCE but takes a map
    of source files. Currently this type is not used in the debugger.

-   <code>LOAD\_SOURCE\_MAP</code> – This action type occurs when a source map is
    loaded for a specific source file.

-   <code>SELECT\_SOURCE</code> – This action type is triggered when a file is opened
    or a different tab is selected in the debugger.

-   <code>SELECT\_SOURCE\_URL</code> – This action type is triggered when a URL
    designates the selected source file. Need more data on this one.

-   <code>CLOSE\_TAB</code> – This action type is triggered when a tab is closed in
    the debugger. The tab is cleared from state and the proper source
    is selected.

-   <code>LOAD\_SOURCE\_TEXT</code> – This event is triggered when the text of a file
    is being loaded. The event is wrapped in a promise so it will be
    called twice — once when it is started and once when it is complete.
    Once loaded the text is loaded in the <code>sourcesText</code> state object.

-   <code>BLACKBOX</code> – This event is triggered when black boxing is enabled and
    the button is selected for a given source. The black box status for
    each file is stored in the sources state object.

-   <code>TOGGLE\_PRETTY\_PRINT</code> – The event is triggered when a toggling of
    the prettify source button is selected. The reducer updates the
    <code>sourcesText</code> with the new text and updates the <code>isPrettyPrinted</code> flag
    in the sources state object.

The sources reducer also has many getter functions to retrieve portions
of state that are handled in this reducer.

## Tabs

The **tabs** reducer is used to track which connected application is
being debugged. When the main debugger is started every connected
application will be displayed. For example, all the open tabs in a
Firefox browser that are connected to the debugger will be shown.

![](images/maintab.png)

This reducer stores two objects in state:

* The <code>tabs</code> object stores an
array of connected applications.

* The <code>selectedTab</code> object stores the
current application that is being debugged.

![](images/tabs.png)

The tabs reducer handles the following action types:

-   <code>ADD\_TABS</code> – This action type is triggered for every connected
    application when the debugger is started.

-   <code>SELECT\_TAB</code> – This action type is triggered when a specific
    application is selected for debugging.

# Actions

The [actions](https://github.com/devtools-html/debugger.html/tree/master/src/actions) in debugger.html are all located in the
src/actions folder; there is an action file corresponding to
 each reducer, which is responsible for dispatching the
proper event when the application state needs to be modified. In this
section we will cover each action file. As stated earlier, many of the
actions defined in these files are <code>actionCreators</code> that are setup to use
in a component via the <code>bindActionsCreator()</code> Redux method.

## breakpoints

The **breakpoints** action file handles manipulating breakpoints in the
debugger

The breakpoints file exports the following functions:

-   <code>enableBreakpoint()</code> - This function dispatches the <code>ADD\_BREAKPOINT</code>
    action and is called from the breakpoints component when a user
    selects the checkbox next to a breakpoint listed in the Breakpoints
    category on the right bar. Breakpoints listed here are currently enabled or  previously
    enabled and now disabled, therefore this function is only called
    when re-enabling an existing breakpoint.

-   <code>addBreakpoint()</code> - This function dispatches the <code>ADD\_BREAKPOINT</code> action
    and is called from the Editor component when a user clicks on the
    left gutter next to the source text and no breakpoint is currently
    on this line.

-   <code>disableBreakpoint</code> - This function dispatches the <code>REMOVE\_BREAKPOINT</code>
    action and is called from the breakpoints component when clicking on
    the checkbox next to a breakpoint listed in the right bar under the
    Breakpoints category. Ultimately the breakpoint is not removed —
    the disabled flag is set for the specific breakpoint, which is
    handled in the breakpoints reducer.

-   <code>removeBreakpoint()</code> - This function dispatches the <code>REMOVE\_BREAKPOINT</code> action
    and is called from the editor component when a user clicks on an
    existing breakpoint from the left side gutter.

-   <code>toggleAllBreakpoints()</code> – This function dispatches the
    <code>TOGGLE\_BREAKPOINTS</code> action and is called from the RightSideBar
    component when the disable/enable all breakpoints button is clicked.
    This results in either <code>disableBreakpoint()</code> or <code>enableBreakpoint()</code> being
    called for every breakpoint currently active.

-   <code>setBreakpointCondition()</code> – Currently not implemented.

## event-listeners

The **event-listeners** action file handles retrieving a list of all the
DOM events that currently have listeners bound in the web application
being debugged. In addition, it handles selecting specific ones for the
debugger to break on.

The event-listeners file exports the following functions:

-   <code>updateEventBreakpoints()</code> – This function passes an array of DOM events that should cause the debugger to break to the connected client
    being debugged. Next it dispatches the
    <code>UPDATE\_EVENT\_BREAKPOINTS</code> action. The UI is not yet built
    for this.

-   <code>fetchEventListeners()</code> – This function retrieves a list of DOM events that
    currently have listeners bound for the application being debugged.
    Once retrieved the <code>fetchEventListeners()</code> function dispatches the
    <code>FETCH\_EVENT\_LISTENERS</code> action.

## pause

The **pause** action file handles all functions responsible for
pausing, resuming and manipulating the debugger by stepping through
code. The functions contained in this file handle several calls back and
forth with the connected client (Firefox, Chrome, Node). Most of the
client functions are defined in the
src/clients/specificclient/events.js and
src/clients/specificclient/commands.js files. The pause action
file exports the following functions:

-   <code>addExpression()</code> – Called from the
    Expressions component, this function dispatches the <code>ADD\_EXPRESSION</code> action.
    Expressions are passed and evaluated by the connected client.

-   <code>updateExpression()</code> - Called from the
    Expressions component, this function dispatches the <code>UPDATE\_EXPRESSION</code> action.
    . Expressions are passed and evaluated by the connected client.

-   <code>deleteExpression()</code> - Called from the
    Expressions component, this function dispatches the <code>DELETE\_EXPRESSION</code> action.
    . Expressions are passed and evaluated by the connected client.

-   <code>resumed()</code> – Called from the connected client, this function
     dispatches the <code>RESUME</code> action. This
    function is called anytime the connected client resumes execution
    after a pause. This includes using a step function to advance
    execution by one line.

-   <code>paused()</code> – Called from the connected client
    anytime the client pauses and dispatches a PAUSED action. Before
    dispatching the call stack frames, current frame, and reason
    for the pause are retrieved from the connected client. These values
    are all passed in the dispatched action.

-   <code>pauseOnExceptions()</code> – This function is called from the RightSideBar
    component and dispatches the <code>PAUSE\_ON\_EXCEPTIONS</code> action. Before
    doing this the connected client is called and passes two values to
    instruct the connected client to (pause/not pause) on exceptions and
    whether to ignore caught exceptions.

-   <code>command()</code> – This function is called indirectly by the
    RightSideBar component. This is a generic function that sends
    different commands to the connected client. After the command is
    executed the <code>COMMAND</code> action is dispatched. The client commands are
    defined in the src/clients/specificclient/commands.js file.

-   <code>stepIn()</code> – This function is called from the RightSideBar. This
    function calls the <code>command()</code> function to pass it
    to the connected client.

-   <code>stepOut()</code> - This function is called from the RightSideBar. This
    function calls the <code>command()</code> function to pass it
    to the connected client.

-   <code>stepOver()</code> - This function is called from the RightSideBar.
    This function calls the <code>command()</code> function to pass it to the connected client.

-   <code>resume()</code> – This function is called from the RightSideBar when the play
    button is pressed and the debugger is currently paused. This
    function calls the <code>command()</code> function to pass it
    to the connected client.

-   <code>breakOnNext()</code> – This function is called from the RightSideBar when the
    pause button is pressed and the debugger is currently not paused.
    This function calls the connected clients <code>breakOnNext()</code> function,
    which is defined in the
    src/clients/specificclient/commands.js file. After returning
    from the client call the <code>BREAK\_ON\_NEXT</code> action is dispatched.

-   <code>selectFrame()</code> – This function is called from the Frames component when
    a user selects a specific frame under the Call Stack UI. This
    function first calls <code>selectLocation()</code> function, which is defined in the
    sources action. This loads up the editor with text for the
    specific frame. The <code>SELECT\_FRAME</code> action is then dispatched.

-   <code>setPopupObjectProperties()</code> – This function is called from the
    <code>Popup</code> component, which then use this data to pass all the properties from
    the hovered variable as root nodes of the <code>ObjectInspector</code> component.
    The function dispatches the <code>SET\_POPUP\_OBJECT\_PROPERTIES</code> action.


## sources

The **sources** action is responsible for providing functions that
support opening files in the editor, managing the tabs within the
editor and supplying black box and pretty print functionality. The sources
action file exports the following functions:

-   <code>newSource()</code> – This function is called from the connected
    client as defined in src/clients/specificclient/events.js when
    a project is loaded. In addition <code>newSource()</code> is called whenever a
    source map is loaded to add it to the project. This function checks
    to see if a source map needs to be loaded and if so dispatches the
    <code>LOAD\_SOURCE\_MAP</code> action, then
    the <code>ADD\_SOURCE</code> action. Finally, if this source is to be displayed
    in the editor the <code>selectLocation()</code> function is called.

-   <code>selectLocation()</code> – This function is called any place in the
    UI where a specific source needs to be displayed in the editor. This
    can happen from the source tree, the tabs across the top of the
    editor, in the Call Stack panel, and when the Prettify Source button
    is pressed. These locations correspond to the <code>SourcesTree</code>,
    <code>SourceTabs</code>, <code>Breakpoints</code>, and <code>SourceFooter</code> components. The function
    first dispatches the <code>LOAD\_SOURCE\_TEXT</code> action, which is wrapped in
    a promise. The <code>SELECT\_SOURCE</code> action is then dispatched. This
    usually results in a <code>LOAD\_SOURCE\_TEXT</code> action firing first then the
    <code>SELECT\_SOURCE</code> followed by another <code>LOAD\_SOURCE\_TEXT</code> when the
    promise completes and the text is loaded.

-   <code>selectSourceURL()</code> – Currently this function is only exposed in the
    src/main.js file to external clients. The function first
    dispatches a <code>SELECT\_SOURCE</code> action and then dispatches the
    <code>SELECT\_SOURCE\_URL</code> action. As stated above the text is loaded with
    the <code>selectLocation()</code> function.

-   <code>closeTab()</code> – This function is called from the <code>SourceTabs()</code> component
    whenever a tab is closed. The function dispatches the
    <code>CLOSE\_TAB</code> action.

-   <code>blackbox()</code> – This function is called from the <code>SourceFooter</code> component
    whenever the blackBox button is pressed. The button acts as a toggle
    for the file currently open in the editor. The function dispatches the
    BLACKBOX action and calls the connected client to either enable or
    disable black boxing on a specific file.

-   <code>togglePrettyPrint()</code> - This function is called from the <code>SourceFooter</code>
    component whenever the Prettify Source button is pressed. This
    function first creates a new URL for the formatted text and then
    dispatches an <code>ADD\_SOURCE</code> action through an internal function, which
    adds the new file to the project. Next, the function dispatches a
    <code>TOGGLE\_PRETTY\_PRINT</code> action, which contains a promise that starts a
    Worker thread to transform the source. The worker is defined
    in assets/build/pretty-print-worker.js. The <code>selectLocation()</code> function is then
    called to select the new source.

-   <code>loadSourceText()</code> – This function is called whenever a source is
    selected using the <code>selectLocation()</code> function (described above) and
    whenever <code>getTextForSources()</code> is called (described below). The
    <code>loadSourceText()</code> function is responsible for loading the source text
    for an individual file. The function first checks to see if the text
    for the selected file is already is already stored in the state. If
    it is, the function returns this text. If the text is not already
    stored, the <code>LOAD\_SOURCE\_TEXT</code> action is dispatched and is wrapped
    in a promise. This function will dispatch the <code>LOAD\_SOURCE\_TEXT</code>
    once for the start of the promise and once for when it completes. It
    returns the source text and if a source map is used, the text for
    the source map will also be returned. These are then stored in state
    by the reducer.

-   <code>getTextForSources()</code> – This function takes a set of source files and
    calls <code>loadSourceText()</code> to load each file. Currently this function is
    not used in debugger.html.

## tabs

The **tabs** action is responsible for gathering all connected
clients that can be debugged, and gathering the tabs for each application that can be debugged on the connected client. The tabs action
file exports the following functions:

-   <code>newTabs()</code> – This function is called from src/main.js and sets
    the action type to <code>ADD\_TABS</code>. The action is dispatched from the
    src/main.js when debugger.html is loading and displaying
    the main page or when starting to debug when a specific tab
    is selected.

-   <code>selectTab()</code> – This function is called from src/main.js when a
    user has selected a specific tab from a connected application
    to debug. It sets the action type to <code>SELECT\_TAB</code> and the action is
    then dispatched in src/main.js.
