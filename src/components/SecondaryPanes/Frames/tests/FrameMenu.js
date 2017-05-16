const originalL10N = L10N;
import FrameMenu from "../FrameMenu";
import { showMenu } from "devtools-launchpad";
import { copyToTheClipboard } from "../../../../utils/clipboard";
jest.mock("devtools-launchpad", () => ({ showMenu: jest.fn() }));
jest.mock("../../../../utils/clipboard", () => ({
  copyToTheClipboard: jest.fn()
}));

function generateMockCopySource(label, accesskey) {
  return {
    id: "node-menu-copy-source",
    label: L10N.getStr(label),
    accesskey: L10N.getStr(accesskey),
    disabled: false,
    // TODO: find a jest equivilent for jasmine.any
    click: jasmine.any(Function) // eslint-disable-line no-undef
  };
}

describe("FrameMenu", () => {
  let mockEvent;
  let mockFrame;

  beforeEach(() => {
    L10N = { getStr: jest.fn(value => value) };
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
  afterAll(() => {
    L10N = originalL10N;
  });

  it("sends two element in menuOpts to showMenu if source is present", () => {
    const source = generateMockCopySource(
      "copySourceUrl",
      "copySourceUrl.accesskey"
    );
    const stacktrace = generateMockCopySource(
      "copyStackTrace",
      "copyStackTrace.accesskey"
    );

    FrameMenu(mockFrame, copyToTheClipboard, mockEvent);
    const receivedArray = showMenu.mock.calls[0][1];
    expect(showMenu).toHaveBeenCalledWith(mockEvent, receivedArray);
    expect(receivedArray[0]).toEqual(source);
    expect(receivedArray[1]).toEqual(stacktrace);
  });

  it("sends one element in menuOpts without source", () => {
    const stacktrace = generateMockCopySource(
      "copyStackTrace",
      "copyStackTrace.accesskey"
    );

    FrameMenu({}, copyToTheClipboard, mockEvent);
    const receivedArray = showMenu.mock.calls[0][1];
    expect(showMenu).toHaveBeenCalledWith(mockEvent, receivedArray);
    expect(receivedArray[0]).toEqual(stacktrace);
  });
});
