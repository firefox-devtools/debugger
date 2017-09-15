import { getSource } from "../selectors";

export async function getGeneratedLocation(
  state: Object,
  source: SourceRecord,
  location: Location,
  sourceMaps: Object
) {
  if (!sourceMaps.isOriginalId(location.sourceId)) {
    return location;
  }

  const { line, sourceId, column } = await sourceMaps.getGeneratedLocation(
    location,
    source
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
