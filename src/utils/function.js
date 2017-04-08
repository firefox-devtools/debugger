// Decodes an anonymous naming scheme that
// spider monkey implements based on "Naming Anonymous JavaScript Functions"
// http://johnjbarton.github.io/nonymous/index.html
const objectProperty = /([\w\d]+)$/;
const arrayProperty = /\[(.*?)\]$/;
const functionProperty = /([\w\d]+)[\/\.<]*?$/;
const annonymousProperty = /([\w\d]+)\(\^\)$/;

export default function simplifyDisplayName(displayName) {
  const scenarios = [
    objectProperty,
    arrayProperty,
    functionProperty,
    annonymousProperty
  ];

  for (let reg of scenarios) {
    let match = reg.exec(displayName);
    if (match) {
      return match[1];
    }
  }

  return displayName;
}
