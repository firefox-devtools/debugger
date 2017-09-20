// @flow

// replace quotes and slashes that could interfere with the evaluation.
export function sanitizeInput(input: string) {
  return input.replace(/\\/g, "\\\\").replace(/"/g, "\\$&");
}

/*
 * wrap the expression input in a try/catch so that it can be safely
 * evaluated.
 *
 * NOTE: we add line after the expression to protect against comments.
*/
export function wrapExpression(input: string) {
  return `eval(\`
    try {
      ${sanitizeInput(input)}
    } catch (e) {
      e
    }
  \`)`.trim();
}
