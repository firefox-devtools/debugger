import { getSource } from "../selectors";

export async function getGeneratedLocation(
  state: Object,
  location: Location,
  sourceMaps: Object
) {
  if (!sourceMaps.isOriginalId(location.sourceId)) {
    return location;
  }

  const originalSource = getSource(state, location.sourceId).toJS();
  const { line, sourceId, column } = await sourceMaps.getGeneratedLocation(
    location,
    originalSource
  );

  const generatedSource = getSource(state, sourceId);
  const sourceUrl = generatedSource.get("url");
  return {
    line,
    sourceId,
    column: column === 0 ? undefined : column,
    sourceUrl
  };
}
