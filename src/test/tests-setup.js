global.Worker = require("workerjs");

import path from "path";
import getConfig from "../../bin/getConfig";
import { setConfig } from "devtools-config";
import { readFileSync } from "fs";
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-15";

const rootPath = path.join(__dirname, "../../");

const envConfig = getConfig();
const config = {
  ...envConfig,
  workers: {
    sourceMapURL: path.join(
      rootPath,
      "node_modules/devtools-source-map/src/worker.js"
    ),
    parserURL: path.join(rootPath, "src/workers/parser/worker.js"),
    prettyPrintURL: path.join(rootPath, "src/workers/pretty-print/worker.js"),
    searchURL: path.join(rootPath, "src/workers/search/worker.js")
  }
};

global.DebuggerConfig = config;

global.L10N = require("devtools-launchpad").L10N;
global.L10N.setBundle(readFileSync("./assets/panel/debugger.properties"));

Enzyme.configure({ adapter: new Adapter() });

setConfig(config);
