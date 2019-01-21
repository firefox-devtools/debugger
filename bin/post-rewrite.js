// This is either 'rebase' or 'amend'.
if (process.env.HUSKY_GIT_PARAMS !== 'rebase') {
  process.exit();
}

const checkWarnYarnChanged = require('./check-warn-yarn-changed.js');

const { createInterface } = require('readline');

const rl = createInterface({
  input: process.stdin,
});

rl.on('line', line => {
  const [origHead, head] = line.split(' ');
  checkWarnYarnChanged(origHead, head).then(
    changed => changed && process.exit()
  );
});
