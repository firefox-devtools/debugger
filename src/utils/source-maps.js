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

  const generatedLocation = await sourceMaps.getGeneratedLocation(
    location,
    source
  );
  const generatedSource = getSource(state, generatedLocation.sourceId);
  const sourceUrl = generatedSource.get("url");
  return { ...generatedLocation, sourceUrl };
}
