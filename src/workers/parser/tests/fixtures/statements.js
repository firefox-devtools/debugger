debugger; debugger;
console.log("a"); console.log("a");

// assignments with valid pause locations
this.x = 3;
var a = 4;
var d = [foo()]
var f = 3, e = 4;

// assignments with invalid pause locations
var b = foo();
c = foo();


const arr = [
  '1',
  2,
  foo()
]

const obj = {
  a: '1',
  b: 2,
  c: foo(),
}

foo(
  1,
  foo(
    1
  ),
  3
)
