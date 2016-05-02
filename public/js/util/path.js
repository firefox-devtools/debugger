
function basename(path) {
  return path.split("/").pop();
}

module.exports = { basename };
