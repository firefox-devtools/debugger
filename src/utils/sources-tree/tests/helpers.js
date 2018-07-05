import { createSource } from "../../../reducers/sources";

export function createSources(urls) {
  return urls.reduce((sources, url, index) => {
    const id = `a${index}`;
    sources[id] = createSource({ url, id });
    return sources;
  }, {});
}

export function getChildNode(tree, ...path) {
  return path.reduce((child, index) => child.contents[index], tree);
}
