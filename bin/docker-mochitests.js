import { publishAssets } from "./publish-assets"

function updateImage() {
  // mkdir -p $DOWNLOADS_PATH

  const downloads_path = fs.PROCESS_ENV['DOWNLOADS_PATH']
  fs.existsSync(`${downloads_path}/local-mc2.tar`)
  if [[ -e $DOWNLOADS_PATH/local-mc2.tar ]]; then
    load("$DOWNLOADS_PATH/local-mc2.tar");
  else
    pull("jasonlaster11/local-mc2")
    images)(
    time docker save jasonlaster11/local-mc2 > $DOWNLOADS_PATH/local-mc2.tar
  fi
}

function runTests() {
  publishAssets()
  run({
    opts: "it", v: [

  ]
})
  -v `pwd`/assets/build/debugger.js:/firefox/devtools/client/debugger/new/debugger.js \
  -v `pwd`/assets/build/source-map-worker.js:/firefox/devtools/client/debugger/new/source-map-worker.js \
  -v `pwd`/assets/build/pretty-print-worker.js:/firefox/devtools/client/debugger/new/pretty-print-worker.js \
  -v `pwd`/assets/build/parser-worker.js:/firefox/devtools/client/debugger/new/parser-worker.js \
  -v `pwd`/assets/build/integration-tests.js:/firefox/devtools/client/debugger/new/integration-tests.js \
  -v `pwd`/assets/build/debugger.css:/firefox/devtools/client/debugger/new/debugger.css \
  -v `pwd`/assets/build/panel/debugger.properties:/firefox/devtools/client/locales/en-US/debugger.properties \
  -v `pwd`/assets/build/panel/prefs.js:/firefox/devtools/client/preferences/debugger.js \
  -v `pwd`/assets/build/panel/panel.js:/firefox/devtools/client/debugger/new/panel.js \
  -v `pwd`/assets/build/panel/index.html:/firefox/devtools/client/debugger/new/index.html \
  -v `pwd`/assets/build/panel/moz.build:/firefox/devtools/client/debugger/new/moz.build \
  -v `pwd`/assets/build/mochitest:/firefox/devtools/client/debugger/new/test/mochitest \
  -v "/tmp/.X11-unix:/tmp/.X11-unix:rw" \
  -e "DISPLAY=unix$DISPLAY" \
  --ipc host \
  jasonlaster11/local-mc2 \
  /bin/bash -c "export SHELL=/bin/bash; touch devtools/client/debugger/new/test/mochitest/browser.ini && ./mach build && ./mach mochitest --subsuite devtools devtools/client/debugger/new/test/mochitest/"

}
