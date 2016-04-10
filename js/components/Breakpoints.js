const React = require("react");
const dom = React.DOM;

function Breakpoints({ breakpoints }) {

  function onResumeClick() {
    console.log("click");
    gThreadClient.resume();
  }

  return dom.div(
    {},
    dom.button({ onClick: onResumeClick }, "resume"),
    dom.ul(
      null,
      breakpoints.map(bp => dom.li(
        null,
        bp.location.actor + ": " + bp.location.line
      ))
    )
  );
}

module.exports = Breakpoints;
