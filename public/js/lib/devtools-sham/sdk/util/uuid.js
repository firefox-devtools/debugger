
let i = 1;
function uuid() {
  return 'not-really-uuid' + (i++);
}

module.exports = { uuid };
