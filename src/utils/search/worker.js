import getMatches from "./get-matches";
import { findSourceMatches } from "./project-search";
import { workerUtils } from "devtools-utils";
const { workerHandler } = workerUtils;

self.onmessage = workerHandler({ getMatches, findSourceMatches });
