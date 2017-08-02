export default function remapLocations(breakpoints, sourceId, sourceMaps) {
  const sourceBreakpoints = breakpoints.map(async breakpoint => {
    if (breakpoint.location.sourceId !== sourceId) {
      return breakpoint;
    }
    const location = await sourceMaps.getOriginalLocation(breakpoint.location);
    return { ...breakpoint, location };
  });

  return Promise.all(sourceBreakpoints.valueSeq());
}
