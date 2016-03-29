const path = require('path');
const environment = require('./environment');

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
      devtools: environment.geckoDev + "/devtools/client",
    },
    extensions: ["", ".js", ".jsm"],
    root: path.join(__dirname, "node_modules")
  }
}
