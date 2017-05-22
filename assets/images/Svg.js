const React = require("react");
const InlineSVG = require("svg-inline-react");

const svg = {
  "angle-brackets": require("./angle-brackets.svg"),
  arrow: require("./arrow.svg"),
  backbone: require("./backbone.svg"),
  blackBox: require("./blackBox.svg"),
  breakpoint: require("./breakpoint.svg"),
  "column-breakpoint": require("./column-breakpoint.svg"),
  "case-match": require("./case-match.svg"),
  close: require("./close.svg"),
  domain: require("./domain.svg"),
  file: require("./file.svg"),
  folder: require("./folder.svg"),
  globe: require("./globe.svg"),
  jquery: require("./jquery.svg"),
  "magnifying-glass": require("./magnifying-glass.svg"),
  "arrow-up": require("./arrow-up.svg"),
  "arrow-down": require("./arrow-down.svg"),
  pause: require("./pause.svg"),
  "pause-exceptions": require("./pause-exceptions.svg"),
  plus: require("./plus.svg"),
  prettyPrint: require("./prettyPrint.svg"),
  react: require("./react.svg"),
  "regex-match": require("./regex-match.svg"),
  resume: require("./resume.svg"),
  settings: require("./settings.svg"),
  stepIn: require("./stepIn.svg"),
  stepOut: require("./stepOut.svg"),
  stepOver: require("./stepOver.svg"),
  subSettings: require("./subSettings.svg"),
  toggleBreakpoints: require("./toggle-breakpoints.svg"),
  togglePanes: require("./toggle-panes.svg"),
  "whole-word-match": require("./whole-word-match.svg"),
  worker: require("./worker.svg"),
  "sad-face": require("./sad-face.svg"),
  refresh: require("./refresh.svg"),
  webpack: require("./webpack.svg"),
  node: require("./node.svg"),
  express: require("./express.svg"),
  pug: require("./pug.svg"),
  extjs: require("./sencha-extjs.svg"),
  showSources: require("./showSources.svg"),
  showOutline: require("./showOutline.svg")
};

module.exports = function(name, props) {
  // eslint-disable-line
  if (!svg[name]) {
    throw new Error("Unknown SVG: " + name);
  }
  let className = name;
  if (props && props.className) {
    className = `${name} ${props.className}`;
  }
  if (name === "subSettings") {
    className = "";
  }
  props = Object.assign({}, props, { className, src: svg[name] });
  return React.createElement(InlineSVG, props);
};
