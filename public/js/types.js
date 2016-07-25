const t = require("tcomb");

const Tab = t.struct({
  title: t.String,
  url: t.String,
  id: t.String,
  tab: t.Object,
  browser: t.enums.of(["chrome", "firefox"])
}, "Tab");

const SourceText = t.struct({
  text: t.String,
  contentType: t.String
});

const Source = t.struct({
  id: t.String,
  url: t.union([t.String, t.Nil]),
  isPrettyPrinted: t.Boolean,
  sourceMapURL: t.union([t.String, t.Nil]),
  text: t.maybe(SourceText)
}, "Source");

const Location = t.struct({
  sourceId: t.String,
  line: t.Number,
  column: t.union([t.Number, t.Nil])
}, "Location");

const Breakpoint = t.struct({
  id: t.String,
  loading: t.Boolean,
  disabled: t.Boolean,
  text: t.String,
  condition: t.union([t.String, t.Nil])
});

const BreakpointResult = t.struct({
  id: t.String,
  actualLocation: Location
});

const Frame = t.struct({
  id: t.String,
  displayName: t.String,
  location: Location,
  scope: t.union([t.Object, t.Nil])
}, "Frame");

module.exports = {
  Tab,
  Source,
  SourceText,
  Location,
  Breakpoint,
  BreakpointResult,
  Frame
};
