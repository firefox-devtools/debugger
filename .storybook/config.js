import React from "react";
import { configure } from '@storybook/react'
import { readFileSync } from "fs";
import path from "path";

const req = require.context('../src/components/stories', true, /\.stories\.js$/);

function getL10nBundle() {
  const read = file => readFileSync(path.join(__dirname, file));
  try {
    return read("../../assets/panel/debugger.properties");
  } catch (e) {
    return read("../../../../locales/en-us/debugger.properties");
  }
}

global.L10N = require("devtools-launchpad").L10N;
global.L10N.setBundle(getL10nBundle());

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);