import FrameMenu from "../FrameMenu";
import { kebabCase } from "lodash";
import { showMenu } from "devtools-launchpad";
import { copyToTheClipboard } from "../../../../utils/clipboard";
jest.mock("devtools-launchpad", () => ({ showMenu: jest.fn() }));
jest.mock("../../../../utils/clipboard", () => ({
  copyToTheClipboard: jest.fn()
}));

function generateMockId(labelString) {
  const label = L10N.getStr(labelString);
  return `node-menu-${kebabCase(label)}`;
}

describe("FrameMenu", () => {
  let mockEvent;
  let mockFrame;

  beforeEach(() => {
    mockFrame = {
      source: {
        url: "isFake"
      }
    };
    mockEvent = {
      stopPropagation: jest.fn(),
      preventDefault: jest.fn()
    };
  });

  afterEach(() => {
    showMenu.mockClear();
  });

  it("sends two element in menuOpts to showMenu if source is present", () => {
    const sourceId = generateMockId("copySourceUrl");
    const stacktraceId = generateMockId("copyStackTrace");

    FrameMenu(mockFrame, copyToTheClipboard, mockEvent);
    const receivedArray = showMenu.mock.calls[0][1];
    expect(showMenu).toHaveBeenCalledWith(mockEvent, receivedArray);
    const receivedArrayIds = receivedArray.map(item => item.id);
    expect(receivedArrayIds).toEqual([sourceId, stacktraceId]);
  });

  it("sends one element in menuOpts without source", () => {
    const stacktraceId = generateMockId("copyStackTrace");

    FrameMenu({}, copyToTheClipboard, mockEvent);
    const receivedArray = showMenu.mock.calls[0][1];
    expect(showMenu).toHaveBeenCalledWith(mockEvent, receivedArray);
    expect(receivedArray[0].id).toEqual(stacktraceId);
  });
});
