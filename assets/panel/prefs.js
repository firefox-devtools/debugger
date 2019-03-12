/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// Enable the Debugger
pref("devtools.debugger.enabled", true);
pref("devtools.debugger.chrome-debugging-host", "localhost");
pref("devtools.debugger.chrome-debugging-websocket", false);
pref("devtools.debugger.remote-host", "localhost");
pref("devtools.debugger.remote-timeout", 20000);
pref("devtools.debugger.pause-on-exceptions", false);
pref("devtools.debugger.ignore-caught-exceptions", true);
pref("devtools.debugger.pause-on-caught-exceptions", true);
pref("devtools.debugger.source-maps-enabled", true);
pref("devtools.debugger.pretty-print-enabled", true);
pref("devtools.debugger.alphabetize-outline", false);
pref("devtools.debugger.auto-pretty-print", false);
pref("devtools.debugger.auto-black-box", true);
pref("devtools.debugger.workers", false);

// The default Debugger UI settings
pref("devtools.debugger.prefs-schema-version", "1.0.0");
pref("devtools.debugger.ui.panes-workers-and-sources-width", 200);
pref("devtools.debugger.ui.panes-instruments-width", 300);
pref("devtools.debugger.ui.panes-visible-on-startup", false);
pref("devtools.debugger.ui.variables-sorting-enabled", true);
pref("devtools.debugger.ui.variables-only-enum-visible", false);
pref("devtools.debugger.ui.variables-searchbox-visible", false);
pref("devtools.debugger.ui.framework-grouping-on", true);
pref("devtools.debugger.ui.editor-wrapping", false);
pref("devtools.debugger.call-stack-visible", true);
pref("devtools.debugger.scopes-visible", true);
pref("devtools.debugger.component-visible", true);
pref("devtools.debugger.workers-visible", true);
pref("devtools.debugger.breakpoints-visible", true);
pref("devtools.debugger.expressions-visible", true);
pref("devtools.debugger.xhr-breakpoints-visible", true);
pref("devtools.debugger.event-listeners-visible", false);
pref("devtools.debugger.start-panel-collapsed", false);
pref("devtools.debugger.end-panel-collapsed", false);
pref("devtools.debugger.start-panel-size", 300);
pref("devtools.debugger.end-panel-size", 300);
pref("devtools.debugger.tabs", "[]");
pref("devtools.debugger.tabsBlackBoxed", "[]");
pref("devtools.debugger.pending-selected-location", "{}");
pref("devtools.debugger.pending-breakpoints", "{}");
pref("devtools.debugger.expressions", "[]");
pref("devtools.debugger.event-listener-breakpoints", "[]");
pref("devtools.debugger.file-search-case-sensitive", false);
pref("devtools.debugger.file-search-whole-word", false);
pref("devtools.debugger.file-search-regex-match", false);
pref("devtools.debugger.project-directory-root", "");
pref("devtools.debugger.skip-pausing", false);
pref("devtools.debugger.logging", false);
pref("devtools.debugger.map-scopes-enabled", false);

pref("devtools.debugger.features.wasm", true);
pref("devtools.debugger.features.shortcuts", true);
pref("devtools.debugger.features.root", true);
pref("devtools.debugger.features.column-breakpoints", true);
pref("devtools.debugger.features.chrome-scopes", false);
pref("devtools.debugger.features.map-scopes", true);
pref("devtools.debugger.features.remove-command-bar-options", false);
pref("devtools.debugger.features.workers", true);
pref("devtools.debugger.features.code-coverage", false);
pref("devtools.debugger.features.code-folding", false);
pref("devtools.debugger.features.outline", true);
pref("devtools.debugger.features.component-pane", false);
pref("devtools.debugger.features.async-stepping", true);
pref("devtools.debugger.features.skip-pausing", true);
pref("devtools.debugger.features.autocomplete-expressions", false);
pref("devtools.debugger.features.map-expression-bindings", true);
pref("devtools.debugger.features.xhr-breakpoints", true);
pref("devtools.debugger.features.original-blackbox", true);
pref("devtools.debugger.features.windowless-workers", true);
pref("devtools.debugger.features.event-listeners-breakpoints", false);
pref("devtools.debugger.features.log-points", true);
