type Scope = {
  location: {
    line: number,
    column: number
  },
  parent: Scope,
  bindings: Object[]
};
