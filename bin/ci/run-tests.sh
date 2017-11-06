#!/bin/bash

node ./bin/copy-assets.js --mc firefox
./node_modules/.bin/mochii --ci true --mc ./firefox --default-test-path devtools/client/debugger/new
exit $?
