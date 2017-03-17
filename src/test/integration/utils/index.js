const wait = require("./wait");
const assert = require("./assert");
const mocha = require("./mocha");
const commands = require("./commands");
const shared = require("./shared");

module.exports = Object.assign({}, wait, assert, mocha, commands, shared);
