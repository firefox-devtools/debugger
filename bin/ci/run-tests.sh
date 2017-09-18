#!/bin/bash

node ./bin/copy-assets.js --mc firefox
node bin/mochi.js
exit $?
