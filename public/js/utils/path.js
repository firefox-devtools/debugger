// @flow

function basename(path: string) : string {
  return path.split("/").pop();
}

function dirname(path: string) : string {
  const idx = path.lastIndexOf("/");
  return path.slice(0, idx);
}

function isURL(str: string) : boolean {
  return str.indexOf("://") !== -1;
}

function isAbsolute(str: string) : boolean {
  return str[0] === "/";
}

function join(base: string, dir: string) : string {
  return base + "/" + dir;
}

module.exports = {
  basename, dirname, isURL, isAbsolute, join
};
