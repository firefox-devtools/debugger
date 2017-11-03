#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at <http://mozilla.org/MPL/2.0/>.

node ./bin/copy-assets.js --mc firefox
./node_modules/.bin/mochii --mc ./firefox --default-test-path devtools/client/debugger/new
exit $?
