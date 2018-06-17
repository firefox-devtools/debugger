#!/bin/bash
python --version
hg --version
df -h 

rm -rf firefox/
hg clone https://hg.mozilla.org/mozilla-unified/ firefox
echo $?  
echo ">> Clone finished"

cd firefox

echo ">> update"
hg update --clean
echo ">> checkout"

hg co $MC_COMMIT
cd ..
