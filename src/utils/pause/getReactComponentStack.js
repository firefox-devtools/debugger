import type { Frame } from "../../types";

export async function getReactComponentStack(rootFrame: Frame, dbgClient) {
  const components = [];
  let i = 0;
  while (true) {
    const reactInternalType = await dbgClient.evaluateInFrame(
      rootFrame.id,
      `this._reactInternalFiber${new Array(i)
        .fill("._debugOwner")
        .join("")}.type`
    );
    const { type, userDisplayName, displayName } = reactInternalType.result;
    if (type === "undefined") {
      break;
    }
    components.push(userDisplayName || displayName);
    i++;
  }
  return components;
}
