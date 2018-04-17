function square(n) {
  return n * n;
}

export function exFoo() {
  return "yay";
}

async function slowFoo() {
  return "meh";
}

export async function exSlowFoo() {
  return "yay in a bit";
}

function ret() {
  return foo();
}

child = function() {};

(function() {
  2;
})();

const obj = {
  foo: function name() {
    2 + 2;
  },

  bar() {
    2 + 2;
  }
};
