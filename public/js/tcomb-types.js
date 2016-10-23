const t = require("tcomb");

const Location = t.struct({
  sourceId: t.String,
  line: t.Number,
  column: t.union([t.Number, t.Nil])
}, "Location");

const Frame = t.struct({
  id: t.String,
  displayName: t.String,
  location: Location,
  this: t.union([t.Object, t.Nil]),
  scope: t.union([t.Object, t.Nil])
}, "Frame");

module.exports = {
  Frame
};
