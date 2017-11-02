#!/bin/bash

node ./bin/copy-assets.js --mc firefox
./node_modules/.bin/mochii --mc ./firefox --default-test-path devtools/client/debugger/new
exit $?
