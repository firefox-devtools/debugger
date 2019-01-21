const gitParams = process.env.HUSKY_GIT_PARAMS

if (!gitParams) {
  process.exit();
}

const [origHead, head, flag] = gitParams.split(' ');

// Flag is 1 if we moved between branches. Flag is 0 if we merely checked out a file from another branch.
if (flag !== '1') {
  process.exit();
}

require('./check-warn-yarn-changed.js')(origHead, head);
