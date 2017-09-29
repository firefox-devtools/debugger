import { getScopes } from ".";
import { replaceOriginalVariableName } from "devtools-map-bindings/src/utils";

/**
 * Gets information about original variable names from the source map
 * and replaces all posible generated names.
 */
export default async function getSourceMappedExpression(
  { sourceMaps },
  generatedLocation: Location,
  expression: string
): Promise<string> {
  const astScopes = await getScopes(generatedLocation);

  const generatedScopes = await sourceMaps.getLocationScopes(
    generatedLocation,
    astScopes
  );

  if (!generatedScopes) {
    return expression;
  }

  return replaceOriginalVariableName(expression, generatedScopes);
}
