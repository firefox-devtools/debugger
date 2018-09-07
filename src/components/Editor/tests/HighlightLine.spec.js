/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { shallow } from "enzyme";
import HighlightLine from "../HighlightLine";
import { getDocument } from "../../../utils/editor/source-documents";

jest.mock("../../../utils/source", () => ({ isLoaded: () => true }));
jest.mock("../../../utils/editor/source-documents", () => ({
  getDocument: jest.fn(),
  hasDocument: jest.fn(() => true)
}));

const getDocumentMock = { addLineClass: jest.fn(), removeLineClass: jest.fn() };
getDocument.mockImplementation(() => getDocumentMock);

describe("HighlightLine", () => {
  describe("checking selectedLocation.noHighlightLine", () => {
    it("it highlights when noHighlightLine is undefined", async () => {
      getDocumentMock.addLineClass.mockClear();
      const props = { selectedLocation: { line: 1 } };
      const component = shallow(<HighlightLine.WrappedComponent />);
      component.setProps(props);
      expect(getDocumentMock.addLineClass).toHaveBeenCalled();
    });

    it("does not highlight when noHighlightLine is true", async () => {
      getDocumentMock.addLineClass.mockClear();
      const props = { selectedLocation: { line: 1, noHighlightLine: true } };
      const component = shallow(<HighlightLine.WrappedComponent />);
      component.setProps(props);
      expect(getDocumentMock.addLineClass).not.toHaveBeenCalled();
    });
  });
});
