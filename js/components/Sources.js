const React = require("react");
const dom = React.DOM;

function Sources({ sources }) {
  const sourceArr = Object.keys(sources).map(k => sources[k]);

  return dom.ul(
    null,
    sourceArr.map(source => {
      return dom.li(null, source.url);
    })
  );
}

module.exports = Sources;
