function basename(path) {
  return path.split("/").pop();
}

function dirname(path) {
  const idx = path.lastIndexOf("/");
  return path.slice(0, idx);
}

function isURL(str) {
  return str.indexOf("://") !== -1;
}

function isAbsolute(str) {
  return str[0] === "/";
}

module.exports = {
  basename, dirname, isURL, isAbsolute
};
