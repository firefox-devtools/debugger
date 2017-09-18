#!/bin/bash

hg --version
rm -rf firefox/
hg clone https://hg.mozilla.org/mozilla-unified/ firefox

cd firefox
hg co $MC_COMMIT
cd ..
