import { actions, createStore, makeSource } from "../../../utils/test-head";
import { getPrettySourceURL } from "../../../utils/source";

import { createPrettySource } from "../createPrettySource";

const mockSourceMaps = {
  applySourceMap: jest.fn(),
  generatedToOriginalId: jest.fn()
};

describe("createPrettySource", () => {
  it("returns a pretty source for a minified file", async () => {
    const { dispatch, getState } = createStore();
    const url = "base.js";
    await dispatch(actions.newSource(makeSource(url)));
    const pretty = await createPrettySource(url, mockSourceMaps, getState);

    const prettyURL = getPrettySourceURL(url);
    expect(pretty.contentType).toEqual("text/javascript");
    expect(pretty.url.includes(prettyURL)).toEqual(true);
    expect(pretty).toMatchSnapshot();
  });
});
