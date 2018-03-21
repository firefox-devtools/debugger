/* eslint max-nested-callbacks: ["error", 4]*/
import { formatPausePoints } from "../../../utils/pause/pausePoints";

import { getPausePoints } from "../pausePoints";
import { setSource } from "../sources";
import { getOriginalSource } from "./helpers";

describe("Parser.pausePoints", () => {
  it("pause-points", () => {
    const source = getOriginalSource("pause-points");
    setSource(source);
    const nodes = getPausePoints(source.id);
    expect(formatPausePoints(source.text, nodes)).toMatchSnapshot();
  });
});
