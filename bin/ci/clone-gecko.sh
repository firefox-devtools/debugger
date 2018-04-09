#!/bin/bash

set -x
hg --version
rm -rf firefox/
travis_retry hg clone https://hg.mozilla.org/mozilla-unified/ firefox

cd firefox
hg co $MC_COMMIT
cd ..
set +x
