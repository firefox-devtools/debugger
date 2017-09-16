#!/bin/bash

node ./bin/copy-assets.js --mc gecko

cd gecko

./mach mochitest devtools/client/debugger/new

cd ..
