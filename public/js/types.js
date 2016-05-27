"use strict";

const t = require("tcomb");

const Tab = t.struct({
  title: t.String,
  url: t.String,
  id: t.String,
  tab: t.Object,
  browser: t.enums.of(["chrome", "firefox"])
}, "Tab");

const Source = t.struct({
  id: t.String,
  url: t.union([t.String, t.Nil])
}, "Source");

const Location = t.struct({
  sourceId: t.String,
  line: t.Number,
  column: t.Number
}, "Location");

const Frame = t.struct({
  id: t.String,
  displayName: t.String,
  location: Location
}, "Frame");

module.exports = {
  Tab,
  Source,
  Location,
  Frame
};
