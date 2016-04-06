const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: './js/main.js',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      "devtools": "ff-devtools-libs",
      "sdk": "ff-devtools-libs/sdk"
    },
    extensions: ["", ".js", ".jsm"],
    root: path.join(__dirname, "node_modules")
  },
  module: {
    loaders: [
      { test: /\.json$/, loader: "json-loader" },
      { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader") }
    ]
  },
  plugins: [
    new ExtractTextPlugin("styles.css")
  ]
}
