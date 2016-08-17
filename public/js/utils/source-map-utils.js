
function makeOriginalSource({ url, source, id = 1 }) {
  const generatedSourceId = source.id;
  return {
    url,
    id: `${generatedSourceId}/originalSource${id}`,
    isPrettyPrinted: false
  };
}

module.exports = {
  makeOriginalSource
};
