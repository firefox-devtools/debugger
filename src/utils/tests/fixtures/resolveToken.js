const a = 1;
let b = 0;

function getA() {
  return a;
}

function setB(newB) {
  b = newB;
}

const plusAB = (function(x, y) {
  const obj = { x, y };
  function insideClosure(alpha, beta) {
    return alpha + beta + obj.x + obj.y;
  }

  return insideClosure;
})(a, b);
