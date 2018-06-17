#!/bin/bash
python --version
hg --version
df -h 

rm -rf firefox/
hg clone https://hg.mozilla.org/mozilla-unified/ firefox

cd firefox
hg update --clean
hg co $MC_COMMIT
cd ..
