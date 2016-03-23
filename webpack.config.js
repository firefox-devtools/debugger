const path = require('path');

module.exports = {
  entry: './js/main.js',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      "devtools/client/shared/vendor/react": "react",
      "devtools/shared/DevToolsUtils": path.join(__dirname, "js/DevToolsUtils"),
      devtools: "/Users/james/projects/mozilla/gecko-dev/devtools/client",
    },
    extensions: ["", ".js", ".jsm"],
    root: path.join(__dirname, "node_modules")
  }
}
