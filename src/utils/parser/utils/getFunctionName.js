export default function getFunctionName(path): string {
  if (path.node.id) {
    return path.node.id.name;
  }

  const parent = path.parent;
  if (parent.type == "ObjectProperty") {
    return parent.key.name;
  }

  if (parent.type == "ObjectExpression" || path.node.type == "ClassMethod") {
    return path.node.key.name;
  }

  if (parent.type == "VariableDeclarator") {
    return parent.id.name;
  }

  if (parent.type == "AssignmentExpression") {
    if (parent.left.type == "MemberExpression") {
      return parent.left.property.name;
    }

    return parent.left.name;
  }

  return "anonymous";
}
