// MIT © Sindre Sorhus - sindresorhus.com
// via https://gist.github.com/sindresorhus/7996717

const { execFile } = require('child_process');

module.exports = function checkWarnIfYarnChanged(origHead, head) {
  return new Promise((resolve, reject) => {
    execFile(
      'git',
      ['diff-tree', '-r', '--name-only', '--no-commit-id', origHead, head],
      (error, stdout, stderr) => {
        if (error) {
          console.error('stderr', stderr);
          reject(error);
          return;
        }
        if (stdout.includes('yarn.lock')) {
          console.log('🎅 yarn.lock changed; RUN: yarn install');
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
  });
};
