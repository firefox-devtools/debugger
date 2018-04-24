/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mapUrl = require("postcss-url-mapper");
const MC_PATH = "chrome://devtools/skin/images/devtools-reps/";
const EXPRESS_PATH = "/devtools-reps/images/";

function mapUrlProduction(url, type) {
  const newUrl = url
    .replace("/images/open-inspector.svg", MC_PATH + "open-inspector.svg")
    .replace("/images/jump-definition.svg", MC_PATH + "jump-definition.svg");

  return newUrl;
}

function mapUrlDevelopment(url) {
  const newUrl = url
    .replace("/images/open-inspector.svg", EXPRESS_PATH + "open-inspector.svg")
    .replace(
      "/images/jump-definition.svg",
      EXPRESS_PATH + "jump-definition.svg"
    );

  return newUrl;
}

module.exports = ({ file, options, env }) => {
  if (env === "production") {
    return {
      plugins: [mapUrl(mapUrlProduction)]
    };
  }

  return {
    plugins: [mapUrl(mapUrlDevelopment)]
  };
};
