#!/bin/bash

function fail {
  echo $1 >&2
  exit 1
}

function retry {
  local n=1
  local max=5
  local delay=15
  while true; do
    "$@" && break || {
      if [[ $n -lt $max ]]; then
        ((n++))
        echo "Command failed. Attempt $n/$max:"
        sleep $delay;
      else
        fail "The command has failed after $n attempts."
      fi
    }
  done
}

cd firefox
# We have to set that env variable otherwise
# ./mach build is going to be interactive and expect <ENTER>
# to be pressed to continue. Here travis would just be stuck...
export MOZBUILD_STATE_PATH=$(pwd)/mozbuild-state
[ -d $MOZBUILD_STATE_PATH ] || mkdir $MOZBUILD_STATE_PATH
echo $MOZBUILD_STATE_PATH

echo "ac_add_options --enable-artifact-builds" > mozconfig
echo "mk_add_options AUTOCLOBBER=1" >> mozconfig
retry ./mach build
ret=$?

cd ..
exit $ret
