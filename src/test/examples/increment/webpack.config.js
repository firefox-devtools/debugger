const path = require("path");

module.exports = {
  entry: path.join(__dirname, "./example.js"),
  devtool: "source-map",
  output: {
    path: path.join(__dirname),
    filename: "bundle.js",
  }
}
