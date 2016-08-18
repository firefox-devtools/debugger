
function getGeneratedSourceId(originalSource) {
  const match = originalSource.id.match(/(.*)\/originalSource/);
  return match ? match[1] : null;
}

function makeOriginalSource({ url, source, id = 1 }) {
  const generatedSourceId = source.id;
  return {
    url,
    id: `${generatedSourceId}/originalSource${id}`,
    isPrettyPrinted: false
  };
}

module.exports = {
  makeOriginalSource,
  getGeneratedSourceId
};
