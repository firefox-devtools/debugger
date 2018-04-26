export {};

class Outer {
  method() {
    class Inner {
      m() {
        console.log(this);
      }
    }
  }
}
