import { traverseAst } from "./utils/ast";
import * as t from "@babel/types";
import type { AstLocation } from "./types";

export type PausePoint = {|
  location: AstLocation,
  types: {| breakpoint: boolean, stepOver: boolean |}
|};

export type PausePoints = PausePoint[];

const isControlFlow = node =>
  t.isForStatement(node) || t.isWhileStatement(node) || t.isIfStatement(node);

const isAssignment = node =>
  t.isVariableDeclarator(node) || t.isAssignmentExpression(node);

const isImport = node => t.isImport(node) || t.isImportDeclaration(node);
const isReturn = node => t.isReturnStatement(node);
const inExpression = parent =>
  t.isArrayExpression(parent.node) ||
  t.isObjectProperty(parent.node) ||
  t.isCallExpression(parent.node) ||
  t.isTemplateLiteral(parent.node);

export function getPausePoints(sourceId) {
  const state = [];
  traverseAst(sourceId, { enter: onEnter }, state);
  return state;
}

function formatNode(location, types) {
  return { location, types };
}

function onEnter(node, ancestors, state) {
  const parent = ancestors[ancestors.length - 1];

  if (isAssignment(node) || isImport(node) || isControlFlow(node)) {
    state.push(
      formatNode(node.loc.start, { breakpoint: true, stepOver: true })
    );
  }

  if (isReturn(node)) {
    if (t.isCallExpression(node.argument)) {
      state.push(
        formatNode(node.loc.start, { breakpoint: false, stepOver: false })
      );
    } else {
      state.push(
        formatNode(node.loc.start, { breakpoint: true, stepOver: true })
      );
    }
  }

  if (t.isCallExpression(node)) {
    state.push(
      formatNode(node.loc.start, {
        breakpoint: true,

        // NOTE: we do not want to land inside an expression e.g. [], {}, call
        stepOver: !inExpression(parent)
      })
    );
  }

  if (t.isDebuggerStatement(node)) {
    state.push(
      formatNode(node.loc.start, { breakpoint: true, stepOver: true })
    );
  }

  if (t.isFunction(node)) {
    const { line, column } = node.loc.end;
    state.push(formatNode(node.loc.start, { breakpoint: true }));
    state.push(
      formatNode(
        { line, column: column - 1 },
        { breakpoint: true, stepOver: true }
      )
    );
  }

  if (t.isProgram(node)) {
    const lastStatement = node.body[node.body.length - 1];
    state.push(
      formatNode(lastStatement.loc.end, { breakpoint: true, stepOver: true })
    );
  }
}
