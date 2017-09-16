#!/bin/bash

hg --version
if [ ! -d "gecko/.hg" ]; then
  rm -rf gecko/
  hg clone https://hg.mozilla.org/mozilla-unified/ gecko
else
  cd gecko
  hg strip --no-backup 'roots(outgoing())'
  hg pull -u
  cd ..
fi
