const React = require("react");
const InlineSVG = require("svg-inline-react");
const { isDevelopment } = require("devtools-config");

const svg = {
  "angle-brackets": require("./angle-brackets.svg"),
  angular: require("./angular.svg"),
  arrow: require("./arrow.svg"),
  backbone: require("./backbone.svg"),
  blackBox: require("./blackBox.svg"),
  breakpoint: require("./breakpoint.svg"),
  "column-breakpoint": require("./column-breakpoint.svg"),
  "case-match": require("./case-match.svg"),
  close: require("./close.svg"),
  choo: require("./choo.svg"),
  dojo: require("./dojo.svg"),
  domain: require("./domain.svg"),
  file: require("./file.svg"),
  folder: require("./folder.svg"),
  globe: require("./globe.svg"),
  jquery: require("./jquery.svg"),
  underscore: require("./underscore.svg"),
  lodash: require("./lodash.svg"),
  ember: require("./ember.svg"),
  vuejs: require("./vuejs.svg"),
  "magnifying-glass": require("./magnifying-glass.svg"),
  "arrow-up": require("./arrow-up.svg"),
  "arrow-down": require("./arrow-down.svg"),
  pause: require("./pause.svg"),
  "pause-exceptions": require("./pause-exceptions.svg"),
  plus: require("./plus.svg"),
  preact: require("./preact.svg"),
  aframe: require("./aframe.svg"),
  prettyPrint: require("./prettyPrint.svg"),
  react: require("./react.svg"),
  "regex-match": require("./regex-match.svg"),
  redux: require("./redux.svg"),
  immutable: require("./immutable.svg"),
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
  "sad-face": require("devtools-mc-assets/assets/devtools/client/themes/images/sad-face.svg"),
  refresh: require("devtools-mc-assets/assets/devtools/client/themes/images/reload.svg"),
  webpack: require("./webpack.svg"),
  node: require("./node.svg"),
  express: require("./express.svg"),
  pug: require("./pug.svg"),
  extjs: require("./sencha-extjs.svg"),
  marko: require("./marko.svg"),
  nextjs: require("./nextjs.svg"),
  showSources: require("./showSources.svg"),
  showOutline: require("./showOutline.svg"),
  nuxtjs: require("./nuxtjs.svg")
};

type SvgType = {
  name: string,
  className?: string,
  onClick?: () => void,
  "aria-label"?: string,
  role?: string
};

function Svg({ name, className, onClick, "aria-label": ariaLabel, role }) {
  if (!svg[name]) {
    const error = `Unknown SVG: ${name}`;
    if (isDevelopment()) {
      throw new Error(error);
    }

    console.warn(error);
    return;
  }

  className = `${name} ${className || ""}`;
  if (name === "subSettings") {
    className = "";
  }

  const props = {
    className,
    onClick,
    ["aria-label"]: ariaLabel,
    role,
    src: svg[name]
  };

  return <InlineSVG {...props} />;
}

Svg.displayName = "Svg";

module.exports = Svg;
