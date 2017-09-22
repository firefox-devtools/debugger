#!/bin/bash

node ./bin/copy-assets.js --mc firefox
yarn mochi
exit $?
