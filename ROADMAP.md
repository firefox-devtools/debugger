## Debugger.html Roadmap

### Q4 Goals


* features for debugging react apps.
* source map improvements
* improve server stability

**Secondary Goals**

#### Framework Improvements

* **Call Stacks** Simplify call stacks by grouping library frames
* **Preview**  Visualize Redux actions and React Components
* **Navigation** Surface applications Actions and Components so that developers can easily add breakpoints or log statements.

#### Source Map Improvements

* **map minified variables** it should be possible to preview and evaluate the original variables
* **step over** stepping should always take you to the next statmenet
* **step in** should not land in a function signature or other bad location.

#### Server Stability

This goal can be summarized as, we would like the debugger to behave as expected. We want to fix edge cases where breakpoints won't be hit or stepping will not land where you would expect. Here is a [list][bpbugs] of breakpoint and stepping bugs.

### Q3 Update

#### Progress

* We released the new UI in 56. Releasing was a bigger focus than we had anticipated. Internal developers did a great job of surfacing issues with the UI (preview, breakpoints, ...).
* We focused on code health, refactoring, testing, intermittents, type coverage after releasing. The debugger is in a better place now to move forward with confidence.
* We are shipping project text search. Hubert did a fantastic job building the feature. We designed it to be like Atom/Sublime's search experience and between streaming results and all of the UI details.
* We are shipping AST breakpoints, which will keep breakpoints in the correct location on page reload.
* We are shipping async stepping, which will let users step over await expressions. Jaideep did a great job laying the foundation for additional parser and stepping features in the future.
* We shipped a server side performance fix for stepping with large call stacks. We also shipped a server side fix for ignoring redundant breakpoints when returning from a function.

#### What did not get done

* We did not improve framework features. We plan on doing this in Q4 with the help of UCOSP students.
* Async Call Stack
* Source Map Stepping
* Continue to point
* Event Listeners

#### Summary

We shipped the debugger this quarter and improved our feedback loop with internal developers.
Shipping was a big accomplishment, we probably fixed ~100 bugs big and small in June and July and we
shipped a good MVP.

We also found time to add new functionality that will set us up well in the future. Both Async stepping and ast breakpoints position us well to build new features going forward.

Looking back, it would have been good to update the roadmap at the midway point when it was
clear that we would be focusing on quality improvements over features like frameworks. Going forward,
we plan the roadmap doc when we do quarterly check ins (before, during, and at the end of quarters).



### Q3 Goals (July 1st - September 30th)

**Top Goal**  add features for debugging react apps.
**Secondary Goals** improve the debugger core performance and experience and continue to invest in the community

#### Framework Improvements

* **Call Stacks** Simplify call stacks by grouping library frames
* **Preview**  Visualize Redux actions and React Components
* **Navigation** Surface applications Actions and Components so that developers can easily add breakpoints or log statements.
* **Performance** Improve server pause performance for large call stacks

#### Language features

* **Async Call Stack** Show async stack traces in the call stack, let developers select a frame.
* **Smarter Breakpoints** Help developers add breakpoints that do not move when the code changes.
	* **AST Breakpoints** Recalculate locations when the page reloads based on an AST location so that the breakpoint does not move. **Column Breakpoints** Let developers add breakpoints in different locations on the line.
* **Source Map Stepping** Help developers step through their code by automatically stepping when the code is transpiled.
* **Continue to point** Help developers jump to a location in the code as opposed to stepping there. It’s better to jump than it is to step :)

#### Parity Features

* **Project Text Search** Let developers search the sources on the page.
* **Event Listeners** Let developers jump to an active event listener.

#### Invest in the community

* **Mentorship** Encourage community mentorship and leadership opportunities.
* **Outreach** Reach out to schools, companies, and bootcamps to organize events.
* **Growth** Help contributors find meaningful work and build relationships.
* **Education** Develop resources for giving a talk, writing blog posts, or recording a screencast.


[bpbugs]: https://docs.google.com/spreadsheets/d/1BES8bxJBf2GGHpQ4rZ68kOfFwZl5NJC8zqFRMKZ3iXE/edit?usp=sharing
