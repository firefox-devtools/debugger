#!/bin/bash

set -x
hg --version
rm -rf firefox/
hg clone -v https://hg.mozilla.org/mozilla-unified/ firefox

cd firefox
hg co $MC_COMMIT
cd ..
set +x
