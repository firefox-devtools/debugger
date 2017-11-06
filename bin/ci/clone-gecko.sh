#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at <http://mozilla.org/MPL/2.0/>.

hg --version
rm -rf firefox/
hg clone https://hg.mozilla.org/mozilla-unified/ firefox

cd firefox
hg co $MC_COMMIT
cd ..
