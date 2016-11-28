// @flow

function basename(path: string) {
  return path.split("/").pop();
}

function dirname(path: string) {
  const idx = path.lastIndexOf("/");
  return path.slice(0, idx);
}

function isURL(str: string) {
  return str.indexOf("://") !== -1;
}

function isAbsolute(str: string) {
  return str[0] === "/";
}

function join(base: string, dir: string) {
  return `${base}/${dir}`;
}

module.exports = {
  basename, dirname, isURL, isAbsolute, join
};
