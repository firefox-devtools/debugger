## Flow

- [Adding flow to a file](#adding-flow-to-a-file)
- [Running flow](#running-flow)
- [Missing Annotation](#missing-annotation)
- [Where are types defined?](#where-are-types-defined)
- [Checking flow coverage](#checking-flow-coverage)
- [Flow Conventions](#flow-conventions)
- [Common Errors](#common-errors)
  - [Required property](#required-property)
  - [Missing Annotation](#missing-annotation)
  - [Type Inconsistencies](#type-inconsistencies)


The debugger uses Facebook's [flow](https://flowtype.org/) type checker.

Rationale:
* *code clarity* - helps team members understand the code
* *refactoring* - guarantees functions integrate well
* *code reviews* - adds a static check like linting

### Running flow
```
yarn run flow
```

Go checkout the [Flow related issues][flow-issues]

### Adding flow to a file

Add `// @flow` to the top of the file.

```diff
diff --git a/src/components/Editor.js b/src/components/Editor.js
index b0fe9a6..8889a56 100644
--- a/src/components/Editor.js
+++ b/src/components/Editor.js
@@ -1,3 +1,5 @@
+// @flow
+
```

Then run `yarn run flow` in your terminal. The first run will likely take 30 seconds to initialize, but subsequent runs will be fast.

Here's a [gif](http://g.recordit.co/QYAyms9n3C.gif) of flow being added to the SearchBar and a couple of issues being resolved.

### Where are types defined?

* Debugger [types](https://github.com/devtools-html/debugger.html/blob/master/src/types.js)
* Debugger action [types](https://github.com/devtools-html/debugger.html/blob/master/src/actions/types/index.js)
* Useful React and Global [types](http://www.saltycrane.com/blog/2016/06/flow-type-cheat-sheet/)
* Builtin [types](https://flowtype.org/docs/quick-reference.html)


### Checking flow coverage

```
flow coverage --color <path to file>
yarn run flow-coverage
yarn run flow-redux
yarn run flow-react
yarn run flow-utils
```

### Flow Conventions

### Flow type conventions

We are currently using the following conventions

- the type names should be CamelCased (e.g. `SourceText`)
- the types used to annotate functions or methods defined in a module should be exported only when
  they are supposed to be used by other modules (`export type ExtensionManifest = ...`)
- any type imported from the other modules should be in the module preamble (near to the regular ES6 imports)
- all the flow type definitions should be as close as possible to the function they annotate

### Common Errors

#### Required property

Problem: In this case, flow is not sure that the editor property is defined.

```
src/components/Editor/SearchBar.js:172
172:     const ctx = { ed, cm: ed.codeMirror };
                                  ^^^^^^^^^^ property `codeMirror`. Property cannot be accessed on possibly undefined value
172:     const ctx = { ed, cm: ed.codeMirror };
                               ^^ undefined
```

Solution: make sure that the property is required.

```diff
--- a/src/components/Editor/SearchBar.js
+++ b/src/components/Editor/SearchBar.js
@@ -22,7 +22,7 @@ function countMatches(query, text) {
 const SearchBar = React.createClass({

   propTypes: {
+    editor: PropTypes.object.isRequired,
-    editor: PropTypes.object,
     sourceText: ImPropTypes.map.isRequired,
     selectedSource: ImPropTypes.map
   },
@@ -144,7 +144,8 @@ const SearchBar = Rea
```


#### Missing annotation

This is a pretty common flow error and it is usually the simplest to fix.

It means that the new code added in the sources doesn't define the types
of the functions and methods parameters, e.g. on the following snippet:

```js
export default async function getValidatedManifest(sourceDir) {
  ...
}
```

flow is going to raise the error:

```
src/util/manifest.js:32
 32:   sourceDir
       ^^^^^^^^^ parameter `sourceDir`. Missing annotation
```

which is fixed by annotating the function correctly, e.g.:

```js
export default async function getValidatedManifest(
  sourceDir: string
): Promise<ExtensionManifest> {
  ...
}
```

#### Type inconsistencies

Some of the flow errors are going to contain references to the two sides
of the flowtype errors:

```
tests/unit/test-cmd/test.build.js:193
193:         manifestData: basicManifest,
                           ^^^^^^^^^^^^^ property `applications`. Property not found in
 24: export type ExtensionManifest = {|
                                     ^ object type. See: src/util/manifest.js:24

```

- The first part points to the offending code (where the type violation has been found)
- The second part points to the violated type annotation (where the type has been defined)

When flow raises this kind of error (e.g. it is pretty common during a refactoring),
we have to evaluate which one of the two sides is wrong.

As an example, by reading the above error it is not immediately clear which part should be fixed.

To be sure about which is the proper fix, we have to look at the code near to both the lines
and evaluate the actual reason, e.g.:

- it is possible that we wrote some of the property names wrong (in the code or in the type definitions)
- or the defined type is supposed to contain a new property and it is not yet in the related type definitions

[flow-issues]: https://github.com/devtools-html/debugger.html/issues?q=is%3Aopen+is%3Aissue+label%3Aflow
