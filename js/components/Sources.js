const React = require("react");
const dom = React.DOM;

function Sources() {
  return dom.ul(
    null,
    this.props.sources.map(source => {
      return dom.li(null, source.url);
    })
  );
}

module.exports = Sources;
