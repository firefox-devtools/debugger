
export function decoratorFactory(opts: { selector: string }) {
  return function decorator(target) {
    return <any>target;
  };
}

