const fs = require("fs");
module.exports = function(url) {
  return new Promise((resolve, reject) => {
    // example.com is used at a dummy URL that points to our local
    // `/src` folder.
    url = url.replace("http://example.com/test/", "/../js/test/mochitest/examples/");
    resolve({ content: fs.readFileSync(__dirname + url, "utf8") });
  });
};
