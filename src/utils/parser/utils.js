// @flow

import traverse from "babel-traverse";
import * as t from "babel-types";
import toPairs from "lodash/toPairs";
import isEmpty from "lodash/isEmpty";

import { getAst, traverseAst } from "./utils/ast";
import { isFunction, isVariable } from "./utils/helpers";
import { getClosestExpression, getClosestScope } from "./utils/closest";
