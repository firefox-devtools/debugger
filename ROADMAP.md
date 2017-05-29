### Debugger.html Roadmap


#### Q3 Goals (July 1st - September 30th)

**Top Goal**  add features for debugging react apps.
**Secondary Goals** improve the debugger core performance and experience and continue to invest in the community

##### Framework Improvements

* **Call Stacks** Simplify call stacks by grouping library frames
* **Preview**  Visualize Redux actions and React Components
* **Navigation** Surface applications Actions and Components so that developers can easily add breakpoints or log statements.
* **Performance** Improve server pause performance for large call stacks

##### Language features

* **Async Call Stack** Show async stack traces in the call stack, let developers select a frame.
* **Smarter Breakpoints** Help developers add breakpoints that do not move when the code changes.
	* **AST Breakpoints** Recalculate locations when the page reloads based on an AST location so that the breakpoint does not move. **Column Breakpoints** Let developers add breakpoints in different locations on the line.
* **Source Map Stepping** Help developers step through their code by automatically stepping when the code is transpiled.
* **Continue to point** Help developers jump to a location in the code as opposed to stepping there. It’s better to jump than it is to step :)

##### Parity Features

* **Project Text Search** Let developers search the sources on the page.
* **Event Listeners** Let developers jump to an active event listener.

##### Invest in the community

* **Mentorship** Encourage community mentorship and leadership opportunities.
* **Outreach** Reach out to schools, companies, and bootcamps to organize events.
* **Growth** Help contributors find meaningful work and build relationships.
* **Education** Develop resources for giving a talk, writing blog posts, or recording a screencast.
