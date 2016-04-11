"use strict";

const React = require("react");
const {DOM: dom} = React;
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const actions = require("../actions");
const { getSelectedSource } = require("../queries");
const { groupBy, values } = require("../utils");

require("./Sources.css");

/**
 * Takes a sources object indexed by actor and
 * returns a sources object indexed by source domain.
 *
 * @returns Object
 */
function groupSourcesByDomain(sources) {
  return groupBy(values(sources), source => {
    if (!source.url) {
      return source.introductionType;
    }
    return (new URL(source.url)).hostname;
  });
}

function Source({source, selectSource, selectedSource}) {
  const value = source.url ?
                (new URL(source.url)).pathname : source.introductionType;

  const isSelected = selectedSource === source ? "selected" : "";

  return dom.li(
    { onClick: () => selectSource(source),
      className: "source-item " + isSelected,
      style: { paddingLeft: "40px" },
      key: source.url },
    value
  );
}

function Sources({ sources, selectSource, selectedSource}) {
  const sourcesByDomain = groupSourcesByDomain(sources);
  const domains = Object.keys(sourcesByDomain);

  return dom.ul(
    { className: "sources-list" },
    domains.map(domain => {
      return dom.li({ className: "domain" },
        dom.span({style: { paddingLeft: "20px" }}, domain),
        dom.ul(
          null,
          sourcesByDomain[domain].map(source => Source({
            source, selectSource, selectedSource }))
        )
      );
    })
  );
}

module.exports = connect(
  state => ({ selectedSource: getSelectedSource(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Sources);
