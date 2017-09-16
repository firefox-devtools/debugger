#!/bin/bash

cd gecko
# We have to set that env variable otherwise
# ./mach build is going to be interactive and expect <ENTER>
# to be pressed to continue. Here travis would just be stuck...
export MOZBUILD_STATE_PATH=$(pwd)/mozbuild-state
[ -d $MOZBUILD_STATE_PATH ] || mkdir $MOZBUILD_STATE_PATH
echo $MOZBUILD_STATE_PATH

echo "ac_add_options --enable-artifact-builds" > mozconfig
echo "mk_add_options AUTOCLOBBER=1" >> mozconfig
./mach build
cd ..
